
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { AlertTriangle, TrendingUp, Loader2, CheckCircle, DollarSign, Clock, Target } from 'lucide-react';
import { toast } from 'sonner';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

interface StrategyAnalysis {
  scenario_id: string;
  selected_strategy: string;
  analysis_result: any;
  notes?: string;
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

  // 從評估結果中獲取選擇的情境
  const selectedScenarios = riskOpportunitySelections.filter(selection => selection.selected);

  useEffect(() => {
    // 初始化策略選擇狀態
    const initialStrategies: Record<string, string> = {};
    selectedScenarios.forEach(scenario => {
      const key = `${scenario.category_name}-${scenario.subcategory_name}`;
      initialStrategies[key] = '';
    });
    setSelectedStrategies(initialStrategies);
  }, [selectedScenarios]);

  const handleStrategyChange = async (scenarioKey: string, strategyType: string) => {
    setSelectedStrategies(prev => ({
      ...prev,
      [scenarioKey]: strategyType
    }));

    // 生成該策略的詳細分析
    await generateStrategyAnalysis(scenarioKey, strategyType);
  };

  const generateStrategyAnalysis = async (scenarioKey: string, strategyType: string) => {
    const [categoryName, subcategoryName] = scenarioKey.split('-');
    const scenario = selectedScenarios.find(s => 
      s.category_name === categoryName && s.subcategory_name === subcategoryName
    );
    
    if (!scenario) return;

    const scenarioEvaluation = scenarioEvaluations.find(eval => 
      eval.category_name === categoryName && eval.subcategory_name === subcategoryName
    );

    if (!scenarioEvaluation) {
      toast.error('請先完成情境評估再選擇策略');
      return;
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

      setStrategyAnalyses(prev => ({
        ...prev,
        [scenarioKey]: analysis
      }));

      toast.success(`${subcategoryName} 的策略分析已生成`);
    } catch (error) {
      console.error('Error generating strategy analysis:', error);
      toast.error('策略分析生成失敗，請稍後再試');
    } finally {
      setLoadingAnalyses(prev => ({ ...prev, [scenarioKey]: false }));
    }
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
      // 這裡應該保存策略選擇結果
      // 暫時直接進入下一階段
      toast.success('策略選擇已完成');
      onComplete();
    } catch (error) {
      console.error('Error saving strategy selections:', error);
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
    
    const scenarioEvaluation = scenarioEvaluations.find(eval => 
      eval.category_name === scenario.category_name && 
      eval.subcategory_name === scenario.subcategory_name
    );

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
                  {scenarioEvaluation && (
                    <Badge variant="outline" className="text-xs">
                      影響評分: {scenarioEvaluation.likelihood_score}/3
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {scenarioEvaluation && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>情境描述：</strong>{scenarioEvaluation.scenario_description}
              </p>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium">
              選擇管理策略 <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={selectedStrategy}
              onValueChange={(value) => handleStrategyChange(scenarioKey, value)}
              className="mt-2"
            >
              {strategyOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={`${scenarioKey}-${option.value}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`${scenarioKey}-${option.value}`} className="cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 策略分析結果 */}
          {isLoading && (
            <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-blue-800">正在生成專屬策略分析...</span>
            </div>
          )}

          {analysis && selectedStrategy && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-800">策略分析完成</h4>
              </div>
              
              {/* 情境摘要 */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>情境摘要：</strong>{analysis.scenario_summary}
                </p>
              </div>

              {/* 財務影響摘要 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">損益影響</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {analysis.financial_impact?.profit_loss?.impact_direction === 'positive' ? '正面' : 
                     analysis.financial_impact?.profit_loss?.impact_direction === 'negative' ? '負面' : '中性'}
                    · {analysis.financial_impact?.profit_loss?.timeframe}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">現金流影響</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {analysis.financial_impact?.cash_flow?.impact_direction === 'positive' ? '正面' : 
                     analysis.financial_impact?.cash_flow?.impact_direction === 'negative' ? '負面' : '中性'}
                    · {analysis.financial_impact?.cash_flow?.timeframe}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">資產負債影響</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {analysis.financial_impact?.balance_sheet?.impact_direction === 'positive' ? '正面' : 
                     analysis.financial_impact?.balance_sheet?.impact_direction === 'negative' ? '負面' : '中性'}
                    · {analysis.financial_impact?.balance_sheet?.timeframe}
                  </p>
                </div>
              </div>

              {/* 選擇的策略詳細資訊 */}
              {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies']?.[selectedStrategy] && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">
                    {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies'][selectedStrategy].title}
                  </h5>
                  <p className="text-sm text-green-700 mb-3">
                    {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies'][selectedStrategy].description}
                  </p>
                  
                  {/* 具體行動清單 */}
                  <div className="mb-3">
                    <h6 className="text-sm font-medium text-green-800 mb-1">具體執行行動：</h6>
                    <ul className="text-xs text-green-700 space-y-1">
                      {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies'][selectedStrategy].specific_actions?.map((action: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 成本與時程資訊 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-green-800">成本估算：</span>
                      <p className="text-green-700">
                        {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies'][selectedStrategy][isRisk ? 'cost_estimate' : 'investment_estimate']}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">實施時程：</span>
                      <p className="text-green-700">
                        {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies'][selectedStrategy].implementation_timeline}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">可行性評分：</span>
                      <p className="text-green-700">
                        {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies'][selectedStrategy].feasibility_score}/5
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-green-700">
                    <span className="font-medium">可行性說明：</span>
                    {analysis[isRisk ? 'risk_strategies' : 'opportunity_strategies'][selectedStrategy].feasibility_reason}
                  </div>
                </div>
              )}
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
                💡 選擇策略後將自動生成專屬的財務影響分析和執行建議
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
