
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { AlertTriangle, TrendingUp, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections } = useTCFDAssessment(assessment.id);
  const { 
    scenarioEvaluations, 
    generateComprehensiveScenarioAnalysis 
  } = useTCFDScenarioEvaluations(assessment.id);
  
  const [selectedStrategies, setSelectedStrategies] = useState<Record<string, string>>({});
  const [strategyAnalyses, setStrategyAnalyses] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 從評估結果中獲取選擇的情境
  const selectedScenarios = riskOpportunitySelections.filter(selection => selection.selected);

  // 使用 useCallback 避免重複渲染
  const initializeStrategies = useCallback(() => {
    if (selectedScenarios.length > 0 && !initialized) {
      console.log('Initializing strategies for scenarios:', selectedScenarios.length);
      const initialStrategies: Record<string, string> = {};
      selectedScenarios.forEach(scenario => {
        const key = `${scenario.category_name}-${scenario.subcategory_name}`;
        initialStrategies[key] = '';
      });
      setSelectedStrategies(initialStrategies);
      setInitialized(true);
      
      // 立即為所有情境生成策略分析
      generateAllStrategiesAnalysis();
    }
  }, [selectedScenarios, initialized]);

  useEffect(() => {
    initializeStrategies();
  }, [initializeStrategies]);

  // 為所有情境生成策略分析
  const generateAllStrategiesAnalysis = async () => {
    console.log('開始為所有情境生成策略分析');
    
    for (const scenario of selectedScenarios) {
      const scenarioKey = `${scenario.category_name}-${scenario.subcategory_name}`;
      
      // 如果已經有分析結果，跳過
      if (strategyAnalyses[scenarioKey]) {
        continue;
      }
      
      await generateStrategyAnalysisForScenario(scenarioKey, scenario);
    }
  };

  const generateStrategyAnalysisForScenario = async (scenarioKey: string, scenario: any) => {
    console.log('生成策略分析:', scenarioKey);
    
    // 尋找對應的scenario evaluation或創建默認值
    let scenarioEvaluation = scenarioEvaluations.find(evaluation => 
      evaluation.category_name === scenario.category_name && 
      evaluation.subcategory_name === scenario.subcategory_name
    );

    if (!scenarioEvaluation) {
      const defaultDescription = `${scenario.category_name}類型的${scenario.subcategory_name}情境，對${assessment.industry}行業的${assessment.company_size}企業可能造成${scenario.category_type === 'risk' ? '風險' : '機會'}影響。`;
      scenarioEvaluation = {
        id: `temp-${Date.now()}`,
        assessment_id: assessment.id,
        risk_opportunity_id: scenario.id,
        category_name: scenario.category_name,
        subcategory_name: scenario.subcategory_name,
        scenario_description: defaultDescription,
        scenario_generated_by_llm: false,
        likelihood_score: 2,
        user_score: 2,
        created_at: new Date().toISOString()
      };
    }

    setLoadingAnalyses(prev => ({ ...prev, [scenarioKey]: true }));

    try {
      const analysis = await generateComprehensiveScenarioAnalysis(
        scenario.category_type,
        scenario.category_name,
        scenario.subcategory_name,
        scenarioEvaluation.scenario_description,
        scenarioEvaluation.likelihood_score,
        assessment.industry,
        assessment.company_size
      );

      console.log('生成的策略分析:', analysis);

      setStrategyAnalyses(prev => ({
        ...prev,
        [scenarioKey]: analysis
      }));

      toast.success(`${scenario.subcategory_name} 的策略分析已生成`);
    } catch (error) {
      console.error('策略分析生成失敗:', error);
      toast.error('策略分析生成失敗，請稍後再試');
    } finally {
      setLoadingAnalyses(prev => ({ ...prev, [scenarioKey]: false }));
    }
  };

  const handleStrategyChange = (scenarioKey: string, strategyType: string) => {
    console.log('策略選擇:', scenarioKey, strategyType);
    
    setSelectedStrategies(prev => ({
      ...prev,
      [scenarioKey]: strategyType
    }));
  };

  const handleNotesChange = (scenarioKey: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [scenarioKey]: value
    }));
  };

  const handleSubmit = async () => {
    const incompleteScenarios = selectedScenarios.filter(scenario => {
      const key = `${scenario.category_name}-${scenario.subcategory_name}`;
      return !selectedStrategies[key];
    });

    if (incompleteScenarios.length > 0) {
      toast.error('請為所有情境選擇管理策略');
      return;
    }

    setIsSubmitting(true);
    try {
      toast.success('策略選擇已完成');
      onComplete();
    } catch (error) {
      console.error('保存策略選擇錯誤:', error);
      toast.error('保存失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderScenarioCard = (scenario: any) => {
    const scenarioKey = `${scenario.category_name}-${scenario.subcategory_name}`;
    const selectedStrategy = selectedStrategies[scenarioKey];
    const analysis = strategyAnalyses[scenarioKey];
    const isLoading = loadingAnalyses[scenarioKey];
    
    const isRisk = scenario.category_type === 'risk';
    const IconComponent = isRisk ? AlertTriangle : TrendingUp;
    const colorClass = isRisk ? 'border-red-200' : 'border-green-200';
    const badgeColor = isRisk ? 'destructive' : 'default';

    // 根據風險或機會決定策略選項
    const strategyOptions = isRisk ? [
      { value: 'mitigate', label: '減緩策略', description: '降低風險發生機率或影響程度' },
      { value: 'transfer', label: '轉移策略', description: '將風險轉移給其他方承擔' },
      { value: 'accept', label: '接受策略', description: '接受風險並制定應對計畫' },
      { value: 'control', label: '控制策略', description: '建立監控機制控制風險' }
    ] : [
      { value: 'evaluate_explore', label: '評估探索', description: '研究市場可行性與技術需求' },
      { value: 'capability_building', label: '能力建設', description: '培養相關技能與資源' },
      { value: 'business_transformation', label: '商業轉換', description: '調整業務模式抓住機會' },
      { value: 'cooperation_participation', label: '合作參與', description: '與其他組織合作開發' },
      { value: 'aggressive_investment', label: '積極投入', description: '大規模投資快速搶占市場' }
    ];

    return (
      <Card key={scenarioKey} className={`${colorClass} border-2 mb-6`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <IconComponent className={`h-5 w-5 ${isRisk ? 'text-red-600' : 'text-green-600'}`} />
              <div>
                <CardTitle className="text-lg">{scenario.subcategory_name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={badgeColor} className="text-xs">
                    {scenario.category_name}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 載入狀態 */}
          {isLoading && (
            <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-blue-800">正在生成專屬策略分析...</span>
            </div>
          )}

          {/* 策略分析結果 */}
          {analysis && !isLoading && (
            <div className="space-y-4">
              {/* 情境描述 */}
              {analysis.scenario_summary && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">情境描述</h4>
                  <p className="text-gray-700 leading-relaxed">{analysis.scenario_summary}</p>
                </div>
              )}

              {/* 四個策略選項 */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  選擇管理策略 <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={selectedStrategy}
                  onValueChange={(value) => handleStrategyChange(scenarioKey, value)}
                  className="space-y-3"
                >
                  {strategyOptions.map((option) => {
                    const strategyData = analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies']?.[option.value];
                    
                    return (
                      <div key={option.value} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value={option.value} id={`${scenarioKey}-${option.value}`} className="mt-1" />
                          <div className="flex-1">
                            <Label htmlFor={`${scenarioKey}-${option.value}`} className="cursor-pointer">
                              <div className="font-medium text-base mb-1">{option.label}</div>
                              {strategyData && (
                                <div className="text-sm text-gray-700 leading-relaxed">
                                  {strategyData.description}
                                </div>
                              )}
                            </Label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* 備註欄位 */}
          <div>
            <Label htmlFor={`notes-${scenarioKey}`} className="text-sm font-medium">
              策略執行備註（選填）
            </Label>
            <Textarea
              id={`notes-${scenarioKey}`}
              placeholder="您可以在此記錄對該策略的補充說明或執行考慮..."
              value={notes[scenarioKey] || ''}
              onChange={(e) => handleNotesChange(scenarioKey, e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (selectedScenarios.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">尚未選擇風險與機會情境</h3>
            <p className="text-gray-600">請先完成第二階段的情境選擇，再進行策略制定。</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">第三階段：管理策略制定</CardTitle>
          <p className="text-gray-600 text-center">
            為每個已識別的風險和機會情境制定具體的管理策略
          </p>
        </CardHeader>
      </Card>

      {/* 進度摘要 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">
                <strong>策略制定進度：</strong>
                {Object.values(selectedStrategies).filter(s => s).length} / {selectedScenarios.length} 個情境已選擇策略
              </p>
              <p className="text-xs text-blue-600 mt-1">
                💡 系統已自動為每個情境生成專屬的策略建議
              </p>
            </div>
            <Badge variant="outline" className="">
              {assessment.company_size} · {assessment.industry}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 情境策略卡片 */}
      <div className="space-y-6">
        {selectedScenarios.map(renderScenarioCard)}
      </div>

      {/* 提交按鈕 */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={
            Object.values(selectedStrategies).filter(s => s).length !== selectedScenarios.length || 
            isSubmitting ||
            Object.values(loadingAnalyses).some(loading => loading)
          }
          size="lg"
          className="px-8"
        >
          {isSubmitting ? '保存中...' : 
           Object.values(loadingAnalyses).some(loading => loading) ? '分析生成中...' :
           `完成策略制定 (${Object.values(selectedStrategies).filter(s => s).length}/${selectedScenarios.length})`}
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage3;
