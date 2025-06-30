
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface TCFDLayoutProps {
  stage: string;
  title: string;
  description: string;
  icon: LucideIcon;
  assessment?: {
    company_size: string;
    industry: string;
  };
  children: React.ReactNode;
}

const getChineseText = (text: string): string => {
  const translations: Record<string, string> = {
    // 公司規模
    'medium': '中型企業',
    'large': '大型企業', 
    'small': '小型企業',
    // 產業別
    'hospitality': '旅宿業',
    'manufacturing': '製造業',
    'technology': '科技業',
    'finance': '金融業',
    'retail': '零售業',
    'healthcare': '醫療業',
    'education': '教育業',
    'construction': '建築業',
    'transportation': '運輸業',
    'restaurant': '餐飲業'
  };
  return translations[text] || text;
};

export const TCFDLayout: React.FC<TCFDLayoutProps> = ({
  stage,
  title,
  description,
  icon: Icon,
  assessment,
  children
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 統一的標題區 - 增強設計風格 */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 shadow-sm">
        <CardHeader className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center shadow-md">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 tracking-wide">
                {stage}：{title}
              </CardTitle>
            </div>
          </div>
          <p className="text-slate-600 text-base leading-relaxed max-w-3xl mx-auto font-medium">
            {description}
          </p>
          {assessment && (
            <div className="flex justify-center space-x-3 pt-2">
              <Badge variant="outline" className="bg-white text-slate-700 border-slate-300 px-3 py-1 font-medium shadow-sm">
                {getChineseText(assessment.company_size)}
              </Badge>
              <Badge variant="outline" className="bg-white text-slate-700 border-slate-300 px-3 py-1 font-medium shadow-sm">
                {getChineseText(assessment.industry)}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* 內容區 */}
      {children}
    </div>
  );
};

export default TCFDLayout;
