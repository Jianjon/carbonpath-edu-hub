
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Loader2, Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface FileListItemProps {
  file: any;
  processingInfo: any;
  onProcess: (fileName: string) => void;
  onDelete: (fileName: string) => void;
}

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


const FileListItem = ({ file, processingInfo, onProcess, onDelete }: FileListItemProps) => {
  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-3">
        <FileText className="h-5 w-5 text-gray-500" />
        <div>
          <span className="text-sm font-medium text-gray-800 break-all">{file.name}</span>
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
          onClick={() => onProcess(file.name)}
          disabled={processingInfo?.status === 'processing'}
        >
          {processingInfo?.status === 'processing' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          {processingInfo?.status === 'completed' ? '重新處理' : '處理'}
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(file.name)}>
          <Trash2 className="h-4 w-4 mr-2" />
          刪除
        </Button>
      </div>
    </li>
  );
};

export default FileListItem;
