
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Trash2, Loader2, Brain, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface FileListItemProps {
  file: any;
  processingInfo: any;
  processedCount?: number;
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


const FileListItem = ({ file, processingInfo, processedCount, onProcess, onDelete }: FileListItemProps) => {
  const isProcessing = processingInfo?.status === 'processing';
  const totalChunks = processingInfo?.chunks_count || 0;
  const showProgress = isProcessing && totalChunks > 0 && processedCount !== undefined;
  const progressValue = totalChunks > 0 ? ((processedCount || 0) / totalChunks) * 100 : 0;

  return (
    <li className="flex items-center justify-between py-4 gap-4">
      <div className="flex-grow flex items-center space-x-3 min-w-0">
        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-grow min-w-0 space-y-1">
          <span className="text-sm font-medium text-gray-800 break-words">{file.name}</span>
          
          {showProgress ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Progress value={progressValue} className="h-2 flex-grow" />
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
              </div>
              <span className="text-xs text-gray-600">
                處理中... ({processedCount}/{totalChunks} 片段)
              </span>
            </div>
          ) : processingInfo ? (
            <div className="flex items-center space-x-2">
              {getStatusIcon(processingInfo.status)}
              <span className="text-xs text-gray-600">
                {getStatusText(processingInfo.status)}
                {processingInfo.status === 'completed' && processingInfo.chunks_count > 0 && ` (${processingInfo.chunks_count} 片段)`}
              </span>
            </div>
          ) : null}

          {processingInfo?.error_message && (
            <div className="text-xs text-red-600 truncate" title={processingInfo.error_message}>
              錯誤: {processingInfo.error_message}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onProcess(file.name)}
          disabled={isProcessing}
        >
          {isProcessing ? (
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
