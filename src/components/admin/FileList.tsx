
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import FileListItem from './FileListItem';

interface FileListProps {
  files: any[];
  processing: any[];
  progress: Record<string, number>;
  isLoading: boolean;
  onProcess: (fileName: string) => void;
  onDelete: (fileName: string) => void;
}

const FileList = ({ files, processing, progress, isLoading, onProcess, onDelete }: FileListProps) => {
  
  const getProcessingStatus = (fileName: string) => {
    return processing.find(p => p.document_name === fileName);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>已上傳的文件</CardTitle>
        <CardDescription>這些文件將會被用於 RAG 應答。點擊「處理」按鈕將文件分割並生成向量嵌入。</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : files.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {files.map(file => (
              <FileListItem
                key={file.id}
                file={file}
                processingInfo={getProcessingStatus(file.name)}
                processedCount={progress[file.name]}
                onProcess={onProcess}
                onDelete={onDelete}
              />
            ))}
          </ul>
        ) : (
          <p className="text-center text-sm text-gray-500 py-8">尚未上傳任何文件。</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FileList;
