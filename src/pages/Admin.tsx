
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, Trash2, Loader2, ShieldX } from 'lucide-react';

const AdminPage = () => {
  const { user, isAdmin, loading } = useProfile();
  const [files, setFiles] = useState<any[]>([]);
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

  useEffect(() => {
    if (!loading && isAdmin) {
      fetchFiles();
    } else if (!loading && !isAdmin) {
      setLoadingFiles(false);
    }
  }, [isAdmin, loading]);

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
      toast({ title: "刪除成功", description: `${fileName} 已被刪除。` });
      fetchFiles();
    }
  };

  const PageContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (!user || !isAdmin) {
      return (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>權限不足</CardTitle>
            <CardDescription>只有管理員可以存取此頁面。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <ShieldX className="h-16 w-16 text-red-500" />
              <p>請使用管理員帳號登入以繼續。</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>上傳新文件</CardTitle>
            <CardDescription>選擇一個文件上傳到知識庫。如果檔案名稱重複，將會覆蓋舊檔案。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? '上傳中...' : '選擇檔案'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>已上傳的文件</CardTitle>
            <CardDescription>這些文件將會被用於 RAG 應答。</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFiles ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : files.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {files.map(file => (
                  <li key={file.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-800">{file.name}</span>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(file.name)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      刪除
                    </Button>
                  </li>
                ))}
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
