
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, BarChart3, Target, Lightbulb } from 'lucide-react';
import { FinancialAnalysisOutput } from '@/services/tcfd/financialAnalysisService';

interface FinancialAnalysisReportProps {
  analysis: FinancialAnalysisOutput;
  scenarioTitle: string;
  strategyType: string;
  isRisk: boolean;
}

const FinancialAnalysisReport = ({ 
  analysis, 
  scenarioTitle, 
  strategyType, 
  isRisk 
}: FinancialAnalysisReportProps) => {
  const sections = [
    {
      title: '損益表影響分析',
      content: analysis.profitLossAnalysis,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '現金流分析',
      content: analysis.cashFlowAnalysis,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '資產負債表影響分析',
      content: analysis.balanceSheetAnalysis,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '建議分析方式',
      content: analysis.analysisMethodology,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: '策略配合說明',
      content: analysis.strategyRationale,
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <Card className="mt-6 border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <span>財務影響分析報告</span>
        </CardTitle>
        <div className="flex items-center space-x-2 mt-2">
          <Badge variant={isRisk ? "destructive" : "default"}>
            {scenarioTitle}
          </Badge>
          <Badge variant="outline">
            策略: {strategyType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <div key={index} className={`p-4 rounded-lg ${section.bgColor}`}>
              <div className="flex items-start space-x-3">
                <IconComponent className={`h-5 w-5 ${section.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1">
                  <h4 className={`font-medium ${section.color} mb-2`}>
                    {section.title}
                  </h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-500">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">分析說明</h4>
              <p className="text-xs text-gray-600">
                本分析基於 TCFD 財務影響分類邏輯，提供結構化的財務評估框架。
                建議結合企業實際營運資料，進行更深入的量化分析與情境模擬。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialAnalysisReport;
