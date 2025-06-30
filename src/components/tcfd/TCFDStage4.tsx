

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FinancialAnalysisInput, generateFinancialAnalysis } from '@/services/tcfd/financialAnalysisService';

interface TCFDStage4Props {
  assessment: any;
  onComplete: () => void;
}

interface SelectedStrategyData {
  scenarioKey: string;
  riskOpportunityId: string;
  strategy: string;
  scenarioDescription: string;
  categoryType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  notes: string;
}

interface Stage3Results {
  assessment: any;
  strategySelections: SelectedStrategyData[];
}

const TCFDStage4 = ({ assessment, onComplete }: TCFDStage4Props) => {
  const [stage3Results, setStage3Results] = useState<Stage3Results | null>(null);
  const [userModifications, setUserModifications] = useState<Record<string, string>>({});

  useEffect(() => {
    // 嘗試從 sessionStorage 讀取第三階段的結果
    const storedStage3Results = sessionStorage.getItem('tcfd-stage3-results');
    if (storedStage3Results) {
      try {
        const results: Stage3Results = JSON.parse(storedStage3Results);
        setStage3Results(results);
        console.log('第四階段成功載入第三階段結果:', results);
      } catch (error) {
        console.error('解析第三階段結果失敗:', error);
      }
    }
  }, []);

  const handleNotesChange = (scenarioKey: string, notes: string) => {
    setUserModifications(prev => ({
      ...prev,
      [scenarioKey]: notes
    }));
  };

  const generateStrategyFinancialAnalysis = (selection: SelectedStrategyData) => {
    const financialInput: FinancialAnalysisInput = {
      riskOrOpportunityType: selection.categoryType,
      categoryName: selection.categoryName,
      subcategoryName: selection.subcategoryName,
      scenarioDescription: selection.scenarioDescription,
      selectedStrategy: selection.strategy,
      strategyNotes: selection.notes || userModifications[selection.scenarioKey] || '',
      companyProfile: {
        industry: assessment.industry,
        size: assessment.company_size,
        hasInternationalOperations: assessment.has_international_operations || false,
        hasCarbonInventory: assessment.has_carbon_inventory,
        mainEmissionSource: assessment.main_emission_source || ''
      }
    };

    return generateFinancialAnalysis(financialInput);
  };

  const handleComplete = () => {
    if (!stage3Results) {
      toast.error('請先完成第三階段');
      return;
    }

    // 儲存第四階段結果到 sessionStorage
    const stage4Results = {
      assessment: assessment,
      strategySelections: stage3Results.strategySelections,
      userModifications: userModifications,
      completedAt: new Date().toISOString()
    };
    sessionStorage.setItem('tcfd-stage4-results', JSON.stringify(stage4Results));
    console.log('第四階段結果已儲存到 sessionStorage:', stage4Results);

    onComplete();
  };

  if (!stage3Results || !stage3Results.strategySelections) {
    return (
      <div className="text-center py-8">
        <p>請先完成第三階段的分析。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>策略與財務分析</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            請針對每個情境，補充說明策略執行的具體細節與預期效益。
          </p>
        </CardContent>
      </Card>

      {stage3Results.strategySelections.map((selection) => {
        const financialAnalysis = generateStrategyFinancialAnalysis(selection);
        
        return (
          <Card key={selection.scenarioKey}>
            <CardHeader>
              <CardTitle>{selection.categoryName} - {selection.subcategoryName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`scenario-${selection.scenarioKey}`} className="text-sm font-medium text-gray-700">
                  情境描述
                </Label>
                <Input
                  id={`scenario-${selection.scenarioKey}`}
                  className="mt-1"
                  value={selection.scenarioDescription}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor={`strategy-${selection.scenarioKey}`} className="text-sm font-medium text-gray-700">
                  選擇的策略
                </Label>
                <Input
                  id={`strategy-${selection.scenarioKey}`}
                  className="mt-1"
                  value={selection.strategy}
                  readOnly
                />
              </div>

              {/* 量化分析結果 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">量化分析結果</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                      <span className="font-medium text-blue-700 text-sm">1. 損益表影響分析</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{financialAnalysis.profitLossAnalysis}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                      <span className="font-medium text-green-700 text-sm">2. 現金流影響分析</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{financialAnalysis.cashFlowAnalysis}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                      <span className="font-medium text-gray-700 text-sm">3. 資產負債影響分析</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{financialAnalysis.balanceSheetAnalysis}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-pink-200">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-pink-500 rounded mr-2"></div>
                      <span className="font-medium text-pink-700 text-sm">4. 策略可行性說明</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{financialAnalysis.strategyFeasibilityAnalysis}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-200">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                      <span className="font-medium text-purple-700 text-sm">5. 分析方法說明</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{financialAnalysis.analysisMethodology}</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-orange-200">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                      <span className="font-medium text-orange-700 text-sm">6. 財務計算建議說明</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{financialAnalysis.calculationMethodSuggestions}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor={`notes-${selection.scenarioKey}`} className="text-sm font-medium text-gray-700">
                  企業可依項目情況補充
                </Label>
                <Textarea
                  id={`notes-${selection.scenarioKey}`}
                  className="mt-1"
                  placeholder="請補充企業實際情形或財務影響相關補充說明"
                  value={userModifications[selection.scenarioKey] || ''}
                  onChange={(e) => handleNotesChange(selection.scenarioKey, e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <Button onClick={handleComplete}>
          下一步
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage4;

