
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useDocuments } from '@/hooks/useDocuments';
import FileUpload from '@/components/admin/FileUpload';
import FileList from '@/components/admin/FileList';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    files,
    processing,
    progress,
    uploading,
    loadingFiles,
    handleUpload,
    handleDelete,
    handleProcessDocument,
    handleReprocessIncomplete,
  } = useDocuments();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/auth');
    }
  }, [isAdmin, authLoading, navigate]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">正在驗證身份...</p>
        </div>
      </div>
    );
  }

  // 檢查是否有未完成的處理
  const incompleteProcessing = processing.filter(p => p.status === 'failed' || p.status === 'pending');
  const hasIncompleteFiles = incompleteProcessing.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <FileUpload onFileUpload={handleUpload} isUploading={uploading} />
          
          {/* 暫時隱藏重新處理按鈕 */}
          {false && hasIncompleteFiles && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    發現 {incompleteProcessing.length} 個未完成的文件處理
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    這些文件的處理可能因為錯誤而中斷，您可以一鍵重新處理它們。
                  </p>
                </div>
                <Button
                  onClick={handleReprocessIncomplete}
                  variant="outline"
                  size="sm"
                  className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新處理全部
                </Button>
              </div>
            </div>
          )}

          <FileList
            files={files}
            processing={processing}
            progress={progress}
            isLoading={loadingFiles}
            onProcess={handleProcessDocument}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
