
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TCFDProgressCardProps {
  title: string;
  description: string;
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  status?: 'pending' | 'in-progress' | 'completed';
  children?: React.ReactNode;
}

export const TCFDProgressCard: React.FC<TCFDProgressCardProps> = ({
  title,
  description,
  progress,
  status = 'pending',
  children
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 shadow-sm';
      case 'in-progress': return 'bg-blue-50 border-blue-200 shadow-sm';
      default: return 'bg-slate-50 border-slate-200 shadow-sm';
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-800 border-green-300 font-medium px-3 py-1">已完成</Badge>;
      case 'in-progress': return <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-medium px-3 py-1">進行中</Badge>;
      default: return <Badge variant="outline" className="bg-slate-100 text-slate-700 font-medium px-3 py-1">待處理</Badge>;
    }
  };

  return (
    <Card className={`${getStatusColor()} border-2 hover:shadow-md transition-shadow duration-200`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 text-base mb-1 tracking-wide">{title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">{description}</p>
            {progress && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">
                    {progress.label || '進度'}: {progress.current}/{progress.total}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {Math.round((progress.current / progress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-slate-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div className="ml-4">
            {getStatusBadge()}
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

export default TCFDProgressCard;
