
import Navigation from '@/components/Navigation';
import { useDocuments } from '@/hooks/useDocuments';
import FileUpload from '@/components/admin/FileUpload';
import FileList from '@/components/admin/FileList';

const AdminPage = () => {
  const {
    files,
    processing,
    uploading,
    loadingFiles,
    handleUpload,
    handleDelete,
    handleProcessDocument,
  } = useDocuments();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <FileUpload onFileUpload={handleUpload} isUploading={uploading} />
          <FileList
            files={files}
            processing={processing}
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
