
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface TCFDContentCardProps {
  title: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  };
  className?: string;
  children: React.ReactNode;
}

export const TCFDContentCard: React.FC<TCFDContentCardProps> = ({
  title,
  icon: Icon,
  badge,
  className = '',
  children
}) => {
  return (
    <Card className={`border-slate-200 ${className}`}>
      <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-slate-800">
            {Icon && <Icon className="h-5 w-5 text-slate-600" />}
            <span>{title}</span>
          </CardTitle>
          {badge && (
            <Badge variant={badge.variant || 'outline'} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default TCFDContentCard;
