
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';
import { generateComprehensiveScenarioAnalysis } from '@/services/tcfd/comprehensiveScenarioService';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TCFDStage3Props {
  assessment: any;
  onNext: () => void;
  onPrevious: () => void;
}

const TCFDStage3: React.FC<TCFDStage3Props> = ({ 
  assessment, 
  onNext, 
  onPrevious 
}) => {
  const { riskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment?.id);
  const { scenarioEvaluations, saveScenarioEvaluation } = useTCFDScenarioEvaluations(assessment?.id);
  
  const [analyses, setAnalyses] = useState<{[key: string]: any}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [userModifications, setUserModifications] = useState<{[key: string]: string}>({});

  // 載入已完成的分析
  useEffect(() => {
    if (scenarioEvaluations && scenarioEvaluations.length > 0) {
      const analysisMap: {[key: string]: any} = {};
      const completed = new Set<string>();
      const modifications: {[key: string]: string} = {};
      
      scenarioEvaluations.forEach(evaluation => {
        const key = evaluation.risk_opportunity_id;
        // Check if llm_response contains analysis data
        if (evaluation.llm_response) {
          try {
            const analysisData = typeof evaluation.llm_response === 'string' 
              ? JSON.parse(evaluation.llm_response) 
              : evaluation.llm_response;
            analysisMap[key] = analysisData;
            completed.add(key);
          } catch (error) {
            console.error('Error parsing LLM response:', error);
          }
        }
      });
      
      setAnalyses(analysisMap);
      setCompletedItems(completed);
    }
  }, [scenarioEvaluations]);

  const handleGenerateAnalysis = async (selection: any) => {
    const key = selection.id;
    setIsGenerating(true);
    
    try {
      console.log('正在為項目生成綜合分析:', selection);
      
      // 獲取對應的情境評估
      const scenarioEvaluation = scenarioEvaluations.find(
        evaluation => evaluation.risk_opportunity_id === selection.id
      );
      
      if (!scenarioEvaluation) {
        throw new Error('找不到對應的情境評估資料');
      }

      const analysis = await generateComprehensiveScenarioAnalysis(
        selection.category_type,
        selection.category_name,
        selection.subcategory_name,
        scenarioEvaluation.scenario_description || '',
        scenarioEvaluation.user_score || 5,
        assessment.industry,
        assessment.company_size,
        assessment.business_description,
        {
          business_context: assessment.business_description
        }
      );

      console.log('生成的綜合分析:', analysis);
      
      // 更新本地狀態
      setAnalyses(prev => ({
        ...prev,
        [key]: analysis
      }));
      
      setCompletedItems(prev => new Set([...prev, key]));
      
      // 保存到資料庫
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: selection.id,
        scenario_description: scenarioEvaluation.scenario_description || '',
        user_score: scenarioEvaluation.user_score || 5,
        llm_response: JSON.stringify(analysis),
        scenario_generated_by_llm: true,
        is_demo_data: assessment.is_demo_data || false,
      });
      
      toast.success(`${selection.category_name} - ${selection.subcategory_name} 的策略分析已生成！`);
      
    } catch (error: any) {
      console.error('生成分析時發生錯誤:', error);
      toast.error(`生成分析失敗: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModificationChange = (key: string, value: string) => {
    setUserModifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveModifications = async (selection: any) => {
    const key = selection.id;
    try {
      const scenarioEvaluation = scenarioEvaluations.find(
        evaluation => evaluation.risk_opportunity_id === selection.id
      );
      
      if (scenarioEvaluation) {
        // Create a note about user modifications in the scenario description
        const modificationNote = userModifications[key] ? 
          `\n\n用戶修改: ${userModifications[key]}` : '';
        
        await saveScenarioEvaluation({
          ...scenarioEvaluation,
          scenario_description: scenarioEvaluation.scenario_description + modificationNote,
        });
        
        toast.success('修改已保存！');
      }
    } catch (error: any) {
      console.error('保存修改時發生錯誤:', error);
      toast.error(`保存失敗: ${error.message}`);
    }
  };

  const renderStrategies = (analysis: any, categoryType: 'risk' | 'opportunity') => {
    const strategies = categoryType === 'risk' ? analysis.risk_strategies : analysis.opportunity_strategies;
    
    if (!strategies) return null;

    return (
      <div className="grid gap-4 mt-4">
        {Object.entries(strategies).map(([strategyKey, strategy]: [string, any]) => (
          <Card key={strategyKey} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-700">{strategy.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">策略描述</Label>
                <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
              </div>
              
              {strategy.specific_actions && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">具體行動</Label>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside space-y-1">
                    {strategy.specific_actions.map((action: string, index: number) => (
                      <li key={index}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium text-gray-700">成本估算</Label>
                  <p className="text-gray-600">{strategy.cost_estimate || strategy.investment_estimate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">實施時間</Label>
                  <p className="text-gray-600">{strategy.implementation_timeline}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">可行性評分</Label>
                  <p className="text-gray-600">{strategy.feasibility_score}/5</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">預期效果</Label>
                  <p className="text-gray-600">{strategy.expected_effect || strategy.expected_benefits}</p>
                </div>
              </div>
              
              {strategy.feasibility_reason && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">可行性說明</Label>
                  <p className="text-sm text-gray-600">{strategy.feasibility_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFinancialImpact = (financialImpact: any) => {
    if (!financialImpact) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg text-green-700">財務影響分析</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {['profit_loss', 'cash_flow', 'balance_sheet'].map((key) => {
            const impact = financialImpact[key];
            if (!impact) return null;
            
            const titles: {[key: string]: string} = {
              profit_loss: '損益表影響',
              cash_flow: '現金流影響', 
              balance_sheet: '資產負債表影響'
            };
            
            return (
              <div key={key} className="border-l-4 border-l-green-500 pl-4">
                <h4 className="text-md font-semibold text-green-700 mb-2">{titles[key]}</h4>
                <p className="text-sm text-gray-600 mb-2">{impact.description}</p>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium">影響方向:</span> {impact.impact_direction}
                  </div>
                  <div>
                    <span className="font-medium">金額估計:</span> {impact.amount_estimate}
                  </div>
                  <div>
                    <span className="font-medium">時間範圍:</span> {impact.timeframe}
                  </div>
                </div>
                {impact.key_items && (
                  <div className="mt-2">
                    <span className="text-xs font-medium">主要影響項目:</span>
                    <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
                      {impact.key_items.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  if (!riskOpportunitySelections || riskOpportunitySelections.length === 0) {
    return (
      <div className="text-center py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            請先返回第二階段選擇風險與機會項目
          </AlertDescription>
        </Alert>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onPrevious}>
            返回
          </Button>
          <Button onClick={onNext} disabled>
            下一步
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LLM 情境分析與策略建議</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            系統將為您選擇的風險與機會項目生成詳細的財務影響分析和策略建議。
          </p>
        </CardContent>
      </Card>

      {riskOpportunitySelections.map((selection) => {
        const key = selection.id;
        const analysis = analyses[key];
        const isCompleted = completedItems.has(key);
        
        return (
          <Card key={key} className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selection.category_name} - {selection.subcategory_name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selection.category_type === 'risk' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {selection.category_type === 'risk' ? '風險' : '機會'}
                  </span>
                  {isCompleted && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">已完成分析</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={() => handleGenerateAnalysis(selection)}
                disabled={isGenerating}
                variant={isCompleted ? "outline" : "default"}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  isCompleted ? "重新生成" : "生成分析"
                )}
              </Button>
            </CardHeader>
            
            {analysis && (
              <CardContent className="space-y-4">
                {analysis.scenario_summary && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">情境摘要</Label>
                    <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded">
                      {analysis.scenario_summary}
                    </p>
                  </div>
                )}
                
                {analysis.financial_impact && renderFinancialImpact(analysis.financial_impact)}
                
                {renderStrategies(analysis, selection.category_type as 'risk' | 'opportunity')}
                
                <div className="border-t pt-4">
                  <Label htmlFor={`modifications-${key}`} className="text-sm font-medium text-gray-700">
                    用戶修改與補充
                  </Label>
                  <Textarea
                    id={`modifications-${key}`}
                    value={userModifications[key] || ''}
                    onChange={(e) => handleModificationChange(key, e.target.value)}
                    placeholder="您可以在此添加對策略的修改建議或補充說明..."
                    className="mt-2"
                    rows={3}
                  />
                  <Button
                    onClick={() => handleSaveModifications(selection)}
                    size="sm"
                    className="mt-2"
                    variant="outline"
                  >
                    保存修改
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          返回
        </Button>
        <Button 
          onClick={onNext}
          disabled={completedItems.size !== riskOpportunitySelections.length}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage3;
