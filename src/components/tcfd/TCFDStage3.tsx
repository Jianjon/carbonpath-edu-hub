
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, Sparkles, AlertTriangle, TrendingUp, BarChart3, DollarSign, Building, CheckCircle, Calculator, LinkIcon, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

interface ScenarioAnalysisData {
  riskOpportunityId: string;
  categoryName: string;
  categoryType: 'risk' | 'opportunity';
  subcategoryName: string;
  scenarioDescription: string;
  impactScore: number;
  affectedAssets: string[];
  timeHorizon: string;
  financialAnalysis: {
    profitLossAnalysis: string;
    cashFlowAnalysis: string;
    balanceSheetAnalysis: string;
    strategyFeasibility: string;
    analysisMethodology: string;
    calculationLogic: string;
  } | null;
}

const AFFECTED_ASSETS = [
  '生產設備', '辦公設施', '倉儲物流', '資訊系統', '人力資源', 
  '供應鏈', '客戶關係', '品牌聲譽', '知識產權', '財務資產'
];

const TIME_HORIZONS = [
  { value: 'short', label: '短期（1-3年）' },
  { value: 'medium', label: '中期（3-10年）' },
  { value: 'long', label: '長期（10年以上）' }
];

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections, loadRiskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment.id);
  const { 
    scenarioEvaluations,
    generateScenarioWithLLM,
    generateComprehensiveScenarioAnalysis,
    saveScenarioEvaluation,
    loadScenarioEvaluations
  } = useTCFDScenarioEvaluations(assessment.id);
  
  const [scenarioAnalyses, setScenarioAnalyses] = useState<Record<string, ScenarioAnalysisData>>({});
  const [loadingScenarios, setLoadingScenarios] = useState<Set<string>>(new Set());
  const [generatingAnalysis, setGeneratingAnalysis] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRiskOpportunitySelections();
    loadScenarioEvaluations();
  }, []);

  useEffect(() => {
    // 當選擇和評估資料載入後，初始化情境分析資料
    const selectedItems = riskOpportunitySelections.filter(item => item.selected);
    const initialAnalyses: Record<string, ScenarioAnalysisData> = {};

    selectedItems.forEach(item => {
      const existingEvaluation = scenarioEvaluations.find(
        evaluation => evaluation.risk_opportunity_id === item.id
      );

      initialAnalyses[item.id] = {
        riskOpportunityId: item.id,
        categoryName: item.category_name,
        categoryType: item.category_type as 'risk' | 'opportunity',
        subcategoryName: item.subcategory_name || '',
        scenarioDescription: existingEvaluation?.scenario_description || '',
        impactScore: existingEvaluation?.user_score || 5,
        affectedAssets: [],
        timeHorizon: 'medium',
        financialAnalysis: existingEvaluation?.llm_response ? 
          JSON.parse(existingEvaluation.llm_response).financial_impact || null : null
      };
    });

    setScenarioAnalyses(initialAnalyses);
  }, [riskOpportunitySelections, scenarioEvaluations]);

  const handleGenerateScenario = async (itemId: string) => {
    const item = riskOpportunitySelections.find(r => r.id === itemId);
    if (!item) return;

    setLoadingScenarios(prev => new Set([...prev, itemId]));
    
    try {
      const response = await generateScenarioWithLLM(
        item.category_type as 'risk' | 'opportunity',
        item.category_name,
        item.subcategory_name || '',
        assessment.industry
      );

      setScenarioAnalyses(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          scenarioDescription: response.scenario_description
        }
      }));

      toast.success('情境描述已生成');
    } catch (error) {
      console.error('生成情境描述失敗:', error);
      toast.error('生成情境描述失敗');
    } finally {
      setLoadingScenarios(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleGenerateComprehensiveAnalysis = async (itemId: string) => {
    const analysis = scenarioAnalyses[itemId];
    if (!analysis || !analysis.scenarioDescription) {
      toast.error('請先生成情境描述');
      return;
    }

    setGeneratingAnalysis(prev => new Set([...prev, itemId]));

    try {
      const response = await generateComprehensiveScenarioAnalysis(
        analysis.categoryType,
        analysis.categoryName,
        analysis.subcategoryName,
        analysis.scenarioDescription,
        analysis.impactScore,
        assessment.industry,
        assessment.company_size,
        assessment.business_description || '',
        {
          affected_assets: analysis.affectedAssets,
          time_horizon: analysis.timeHorizon
        }
      );

      // 更新分析資料
      setScenarioAnalyses(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          financialAnalysis: {
            profitLossAnalysis: response.financial_impact?.profit_loss?.description || '',
            cashFlowAnalysis: response.financial_impact?.cash_flow?.description || '',
            balanceSheetAnalysis: response.financial_impact?.balance_sheet?.description || '',
            strategyFeasibility: response.scenario_summary || '',
            analysisMethodology: '基於TCFD框架的情境分析，結合產業特性與企業規模進行財務影響評估',
            calculationLogic: '採用情境模擬與敏感度分析，量化氣候風險對財務報表各項目的潛在影響'
          }
        }
      }));

      // 儲存到資料庫
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: itemId,
        category_name: analysis.categoryName,
        subcategory_name: analysis.subcategoryName,
        scenario_description: analysis.scenarioDescription,
        user_score: analysis.impactScore,
        likelihood_score: analysis.impactScore,
        llm_response: JSON.stringify(response),
        scenario_generated_by_llm: true
      });

      toast.success('綜合分析已完成');
    } catch (error) {
      console.error('生成綜合分析失敗:', error);
      toast.error('生成綜合分析失敗');
    } finally {
      setGeneratingAnalysis(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const updateScenarioAnalysis = (itemId: string, updates: Partial<ScenarioAnalysisData>) => {
    setScenarioAnalyses(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        ...updates
      }
    }));
  };

  const handleExportDraft = (itemId: string) => {
    const analysis = scenarioAnalyses[itemId];
    if (!analysis?.financialAnalysis) return;

    const draftContent = `
# ${analysis.categoryName} - ${analysis.subcategoryName} 財務分析草稿

## 情境描述
${analysis.scenarioDescription}

## 評估參數
- 影響程度：${analysis.impactScore}/10
- 受影響資產：${analysis.affectedAssets.join('、')}
- 時間範圍：${TIME_HORIZONS.find(h => h.value === analysis.timeHorizon)?.label}

## 財務影響分析

### 損益表影響分析
${analysis.financialAnalysis.profitLossAnalysis}

### 現金流影響分析
${analysis.financialAnalysis.cashFlowAnalysis}

### 資產負債表影響分析
${analysis.financialAnalysis.balanceSheetAnalysis}

### 策略可行性說明
${analysis.financialAnalysis.strategyFeasibility}

### 分析與估算方法建議
${analysis.financialAnalysis.analysisMethodology}

### 財務計算邏輯建議
${analysis.financialAnalysis.calculationLogic}
`;

    const blob = new Blob([draftContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.categoryName}-${analysis.subcategoryName}-分析草稿.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('草稿已匯出');
  };

  const handleCompleteStage = async () => {
    // 檢查是否所有項目都有情境描述和分析
    const incompleteItems = Object.values(scenarioAnalyses).filter(
      analysis => !analysis.scenarioDescription || !analysis.financialAnalysis
    );

    if (incompleteItems.length > 0) {
      toast.error(`還有 ${incompleteItems.length} 個項目未完成分析`);
      return;
    }

    setIsSubmitting(true);

    try {
      // 準備第四階段需要的資料格式
      const stage3Results = {
        assessment: assessment,
        scenarios: Object.values(scenarioAnalyses).map(analysis => ({
          categoryName: analysis.categoryName,
          categoryType: analysis.categoryType,
          subcategoryName: analysis.subcategoryName,
          scenarioDescription: analysis.scenarioDescription,
          userScore: analysis.impactScore,
          affectedAssets: analysis.affectedAssets,
          timeHorizon: analysis.timeHorizon,
          financialAnalysis: analysis.financialAnalysis,
          userNotes: ''
        }))
      };

      // 儲存到 sessionStorage 供第四階段使用
      sessionStorage.setItem('tcfd-stage3-results', JSON.stringify(stage3Results));
      console.log('第三階段完成，資料已儲存:', stage3Results);
      
      toast.success('第三階段完成，準備進入財務模組');
      onComplete();
    } catch (error) {
      console.error('第三階段處理失敗:', error);
      toast.error('處理失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItems = riskOpportunitySelections.filter(item => item.selected);

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">無選擇項目</h3>
            <p className="text-gray-600">請先在第二階段選擇風險或機會項目</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">第三階段：情境分析與財務評估</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          針對每個選定的風險/機會項目，生成具體情境描述並進行財務影響分析
        </p>
        <Badge variant="outline" className="text-gray-700">
          共 {selectedItems.length} 個項目待分析
        </Badge>
      </div>

      <div className="space-y-8">
        {selectedItems.map((item, index) => {
          const analysis = scenarioAnalyses[item.id];
          const isLoadingScenario = loadingScenarios.has(item.id);
          const isGeneratingAnalysis = generatingAnalysis.has(item.id);
          
          if (!analysis) return null;

          return (
            <Card key={item.id} className="border-l-4 border-gray-400">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant={analysis.categoryType === 'risk' ? 'destructive' : 'default'}>
                      {analysis.categoryType === 'risk' ? (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {analysis.categoryName}
                    </Badge>
                    <span className="text-gray-700">{analysis.subcategoryName}</span>
                  </div>
                  <Badge variant="outline">項目 {index + 1}</Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-6">
                {/* 情境描述 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">情境描述</Label>
                    <Button
                      onClick={() => handleGenerateScenario(item.id)}
                      disabled={isLoadingScenario}
                      variant="outline"
                      size="sm"
                    >
                      {isLoadingScenario ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          生成情境描述
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={analysis.scenarioDescription}
                    onChange={(e) => updateScenarioAnalysis(item.id, { scenarioDescription: e.target.value })}
                    placeholder="點擊「生成情境描述」按鈕以產生具體的情境內容..."
                    rows={4}
                    className="text-sm"
                  />
                </div>

                {/* 評估參數 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 影響程度 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">影響程度</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[analysis.impactScore]}
                        onValueChange={(value) => updateScenarioAnalysis(item.id, { impactScore: value[0] })}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600">
                        {analysis.impactScore}/10
                      </div>
                    </div>
                  </div>

                  {/* 受影響資產 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">受影響資產範圍</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {AFFECTED_ASSETS.map(asset => (
                        <div key={asset} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.id}-${asset}`}
                            checked={analysis.affectedAssets.includes(asset)}
                            onCheckedChange={(checked) => {
                              const newAssets = checked
                                ? [...analysis.affectedAssets, asset]
                                : analysis.affectedAssets.filter(a => a !== asset);
                              updateScenarioAnalysis(item.id, { affectedAssets: newAssets });
                            }}
                          />
                          <Label htmlFor={`${item.id}-${asset}`} className="text-xs">
                            {asset}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 時間範圍 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">時間範圍</Label>
                    <Select
                      value={analysis.timeHorizon}
                      onValueChange={(value) => updateScenarioAnalysis(item.id, { timeHorizon: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_HORIZONS.map(horizon => (
                          <SelectItem key={horizon.value} value={horizon.value}>
                            {horizon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 綜合分析按鈕 */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => handleGenerateComprehensiveAnalysis(item.id)}
                    disabled={!analysis.scenarioDescription || isGeneratingAnalysis}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingAnalysis ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        分析中...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        生成綜合財務分析
                      </>
                    )}
                  </Button>
                </div>

                {/* 財務分析結果 */}
                {analysis.financialAnalysis && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        六段財務評估分析
                      </h4>
                      <Button
                        onClick={() => handleExportDraft(item.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        匯出草稿
                      </Button>
                    </div>
                    
                    {/* 3x2 財務分析網格 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {[
                        {
                          title: '損益表影響分析',
                          content: analysis.financialAnalysis.profitLossAnalysis,
                          icon: BarChart3,
                          color: 'bg-blue-50 border-blue-200'
                        },
                        {
                          title: '現金流影響分析',
                          content: analysis.financialAnalysis.cashFlowAnalysis,
                          icon: DollarSign,
                          color: 'bg-green-50 border-green-200'
                        },
                        {
                          title: '資產負債表影響分析',
                          content: analysis.financialAnalysis.balanceSheetAnalysis,
                          icon: Building,
                          color: 'bg-purple-50 border-purple-200'
                        },
                        {
                          title: '策略可行性說明',
                          content: analysis.financialAnalysis.strategyFeasibility,
                          icon: CheckCircle,
                          color: 'bg-orange-50 border-orange-200'
                        },
                        {
                          title: '分析與估算方法建議',
                          content: analysis.financialAnalysis.analysisMethodology,
                          icon: Calculator,
                          color: 'bg-teal-50 border-teal-200'
                        },
                        {
                          title: '財務計算邏輯建議',
                          content: analysis.financialAnalysis.calculationLogic,
                          icon: LinkIcon,
                          color: 'bg-red-50 border-red-200'
                        }
                      ].map((section, idx) => (
                        <Card key={idx} className={`${section.color} border-2`}>
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center space-x-2 text-sm">
                              <section.icon className="h-4 w-4" />
                              <span>{section.title}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {section.content.length > 150 ? (
                                <details className="cursor-pointer">
                                  <summary>{section.content.substring(0, 150)}...</summary>
                                  <div className="mt-2 pt-2 border-t border-gray-200">
                                    {section.content}
                                  </div>
                                </details>
                              ) : (
                                section.content
                              )}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 完成按鈕 */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleCompleteStage}
          disabled={isSubmitting}
          size="lg"
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              儲存中...
            </>
          ) : (
            '完成第三階段，進入財務模組'
          )}
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage3;
