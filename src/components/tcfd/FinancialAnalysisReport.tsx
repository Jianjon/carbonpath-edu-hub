
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';
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
      title: '1. 損益表影響分析',
      content: analysis.profitLossAnalysis
    },
    {
      title: '2. 現金流影響分析',
      content: analysis.cashFlowAnalysis
    },
    {
      title: '3. 資產負債表影響分析',
      content: analysis.balanceSheetAnalysis
    },
    {
      title: '4. 策略可行性與補充說明',
      content: analysis.strategyFeasibilityAnalysis
    },
    {
      title: '5. 分析建議方法',
      content: analysis.analysisMethodology
    },
    {
      title: '6. 財務連結的計算方法建議',
      content: analysis.calculationMethodSuggestions
    }
  ];

  return (
    <Card className="mt-6 border border-gray-200">
      <CardHeader className="border-b border-gray-100 bg-gray-50">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <BarChart3 className="h-5 w-5 text-gray-600" />
          <span className="text-gray-800">財務影響分析與計算建議</span>
        </CardTitle>
        <div className="flex items-center space-x-2 mt-2">
          <Badge variant={isRisk ? "destructive" : "default"} className="text-xs">
            {scenarioTitle}
          </Badge>
          <Badge variant="outline" className="text-xs">
            策略: {strategyType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sections.map((section, index) => (
          <div key={index} className="p-6 border-b border-gray-100 last:border-b-0">
            <h4 className="font-semibold text-gray-800 mb-3 text-sm">
              {section.title}
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
        
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2 text-sm">分析說明</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                本分析基於 TCFD 財務影響分類邏輯，提供結構化的財務評估框架與計算方法建議。
                請企業結合實際營運資料，進行更深入的量化分析與情境模擬。計算公式僅供參考，實際應用時請依企業狀況調整。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialAnalysisReport;
