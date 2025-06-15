
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Trash2, Loader2, Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const AdminPage = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [processing, setProcessing] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    const { data, error } = await supabase.storage.from('documents').list();
    if (error) {
      toast({ title: "錯誤", description: "無法讀取文件列表。", variant: "destructive" });
      console.error(error);
    } else {
      setFiles(data || []);
    }
    setLoadingFiles(false);
  };

  const fetchProcessingStatus = async () => {
    const { data, error } = await supabase
      .from('document_processing')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching processing status:', error);
    } else {
      setProcessing(data || []);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchProcessingStatus();
    
    // Set up real-time updates for processing status
    const channel = supabase
      .channel('processing-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'document_processing'
      }, () => {
        fetchProcessingStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      handleUpload(event.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const filePath = `${file.name}`;
    const { error } = await supabase.storage.from('documents').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
    setUploading(false);

    if (error) {
      toast({ title: "上傳失敗", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "上傳成功", description: `${file.name} 已成功上傳。` });
      fetchFiles();
      fetchProcessingStatus();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileName: string) => {
    const { error } = await supabase.storage.from('documents').remove([fileName]);
    if (error) {
      toast({ title: "刪除失敗", description: error.message, variant: "destructive" });
    } else {
      // Also delete processing records and chunks
      await supabase.from('document_processing').delete().eq('document_name', fileName);
      await supabase.from('document_chunks').delete().eq('document_name', fileName);
      
      toast({ title: "刪除成功", description: `${fileName} 已被刪除。` });
      fetchFiles();
      fetchProcessingStatus();
    }
  };

  const handleProcessDocument = async (fileName: string) => {
    try {
      const { error } = await supabase.functions.invoke('process-document', {
        body: { documentName: fileName }
      });

      if (error) {
        toast({ 
          title: "處理失敗", 
          description: error.message, 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "開始處理", 
          description: `${fileName} 開始進行 RAG 處理。` 
        });
        fetchProcessingStatus();
      }
    } catch (error: any) {
      toast({ 
        title: "處理失敗", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const getProcessingStatus = (fileName: string) => {
    return processing.find(p => p.document_name === fileName);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '處理中';
      case 'failed':
        return '失敗';
      default:
        return '等待中';
    }
  };

  const PageContent = () => {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>上傳新文件</CardTitle>
            <CardDescription>選擇一個 PDF 文件上傳到知識庫。如果檔案名稱重複，將會覆蓋舊檔案。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
                accept=".pdf"
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? '上傳中...' : '選擇 PDF 檔案'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>已上傳的文件</CardTitle>
            <CardDescription>這些文件將會被用於 RAG 應答。點擊「處理」按鈕將文件分割並生成向量嵌入。</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFiles ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : files.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {files.map(file => {
                  const processingInfo = getProcessingStatus(file.name);
                  return (
                    <li key={file.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <span className="text-sm font-medium text-gray-800">{file.name}</span>
                          {processingInfo && (
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusIcon(processingInfo.status)}
                              <span className="text-xs text-gray-600">
                                {getStatusText(processingInfo.status)}
                                {processingInfo.chunks_count > 0 && ` (${processingInfo.chunks_count} 片段)`}
                              </span>
                            </div>
                          )}
                          {processingInfo?.error_message && (
                            <div className="text-xs text-red-600 mt-1">
                              錯誤: {processingInfo.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleProcessDocument(file.name)}
                          disabled={processingInfo?.status === 'processing'}
                        >
                          {processingInfo?.status === 'processing' ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Brain className="h-4 w-4 mr-2" />
                          )}
                          {processingInfo?.status === 'completed' ? '重新處理' : '處理'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(file.name)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          刪除
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-sm text-gray-500 py-8">尚未上傳任何文件。</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageContent />
      </main>
    </div>
  );
};

export default AdminPage;
