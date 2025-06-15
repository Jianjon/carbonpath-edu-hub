import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Helper function to sanitize file names
const sanitizeFileName = (fileName: string): string => {
  const sanitized = fileName
    .replace(/[^\w\s.-]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return sanitized || 'document';
};

type DocumentProcessing = Database['public']['Tables']['document_processing']['Row'];
type DocumentChunk = Database['public']['Tables']['document_chunks']['Row'];

export const useDocuments = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [processing, setProcessing] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase.storage.from('documents').list();
    if (error) {
      toast({ title: "錯誤", description: "無法讀取文件列表。", variant: "destructive" });
    } else {
      setFiles(data || []);
    }
    setLoadingFiles(false);
  }, [toast]);

  const fetchProcessingStatus = useCallback(async () => {
    const { data, error } = await supabase
      .from('document_processing')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching processing status:', error);
    } else {
      const processingData = data || [];
      setProcessing(processingData);

      const processingDocs = processingData.filter(d => d.status === 'processing' && d.chunks_count > 0);
      for (const doc of processingDocs) {
        const { count } = await supabase
          .from('document_chunks')
          .select('id', { count: 'exact', head: true })
          .eq('document_name', doc.document_name);
        
        if (count !== null) {
          setProgress(prev => ({
            ...prev,
            [doc.document_name]: count,
          }));
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchProcessingStatus();
    
    const processingChannel = supabase
      .channel('processing-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'document_processing'
      }, (payload: RealtimePostgresChangesPayload<DocumentProcessing>) => {
        fetchProcessingStatus();
        if (payload.new?.status === 'completed' || payload.new?.status === 'failed') {
          setProgress(prev => {
            const newProgress = { ...prev };
            if (payload.new.document_name) {
              delete newProgress[payload.new.document_name];
            }
            return newProgress;
          });
        }
      })
      .subscribe();
      
    const chunksChannel = supabase
      .channel('document-chunks-inserts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'document_chunks'
      }, (payload: RealtimePostgresChangesPayload<DocumentChunk>) => {
        const docName = payload.new.document_name;
        if (docName) {
          setProgress(prev => ({
            ...prev,
            [docName]: (prev[docName] || 0) + 1
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(processingChannel);
      supabase.removeChannel(chunksChannel);
    };
  }, [fetchFiles, fetchProcessingStatus]);

  const handleUpload = async (file: File): Promise<void> => {
    setUploading(true);
    
    const fileExtension = file.name.split('.').pop() || '';
    const baseName = file.name.replace(`.${fileExtension}`, '');
    
    const sanitizedBaseName = sanitizeFileName(baseName);
    const timestamp = Date.now();
    const sanitizedFileName = `${sanitizedBaseName}_${timestamp}.${fileExtension}`;
    
    console.log(`Uploading file: ${file.name} as ${sanitizedFileName}`);
    
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(sanitizedFileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) {
        console.error('Upload error:', error);
        toast({ 
          title: "上傳失敗", 
          description: `錯誤: ${error.message}`, 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "上傳成功", 
          description: `檔案已成功上傳為: ${sanitizedFileName}` 
        });
        await fetchFiles();
        await fetchProcessingStatus();
      }
    } catch (err: any) {
      console.error('Unexpected error during upload:', err);
      toast({ 
        title: "上傳失敗", 
        description: `未預期的錯誤: ${err.message}`, 
        variant: "destructive" 
      });
    }
    
    setUploading(false);
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage.from('documents').remove([fileName]);
    if (error) {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    } else {
      await supabase.from('document_processing').delete().eq('document_name', fileName);
      await supabase.from('document_chunks').delete().eq('document_name', fileName);
      
      toast({ title: "刪除成功", description: `${fileName} 已被刪除。` });
      
      setProgress(prev => {
        const newProgress = {...prev};
        delete newProgress[fileName];
        return newProgress;
      });

      await fetchFiles();
      await fetchProcessingStatus();
    }
  };

  const handleProcessDocument = async (fileName: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-document', {
        body: { documentName: fileName }
      });

      if (error) {
        toast({ title: "處理失敗", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "開始處理", description: `${fileName} 開始進行 RAG 處理。` });
        await fetchProcessingStatus();
      }
    } catch (error: any) {
      toast({ title: "處理失敗", description: error.message, variant: "destructive" });
    }
  };

  return {
    files,
    processing,
    progress,
    uploading,
    loadingFiles,
    handleUpload,
    handleDelete,
    handleProcessDocument,
  };
};
