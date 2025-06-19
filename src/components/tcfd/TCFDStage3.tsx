import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { Brain, Loader2, Sparkles, DollarSign, Target, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Minus, Star, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { 
    riskOpportunitySelections, 
    scenarioEvaluations, 
    saveScenarioEvaluation,
    generateScenarioWithLLM,
    generateScenarioAnalysisWithLLM,
    loading 
  } = useTCFDAssessment(assessment.id);
  
  const [generatedScenarios, setGeneratedScenarios] = useState<any[]>([]);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [scenarioAnalyses, setScenarioAnalyses] = useState<Record<string, any>>({});
  const [isGeneratingAnalyses, setIsGeneratingAnalyses] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, boolean>>({});
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<number>(-1);
  const [customScenarios, setCustomScenarios] = useState<Record<string, string>>({});
  const [showCustomInput, setShowCustomInput] = useState<Record<string, boolean>>({});

  // 情境描述對應表
  const scenarioDescriptions: Record<string, string> = {
    // 風險情境描述
    '急性實體風險': '極端天氣事件加劇，對營運造成直接衝擊與損失',
    '慢性實體風險': '長期氣候變化影響，逐步改變營運環境與成本',
    '碳定價機制': '碳稅與碳權制度實施，增加營運成本與合規壓力',
    '法規政策變化': '氣候相關法規趨嚴，提升合規成本與營運限制',
    '技術發展風險': '低碳技術演進，現有技術面臨淘汰與競爭壓力',
    '市場偏好轉變': '消費者偏好綠色產品，傳統產品需求下降',
    
    // 機會情境描述
    '能源效率提升': '導入節能技術與設備，降低營運成本提升競爭力',
    '再生能源應用': '採用太陽能風能等綠電，減少能源成本與碳排',
    '低碳產品開發': '開發環保產品搶攻綠色市場，創造新營收來源',
    '綠色金融商品': '推出氣候相關金融產品，開拓新業務與客群'
  };

  useEffect(() => {
    if (riskOpportunitySelections.length > 0 && generatedScenarios.length === 0) {
      generateScenariosInBatches();
    }
  }, [riskOpportunitySelections]);

  const generateScenariosInBatches = async () => {
    setIsGeneratingScenarios(true);
    try {
      const selectedItems = riskOpportunitySelections.filter(sel => sel.selected && sel.subcategory_name);
      const scenarios = [];

      // 分批生成，每次生成一個情境並立即顯示
      for (let i = 0; i < selectedItems.length; i++) {
        const selection = selectedItems[i];
        setCurrentGeneratingIndex(i);
        
        try {
          console.log(`正在生成情境 ${i + 1}/${selectedItems.length}:`, selection.category_name, selection.subcategory_name);
          
          const scenarioDescription = await generateScenarioWithLLM(
            selection.category_type as 'risk' | 'opportunity',
            selection.category_name,
            selection.subcategory_name!,
            assessment.industry
          );

          const scenario = {
            id: `scenario-${selection.id}`,
            risk_opportunity_id: selection.id,
            category_name: selection.category_name,
            subcategory_name: selection.subcategory_name,
            category_type: selection.category_type,
            scenario_description: scenarioDescription,
            scenario_generated_by_llm: true,
          };

          scenarios.push(scenario);
          
          // 立即更新顯示，讓用戶看到進度
          setGeneratedScenarios([...scenarios]);

          // 開始生成詳細分析（異步進行，不阻塞下一個情境生成）
          generateAnalysisAsync(scenario);

        } catch (error) {
          console.error('生成情境失敗：', selection.subcategory_name, error);
          const fallbackScenario = {
            id: `scenario-${selection.id}`,
            risk_opportunity_id: selection.id,
            category_name: selection.category_name,
            subcategory_name: selection.subcategory_name,
            category_type: selection.category_type,
            scenario_description: scenarioDescriptions[selection.subcategory_name] || `針對「${selection.subcategory_name}」的具體情境正在生成中，請稍後重新整理頁面查看完整內容。`,
            scenario_generated_by_llm: true,
          };
          scenarios.push(fallbackScenario);
          setGeneratedScenarios([...scenarios]);
        }
      }
      
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGeneratingScenarios(false);
      setCurrentGeneratingIndex(-1);
    }
  };

  const generateAnalysisAsync = async (scenario: any) => {
    setIsGeneratingAnalyses(prev => ({
      ...prev,
      [scenario.id]: true
    }));

    try {
      const analysis = await generateScenarioAnalysisWithLLM(
        scenario.scenario_description,
        3, // 預設高相關性
        assessment.industry
      );

      setScenarioAnalyses(prev => ({
        ...prev,
        [scenario.id]: analysis
      }));

    } catch (error) {
      console.error('生成分析失敗：', scenario.subcategory_name, error);
    } finally {
      setIsGeneratingAnalyses(prev => ({
        ...prev,
        [scenario.id]: false
      }));
    }
  };

  const toggleScenarioExpansion = (scenarioId: string) => {
    setExpandedScenarios(prev => ({
      ...prev,
      [scenarioId]: !prev[scenarioId]
    }));
  };

  const addCustomScenario = (categoryType: 'risk' | 'opportunity') => {
    setShowCustomInput(prev => ({
      ...prev,
      [categoryType]: true
    }));
  };

  const saveCustomScenario = (categoryType: 'risk' | 'opportunity') => {
    const customText = customScenarios[categoryType];
    if (!customText || customText.trim().length < 20) {
      alert('請輸入至少20字的情境描述');
      return;
    }

    const customScenario = {
      id: `custom-${categoryType}-${Date.now()}`,
      risk_opportunity_id: `custom-${categoryType}`,
      category_name: categoryType === 'risk' ? '自訂風險' : '自訂機會',
      subcategory_name: '用戶自填情境',
      category_type: categoryType,
      scenario_description: customText,
      scenario_generated_by_llm: false,
      is_custom: true,
    };

    setGeneratedScenarios(prev => [...prev, customScenario]);
    setCustomScenarios(prev => ({ ...prev, [categoryType]: '' }));
    setShowCustomInput(prev => ({ ...prev, [categoryType]: false }));

    // 為自訂情境生成分析
    generateAnalysisAsync(customScenario);
  };

  const removeCustomScenario = (scenarioId: string) => {
    setGeneratedScenarios(prev => prev.filter(s => s.id !== scenarioId));
    setScenarioAnalyses(prev => {
      const newAnalyses = { ...prev };
      delete newAnalyses[scenarioId];
      return newAnalyses;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 檢查自訂情境是否符合對應的風險/機會類型
      const customScenariosToValidate = generatedScenarios.filter(s => s.is_custom);
      
      for (const customScenario of customScenariosToValidate) {
        const analysis = scenarioAnalyses[customScenario.id];
        if (!analysis) {
          alert(`自訂情境「${customScenario.scenario_description.substring(0, 30)}...」尚未完成分析，請稍候再試。`);
          setIsSubmitting(false);
          return;
        }
        
        // 這裡可以添加更多驗證邏輯，檢查自訂內容是否符合情境類型
        // 暫時允許通過，但在下一階段會有更嚴格的驗證
      }

      // 儲存所有評估結果
      for (const scenario of generatedScenarios) {
        const analysis = scenarioAnalyses[scenario.id];
        
        await saveScenarioEvaluation({
          assessment_id: assessment.id,
          risk_opportunity_id: scenario.risk_opportunity_id,
          scenario_description: scenario.scenario_description,
          scenario_generated_by_llm: scenario.scenario_generated_by_llm,
          user_score: 3, // 預設高相關性
          llm_response: analysis ? JSON.stringify(analysis) : undefined,
        });
      }
      onComplete();
    } catch (error) {
      console.error('Error saving evaluations:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImpactIcon = (direction: string) => {
    switch (direction) {
      case '正面': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case '負面': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (direction: string) => {
    switch (direction) {
      case '正面': return 'border-green-300 bg-green-50';
      case '負面': return 'border-red-300 bg-red-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const renderRiskStrategies = (strategies: any) => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg flex items-center space-x-2">
        <Target className="h-5 w-5 text-red-600" />
        <span>🛡️ 風險應對策略</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(strategies).map(([key, strategy]: [string, any]) => (
          <div key={key} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-red-900">{strategy.title}</h5>
              <div className="flex items-center space-x-1">
                {[...Array(strategy.feasibility_score)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - strategy.feasibility_score)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-gray-300" />
                ))}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {strategy.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">成本估算:</span>
                <Badge variant="outline" className="text-xs">
                  {strategy.cost_estimate}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">實施時間:</span>
                <Badge variant="outline" className="text-xs">
                  {strategy.implementation_timeline}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-600">
                <span className="font-medium">可行性:</span> {strategy.feasibility_reason}
              </div>
              
              <div className="text-xs text-blue-600 mt-2">
                <span className="font-medium">預期效果:</span> {strategy.expected_effect}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOpportunityStrategies = (strategies: any) => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg flex items-center space-x-2">
        <Target className="h-5 w-5 text-green-600" />
        <span>🎯 機會應對策略</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(strategies).map(([key, strategy]: [string, any]) => (
          <div key={key} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-green-900">{strategy.title}</h5>
              <div className="flex items-center space-x-1">
                {[...Array(strategy.feasibility_score)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                {[...Array(5 - strategy.feasibility_score)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 text-gray-300" />
                ))}
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {strategy.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">投資估算:</span>
                <Badge variant="outline" className="text-xs">
                  {strategy.cost_estimate}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">實施時間:</span>
                <Badge variant="outline" className="text-xs">
                  {strategy.implementation_timeline}
                </Badge>
              </div>
              
              <div className="text-xs text-gray-600">
                <span className="font-medium">可行性:</span> {strategy.feasibility_reason}
              </div>
              
              <div className="text-xs text-green-600 mt-2">
                <span className="font-medium">預期效果:</span> {strategy.expected_effect}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinancialImpact = (impact: any) => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg flex items-center space-x-2">
        <DollarSign className="h-5 w-5 text-blue-600" />
        <span>財務影響分析</span>
      </h4>
      
      <div className="grid grid-cols-1 gap-4">
        {/* 損益表影響 */}
        <div className={`p-4 rounded-lg border-l-4 ${getImpactColor(impact.profit_loss?.impact_direction)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <h5 className="font-medium">📉 損益表影響</h5>
              {getImpactIcon(impact.profit_loss?.impact_direction)}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {impact.profit_loss?.timeframe}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {impact.profit_loss?.amount_estimate}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            {impact.profit_loss?.description}
          </p>
          {impact.profit_loss?.key_items && (
            <div className="flex flex-wrap gap-1">
              {impact.profit_loss.key_items.map((item: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-white">
                  {item}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 現金流影響 */}
        <div className={`p-4 rounded-lg border-l-4 ${getImpactColor(impact.cash_flow?.impact_direction)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h5 className="font-medium">💸 現金流影響</h5>
              {getImpactIcon(impact.cash_flow?.impact_direction)}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {impact.cash_flow?.timeframe}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {impact.cash_flow?.amount_estimate}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            {impact.cash_flow?.description}
          </p>
          {impact.cash_flow?.key_items && (
            <div className="flex flex-wrap gap-1">
              {impact.cash_flow.key_items.map((item: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-white">
                  {item}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* 資產負債表影響 */}
        <div className={`p-4 rounded-lg border-l-4 ${getImpactColor(impact.balance_sheet?.impact_direction)}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <h5 className="font-medium">🏦 資產負債表影響</h5>
              {getImpactIcon(impact.balance_sheet?.impact_direction)}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {impact.balance_sheet?.timeframe}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {impact.balance_sheet?.amount_estimate}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            {impact.balance_sheet?.description}
          </p>
          {impact.balance_sheet?.key_items && (
            <div className="flex flex-wrap gap-1">
              {impact.balance_sheet.key_items.map((item: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-white">
                  {item}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const completedScenarios = generatedScenarios.length;
  const canProceed = completedScenarios > 0;

  const riskScenarios = generatedScenarios.filter(s => s.category_type === 'risk');
  const opportunityScenarios = generatedScenarios.filter(s => s.category_type === 'opportunity');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span>第三階段：情境評估與財務分析</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            AI 將根據您選擇的風險與機會類別，生成具體的業務情境並提供完整的財務影響分析與策略建議
          </p>
        </CardHeader>
      </Card>

      {isGeneratingScenarios && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">AI 正在生成情境...</h3>
            <p className="text-gray-600 mb-4">
              根據您的產業別（{assessment.industry}）和企業規模，
              為您量身定制氣候相關情境描述與策略分析
            </p>
            {currentGeneratingIndex >= 0 && (
              <div className="text-sm text-blue-600">
                正在處理第 {currentGeneratingIndex + 1} 個情境...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(riskScenarios.length > 0 || opportunityScenarios.length > 0) && (
        <>
          {/* 進度指示 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">分析進度</h3>
                  <p className="text-sm text-blue-700">
                    已完成 {completedScenarios} 個情境分析
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((completedScenarios / Math.max(riskOpportunitySelections.filter(sel => sel.selected).length, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-blue-600">完成度</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 風險情境 */}
          {riskScenarios.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-red-700 flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6" />
                  <span>風險情境分析</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCustomScenario('risk')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加自訂風險情境
                </Button>
              </div>

              {showCustomInput.risk && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-700">自訂風險情境</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="custom-risk">請描述您企業面臨的特殊風險情境（至少20字）</Label>
                      <Textarea
                        id="custom-risk"
                        placeholder="例如：因應新興市場的氣候法規變化，我們的海外子公司可能面臨額外的碳排放申報要求..."
                        value={customScenarios.risk || ''}
                        onChange={(e) => setCustomScenarios(prev => ({ ...prev, risk: e.target.value }))}
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => saveCustomScenario('risk')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        確認添加
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCustomInput(prev => ({ ...prev, risk: false }))}
                      >
                        取消
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6">
                {riskScenarios.map((scenario, index) => {
                  const analysis = scenarioAnalyses[scenario.id];
                  const isExpanded = expandedScenarios[scenario.id];
                  const isAnalysisLoading = isGeneratingAnalyses[scenario.id];
                  
                  return (
                    <Card key={scenario.id} className="border-l-4 border-red-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-lg">
                                🔴 風險情境 {index + 1}: {scenario.subcategory_name}
                              </CardTitle>
                              {scenario.is_custom && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCustomScenario(scenario.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            
                            {/* 情境描述 */}
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                              {scenarioDescriptions[scenario.subcategory_name] || 
                               scenario.scenario_description.substring(0, 100) + '...'}
                            </p>
                            
                            <div className="flex space-x-2">
                              <Badge variant="outline">{scenario.category_name}</Badge>
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />風險
                              </Badge>
                              {scenario.scenario_generated_by_llm && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI 生成
                                </Badge>
                              )}
                              {scenario.is_custom && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  用戶自填
                                </Badge>
                              )}
                              {isAnalysisLoading && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  分析中
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleScenarioExpansion(scenario.id)}
                            className="ml-4"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="space-y-6">
                          {/* 情境概要 */}
                          {analysis?.scenario_summary && (
                            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                              <h4 className="font-medium text-red-900 mb-2">🔍 情境概要</h4>
                              <p className="text-red-800">{analysis.scenario_summary}</p>
                            </div>
                          )}

                          {/* 財務影響分析 */}
                          {analysis?.financial_impact && renderFinancialImpact(analysis.financial_impact)}

                          {/* 風險應對策略 */}
                          {analysis?.risk_strategies && renderRiskStrategies(analysis.risk_strategies)}

                          {/* 載入中狀態 */}
                          {isAnalysisLoading && (
                            <div className="text-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-2" />
                              <p className="text-gray-600">正在生成詳細分析...</p>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 機會情境 */}
          {opportunityScenarios.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-green-700 flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>機會情境分析</span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCustomScenario('opportunity')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加自訂機會情境
                </Button>
              </div>

              {showCustomInput.opportunity && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-700">自訂機會情境</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="custom-opportunity">請描述您企業面臨的特殊機會情境（至少20字）</Label>
                      <Textarea
                        id="custom-opportunity"
                        placeholder="例如：政府推出的綠色轉型補助計畫，可協助我們導入新的節能設備和技術..."
                        value={customScenarios.opportunity || ''}
                        onChange={(e) => setCustomScenarios(prev => ({ ...prev, opportunity: e.target.value }))}
                        className="mt-2"
                        rows={4}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => saveCustomScenario('opportunity')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        確認添加
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCustomInput(prev => ({ ...prev, opportunity: false }))}
                      >
                        取消
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6">
                {opportunityScenarios.map((scenario, index) => {
                  const analysis = scenarioAnalyses[scenario.id];
                  const isExpanded = expandedScenarios[scenario.id];
                  const isAnalysisLoading = isGeneratingAnalyses[scenario.id];
                  
                  return (
                    <Card key={scenario.id} className="border-l-4 border-green-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-lg">
                                🟢 機會情境 {index + 1}: {scenario.subcategory_name}
                              </CardTitle>
                              {scenario.is_custom && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeCustomScenario(scenario.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            
                            {/* 情境描述 */}
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                              {scenarioDescriptions[scenario.subcategory_name] || 
                               scenario.scenario_description.substring(0, 100) + '...'}
                            </p>
                            
                            <div className="flex space-x-2">
                              <Badge variant="outline">{scenario.category_name}</Badge>
                              <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />機會
                              </Badge>
                              {scenario.scenario_generated_by_llm && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI 生成
                                </Badge>
                              )}
                              {scenario.is_custom && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  用戶自填
                                </Badge>
                              )}
                              {isAnalysisLoading && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  分析中
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleScenarioExpansion(scenario.id)}
                            className="ml-4"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="space-y-6">
                          {/* 情境概要 */}
                          {analysis?.scenario_summary && (
                            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                              <h4 className="font-medium text-green-900 mb-2">🔍 情境概要</h4>
                              <p className="text-green-800">{analysis.scenario_summary}</p>
                            </div>
                          )}

                          {/* 財務影響分析 */}
                          {analysis?.financial_impact && renderFinancialImpact(analysis.financial_impact)}

                          {/* 機會應對策略 */}
                          {analysis?.opportunity_strategies && renderOpportunityStrategies(analysis.opportunity_strategies)}

                          {/* 載入中狀態 */}
                          {isAnalysisLoading && (
                            <div className="text-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-2" />
                              <p className="text-gray-600">正在生成詳細分析...</p>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 提交按鈕 */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? '儲存評估中...' : '進入策略分析階段'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TCFDStage3;
