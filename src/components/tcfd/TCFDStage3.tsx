
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { Brain, Star, Loader2 } from 'lucide-react';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { 
    riskOpportunitySelections, 
    scenarioEvaluations, 
    saveScenarioEvaluation,
    loading 
  } = useTCFDAssessment(assessment.id);
  
  const [generatedScenarios, setGeneratedScenarios] = useState<any[]>([]);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (riskOpportunitySelections.length > 0 && generatedScenarios.length === 0) {
      generateScenarios();
    }
  }, [riskOpportunitySelections]);

  const generateScenarios = async () => {
    setIsGeneratingScenarios(true);
    try {
      // TODO: 實際呼叫 LLM API 生成情境
      // 暫時使用模擬資料
      const mockScenarios = riskOpportunitySelections
        .filter(sel => sel.selected && sel.subcategory_name)
        .map(selection => ({
          id: `scenario-${selection.id}`,
          risk_opportunity_id: selection.id,
          category_name: selection.category_name,
          subcategory_name: selection.subcategory_name,
          scenario_description: `針對「${selection.subcategory_name}」的詳細情境描述將由 LLM 根據您的產業（${assessment.industry}）和企業規模（${assessment.company_size}）生成...`,
          scenario_generated_by_llm: true,
        }));
      
      setGeneratedScenarios(mockScenarios);
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGeneratingScenarios(false);
    }
  };

  const handleScoreChange = (scenarioId: string, score: number) => {
    setUserScores(prev => ({
      ...prev,
      [scenarioId]: score
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 儲存所有評估結果
      for (const scenario of generatedScenarios) {
        const score = userScores[scenario.id];
        if (score) {
          await saveScenarioEvaluation({
            assessment_id: assessment.id,
            risk_opportunity_id: scenario.risk_opportunity_id,
            scenario_description: scenario.scenario_description,
            scenario_generated_by_llm: true,
            user_score: score,
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

  const completedScenarios = Object.keys(userScores).length;
  const totalScenarios = generatedScenarios.length;
  const canProceed = completedScenarios === totalScenarios && totalScenarios > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span>第三階段：LLM 情境評估與自評</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            AI 將根據您選擇的風險與機會類別，生成具體的業務情境供您評估
          </p>
        </CardHeader>
      </Card>

      {isGeneratingScenarios && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-medium mb-2">AI 正在生成情境...</h3>
            <p className="text-gray-600">
              根據您的產業別（{assessment.industry}）和企業規模，
              為您量身定制氣候相關情境描述
            </p>
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
                    {Math.round((completedScenarios / totalScenarios) * 100)}%
                  </div>
                  <div className="text-xs text-blue-600">完成度</div>
                </div>
              </div>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedScenarios / totalScenarios) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* 情境評估卡片 */}
          <div className="grid gap-6">
            {generatedScenarios.map((scenario, index) => (
              <Card key={scenario.id} className="border-l-4 border-purple-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        情境 {index + 1}: {scenario.subcategory_name}
                      </CardTitle>
                      <div className="flex space-x-2 mt-2">
                        <Badge variant="outline">{scenario.category_name}</Badge>
                        <Badge className="bg-purple-100 text-purple-800">
                          <Brain className="h-3 w-3 mr-1" />
                          AI 生成
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">
                      {scenario.scenario_description}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">
                      此情境對您企業的相關性評分 <span className="text-red-500">*</span>
                    </h4>
                    <div className="flex space-x-3">
                      {[1, 2, 3].map(score => (
                        <ScoreButton
                          key={score}
                          score={score}
                          selectedScore={userScores[scenario.id]}
                          onClick={() => handleScoreChange(scenario.id, score)}
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      1分：低相關性 | 2分：中等相關性 | 3分：高相關性
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
