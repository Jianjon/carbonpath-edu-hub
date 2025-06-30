
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface GeneratedAnalysis {
  profitLossAnalysis: string;
  cashFlowAnalysis: string;
  balanceSheetAnalysis: string;
  strategyFeasibilityAnalysis: string;
  analysisMethodology: string;
  calculationMethodSuggestions: string;
}

const TCFDStage4 = ({ assessment, onComplete }: TCFDStage4Props) => {
  const [stage3Results, setStage3Results] = useState<Stage3Results | null>(null);
  const [userModifications, setUserModifications] = useState<Record<string, string>>({});
  const [generatedAnalyses, setGeneratedAnalyses] = useState<Record<string, GeneratedAnalysis>>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<Set<string>>(new Set());

  // 參數中文對映
  const getChineseText = (text: string): string => {
    const translations: Record<string, string> = {
      'medium': '中型',
      'large': '大型',
      'small': '小型',
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

  // 策略類型映射
  const strategyMapping: Record<string, string> = {
    'mitigate': '減緩策略',
    'transfer': '轉移策略',
    'accept': '接受策略',
    'control': '控制策略',
    'explore': '探索策略',
    'build': '建設策略',
    'transform': '轉換策略',
    'collaborate': '合作策略',
    'invest': '投入策略'
  };

  useEffect(() => {
    // 嘗試從 sessionStorage 讀取第三階段的結果
    const storedStage3Results = sessionStorage.getItem('tcfd-stage3-results');
    if (storedStage3Results) {
      try {
        const results: Stage3Results = JSON.parse(storedStage3Results);
        setStage3Results(results);
        console.log('第四階段成功載入第三階段結果:', results);
        
        // 自動為所有策略生成分析
        results.strategySelections.forEach(selection => {
          generateAnalysisForStrategy(selection);
        });
      } catch (error) {
        console.error('解析第三階段結果失敗:', error);
      }
    }
  }, []);

  const generateAnalysisForStrategy = async (selection: SelectedStrategyData) => {
    const key = selection.scenarioKey;
    
    if (generatedAnalyses[key] || loadingAnalyses.has(key)) {
      return; // 已經有分析內容或正在載入中
    }

    setLoadingAnalyses(prev => new Set(prev).add(key));
    
    try {
      const strategyName = strategyMapping[selection.strategy] || selection.strategy;
      const industryName = getChineseText(assessment.industry);
      const companySize = getChineseText(assessment.company_size);

      const analysisInput = {
        categoryType: selection.categoryType,
        categoryName: selection.categoryName,
        subcategoryName: selection.subcategoryName,
        scenarioDescription: selection.scenarioDescription,
        selectedStrategy: selection.strategy,
        strategyName: strategyName,
        companyProfile: {
          industry: assessment.industry,
          size: assessment.company_size,
          industryText: industryName,
          sizeText: companySize,
          hasInternationalOperations: assessment.has_international_operations,
          hasCarbonInventory: assessment.has_carbon_inventory,
          mainEmissionSource: assessment.main_emission_source,
          businessDescription: assessment.business_description,
          annualRevenueRange: assessment.annual_revenue_range
        },
        userNotes: selection.notes || userModifications[selection.scenarioKey] || ''
      };

      const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
        body: {
          type: 'generate_stage4_analysis',
          ...analysisInput
        },
      });

      if (error) throw error;

      setGeneratedAnalyses(prev => ({
        ...prev,
        [key]: data.analysis
      }));

    } catch (error) {
      console.error('AI分析生成錯誤:', error);
      toast.error('分析生成失敗，請重試');
    } finally {
      setLoadingAnalyses(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const handleNotesChange = (scenarioKey: string, notes: string) => {
    setUserModifications(prev => ({
      ...prev,
      [scenarioKey]: notes
    }));
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
      generatedAnalyses: generatedAnalyses,
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
            基於前階段選擇的策略，系統將運用 AI 生成詳細的財務影響分析。您可以針對每個情境補充說明策略執行的具體細節。
          </p>
        </CardContent>
      </Card>

      {stage3Results.strategySelections.map((selection) => {
        const isLoading = loadingAnalyses.has(selection.scenarioKey);
        const analysis = generatedAnalyses[selection.scenarioKey];
        
        return (
          <Card key={selection.scenarioKey}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{selection.categoryName} - {selection.subcategoryName}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateAnalysisForStrategy(selection)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      重新生成
                    </>
                  )}
                </Button>
              </div>
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
                  value={strategyMapping[selection.strategy] || selection.strategy}
                  readOnly
                />
              </div>

              {/* AI 生成的量化分析結果 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-3">AI 生成量化分析結果</h4>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-gray-600">正在生成財務分析...</span>
                  </div>
                ) : analysis ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span className="font-medium text-blue-700 text-sm">1. 損益表影響分析</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.profitLossAnalysis}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-green-200">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span className="font-medium text-green-700 text-sm">2. 現金流影響分析</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.cashFlowAnalysis}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
                        <span className="font-medium text-gray-700 text-sm">3. 資產負債影響分析</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.balanceSheetAnalysis}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-pink-200">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-pink-500 rounded mr-2"></div>
                        <span className="font-medium text-pink-700 text-sm">4. 策略可행성說明</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.strategyFeasibilityAnalysis}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-purple-200">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                        <span className="font-medium text-purple-700 text-sm">5. 分析方法說明</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.analysisMethodology}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-orange-200">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                        <span className="font-medium text-orange-700 text-sm">6. 財務計算建議說明</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{analysis.calculationMethodSuggestions}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    請點擊「重新生成」按鈕來生成分析內容
                  </div>
                )}
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
