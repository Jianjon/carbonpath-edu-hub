import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { Brain, Star, Loader2, Sparkles, DollarSign, Target, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';

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
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [scenarioAnalyses, setScenarioAnalyses] = useState<Record<string, any>>({});
  const [isGeneratingAnalyses, setIsGeneratingAnalyses] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (riskOpportunitySelections.length > 0 && generatedScenarios.length === 0) {
      generateScenarios();
    }
  }, [riskOpportunitySelections]);

  const generateScenarios = async () => {
    setIsGeneratingScenarios(true);
    try {
      const selectedItems = riskOpportunitySelections.filter(sel => sel.selected && sel.subcategory_name);
      const scenarios = [];

      for (const selection of selectedItems) {
        try {
          console.log('正在生成情境：', selection.category_name, selection.subcategory_name);
          
          const scenarioDescription = await generateScenarioWithLLM(
            selection.category_type as 'risk' | 'opportunity',
            selection.category_name,
            selection.subcategory_name!,
            assessment.industry
          );

          scenarios.push({
            id: `scenario-${selection.id}`,
            risk_opportunity_id: selection.id,
            category_name: selection.category_name,
            subcategory_name: selection.subcategory_name,
            category_type: selection.category_type,
            scenario_description: scenarioDescription,
            scenario_generated_by_llm: true,
          });
        } catch (error) {
          console.error('生成情境失敗：', selection.subcategory_name, error);
          scenarios.push({
            id: `scenario-${selection.id}`,
            risk_opportunity_id: selection.id,
            category_name: selection.category_name,
            subcategory_name: selection.subcategory_name,
            category_type: selection.category_type,
            scenario_description: `針對「${selection.subcategory_name}」在${assessment.industry}的具體情境正在生成中，請稍後重新整理頁面查看完整內容。`,
            scenario_generated_by_llm: true,
          });
        }
      }
      
      setGeneratedScenarios(scenarios);
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

  const generateAnalysisForScenario = async (scenarioId: string, scenarioDescription: string, userScore: number) => {
    setIsGeneratingAnalyses(prev => ({ ...prev, [scenarioId]: true }));
    try {
      const analysis = await generateScenarioAnalysisWithLLM(
        scenarioDescription,
        userScore,
        assessment.industry
      );
      
      setScenarioAnalyses(prev => ({
        ...prev,
        [scenarioId]: analysis
      }));
    } catch (error) {
      console.error('生成分析失敗：', error);
    } finally {
      setIsGeneratingAnalyses(prev => ({ ...prev, [scenarioId]: false }));
    }
  };

  const handleScoreChange = async (scenarioId: string, score: number) => {
    setUserScores(prev => ({
      ...prev,
      [scenarioId]: score
    }));

    // 自動生成分析
    const scenario = generatedScenarios.find(s => s.id === scenarioId);
    if (scenario && !scenarioAnalyses[scenarioId]) {
      await generateAnalysisForScenario(scenarioId, scenario.scenario_description, score);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 儲存所有評估結果
      for (const scenario of generatedScenarios) {
        const score = userScores[scenario.id];
        const analysis = scenarioAnalyses[scenario.id];
        
        if (score) {
          await saveScenarioEvaluation({
            assessment_id: assessment.id,
            risk_opportunity_id: scenario.risk_opportunity_id,
            scenario_description: scenario.scenario_description,
            scenario_generated_by_llm: true,
            user_score: score,
            llm_response: analysis ? JSON.stringify(analysis) : undefined,
          });
        }
      }
      onComplete();
    } catch (error) {
      console.error('Error saving evaluations:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreButton = ({ score, selectedScore, onClick }: {
    score: number;
    selectedScore: number | undefined;
    onClick: () => void;
  }) => (
    <Button
      variant={selectedScore === score ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={`${selectedScore === score ? 'bg-blue-600' : ''}`}
    >
      <Star className={`h-4 w-4 mr-1 ${selectedScore === score ? 'fill-current' : ''}`} />
      {score}
    </Button>
  );

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
              <h5 className="font-medium">損益表影響</h5>
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
              <h5 className="font-medium">現金流影響</h5>
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
              <h5 className="font-medium">資產負債表影響</h5>
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

  const renderManagementStrategies = (strategies: any) => (
    <div className="space-y-4">
      <h4 className="font-medium text-lg flex items-center space-x-2">
        <Target className="h-5 w-5 text-purple-600" />
        <span>管理策略建議</span>
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(strategies).map(([key, strategy]: [string, any]) => (
          <div key={key} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-blue-900">{strategy.title}</h5>
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

  const completedScenarios = Object.keys(userScores).length;
  const totalScenarios = generatedScenarios.length;
  const canProceed = completedScenarios === totalScenarios && totalScenarios > 0;

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
            <p className="text-gray-600">
              根據您的產業別（{assessment.industry}）和企業規模，
              為您量身定制氣候相關情境描述
            </p>
            <div className="mt-4 text-sm text-purple-600">
              正在處理 {riskOpportunitySelections.filter(s => s.selected && s.subcategory_name).length} 個類別
            </div>
          </CardContent>
        </Card>
      )}

      {generatedScenarios.length > 0 && (
        <>
          {/* 進度指示 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">評估進度</h3>
                  <p className="text-sm text-blue-700">
                    已完成 {completedScenarios} / {totalScenarios} 個情境評估
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalScenarios > 0 ? Math.round((completedScenarios / totalScenarios) * 100) : 0}%
                  </div>
                  <div className="text-xs text-blue-600">完成度</div>
                </div>
              </div>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalScenarios > 0 ? (completedScenarios / totalScenarios) * 100 : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* 情境評估卡片 */}
          <div className="grid gap-8">
            {generatedScenarios.map((scenario, index) => {
              const analysis = scenarioAnalyses[scenario.id];
              const isGenerating = isGeneratingAnalyses[scenario.id];
              
              return (
                <Card key={scenario.id} className="border-l-4 border-purple-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          情境 {index + 1}: {scenario.subcategory_name}
                        </CardTitle>
                        <div className="flex space-x-2 mt-2">
                          <Badge variant="outline">{scenario.category_name}</Badge>
                          <Badge className={scenario.category_type === 'risk' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                            {scenario.category_type === 'risk' ? (
                              <><AlertTriangle className="h-3 w-3 mr-1" />風險</>
                            ) : (
                              <><TrendingUp className="h-3 w-3 mr-1" />機會</>
                            )}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI 生成
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 情境描述 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">情境描述</h4>
                      <p className="text-gray-800 leading-relaxed">
                        {scenario.scenario_description}
                      </p>
                    </div>

                    {/* 相關性評分 */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">
                        此情境對您企業的相關性評分 <span className="text-red-500">*</span>
                      </h4>
                      <div className="flex space-x-3 mb-4">
                        {[1, 2, 3].map(score => (
                          <ScoreButton
                            key={score}
                            score={score}
                            selectedScore={userScores[scenario.id]}
                            onClick={() => handleScoreChange(scenario.id, score)}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        1分：低相關性 | 2分：中等相關性 | 3分：高相關性
                      </div>
                    </div>

                    {/* AI 分析結果 */}
                    {analysis && (
                      <div className="space-y-6 border-t pt-6">
                        {/* 概要說明 */}
                        {analysis.scenario_summary && (
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                            <h4 className="font-medium text-blue-900 mb-2">情境概要</h4>
                            <p className="text-blue-800">{analysis.scenario_summary}</p>
                          </div>
                        )}

                        {/* 財務影響分析 */}
                        {analysis.financial_impact && renderFinancialImpact(analysis.financial_impact)}

                        {/* 管理策略建議 */}
                        {analysis.management_strategies && renderManagementStrategies(analysis.management_strategies)}
                      </div>
                    )}

                    {/* 生成分析中的狀態 */}
                    {userScores[scenario.id] && !analysis && isGenerating && (
                      <div className="text-center py-8 border-t">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-600" />
                        <h4 className="font-medium mb-2">AI 正在分析中...</h4>
                        <p className="text-sm text-gray-600">正在生成詳細的財務影響分析與策略建議</p>
                        <div className="mt-3 text-xs text-purple-600">
                          包含損益表、現金流、資產負債表影響分析及五種管理策略建議
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

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
