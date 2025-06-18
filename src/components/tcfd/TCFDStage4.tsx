
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { Target, DollarSign, Loader2, Sparkles } from 'lucide-react';

interface TCFDStage4Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage4 = ({ assessment, onComplete }: TCFDStage4Props) => {
  const {
    scenarioEvaluations,
    strategyAnalysis,
    saveStrategyAnalysis,
    generateStrategyAnalysisWithLLM,
    loading
  } = useTCFDAssessment(assessment.id);

  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState<Record<string, string>>({});
  const [userModifications, setUserModifications] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (scenarioEvaluations.length > 0 && analysisData.length === 0) {
      generateAnalysis();
    }
  }, [scenarioEvaluations]);

  const generateAnalysis = async () => {
    setIsGenerating(true);
    try {
      const analysisResults = [];

      for (const evaluation of scenarioEvaluations) {
        try {
          console.log('正在生成策略分析：', evaluation.scenario_description);
          
          const analysis = await generateStrategyAnalysisWithLLM(
            evaluation.scenario_description,
            evaluation.user_score || 1,
            assessment.industry
          );

          analysisResults.push({
            id: `analysis-${evaluation.id}`,
            scenario_evaluation_id: evaluation.id,
            scenario_description: evaluation.scenario_description,
            user_score: evaluation.user_score,
            ...analysis,
            generated_by_llm: true,
          });
        } catch (error) {
          console.error('生成策略分析失敗：', evaluation.id, error);
        }
      }
      
      setAnalysisData(analysisResults);
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStrategySelect = (analysisId: string, strategy: string) => {
    setSelectedStrategies(prev => ({
      ...prev,
      [analysisId]: strategy
    }));
  };

  const handleModificationChange = (analysisId: string, modification: string) => {
    setUserModifications(prev => ({
      ...prev,
      [analysisId]: modification
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const analysis of analysisData) {
        const selectedStrategy = selectedStrategies[analysis.id];
        const modifications = userModifications[analysis.id];

        if (selectedStrategy) {
          await saveStrategyAnalysis({
            assessment_id: assessment.id,
            scenario_evaluation_id: analysis.scenario_evaluation_id,
            detailed_description: analysis.detailed_description,
            financial_impact_pnl: analysis.financial_impact_pnl,
            financial_impact_cashflow: analysis.financial_impact_cashflow,
            financial_impact_balance_sheet: analysis.financial_impact_balance_sheet,
            strategy_avoid: analysis.strategy_avoid,
            strategy_accept: analysis.strategy_accept,
            strategy_transfer: analysis.strategy_transfer,
            strategy_mitigate: analysis.strategy_mitigate,
            selected_strategy: selectedStrategy,
            user_modifications: modifications,
            generated_by_llm: true,
          });
        }
      }
      onComplete();
    } catch (error) {
      console.error('Error saving strategy analysis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const strategies = [
    { key: 'avoid', label: '避免策略', description: '消除或避免風險源頭' },
    { key: 'mitigate', label: '減緩策略', description: '降低風險發生機率或影響程度' },
    { key: 'transfer', label: '轉移策略', description: '透過保險或外包轉移風險' },
    { key: 'accept', label: '承擔策略', description: '接受風險並準備應對措施' },
  ];

  const completedAnalysis = Object.keys(selectedStrategies).length;
  const totalAnalysis = analysisData.length;
  const canProceed = completedAnalysis === totalAnalysis && totalAnalysis > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <Target className="h-8 w-8 text-orange-600" />
            <span>第四階段：策略與財務分析</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            AI 將根據您的評估結果，生成詳細的策略建議與財務影響分析
          </p>
        </CardHeader>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <DollarSign className="h-8 w-8 text-orange-600 animate-pulse" />
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">AI 正在分析策略與財務影響...</h3>
            <p className="text-gray-600">
              根據您的情境評估結果，生成具體的應對策略與財務影響分析
            </p>
            <div className="mt-4 text-sm text-orange-600">
              正在處理 {scenarioEvaluations.length} 個情境評估
            </div>
          </CardContent>
        </Card>
      )}

      {analysisData.length > 0 && (
        <>
          {/* 進度指示 */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-orange-900">策略選擇進度</h3>
                  <p className="text-sm text-orange-700">
                    已完成 {completedAnalysis} / {totalAnalysis} 個策略選擇
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {totalAnalysis > 0 ? Math.round((completedAnalysis / totalAnalysis) * 100) : 0}%
                  </div>
                  <div className="text-xs text-orange-600">完成度</div>
                </div>
              </div>
              <div className="mt-3 w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalAnalysis > 0 ? (completedAnalysis / totalAnalysis) * 100 : 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* 策略分析卡片 */}
          <div className="grid gap-8">
            {analysisData.map((analysis, index) => (
              <Card key={analysis.id} className="border-l-4 border-orange-500">
                <CardHeader>
                  <CardTitle className="text-lg">
                    分析 {index + 1}: 情境策略建議
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Badge className="bg-orange-100 text-orange-800">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI 生成分析
                    </Badge>
                    <Badge variant="outline">
                      影響程度: {analysis.user_score}/3 分
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 情境回顧 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">情境描述</h4>
                    <p className="text-sm text-gray-700">{analysis.scenario_description}</p>
                  </div>

                  {/* 詳細說明 */}
                  <div>
                    <h4 className="font-medium mb-2">詳細影響分析</h4>
                    <p className="text-gray-700">{analysis.detailed_description}</p>
                  </div>

                  {/* 財務影響 */}
                  <div>
                    <h4 className="font-medium mb-3">財務影響評估</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <h5 className="font-medium text-blue-900 mb-1">損益表影響</h5>
                        <p className="text-sm text-blue-800">{analysis.financial_impact_pnl}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <h5 className="font-medium text-green-900 mb-1">現金流影響</h5>
                        <p className="text-sm text-green-800">{analysis.financial_impact_cashflow}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <h5 className="font-medium text-purple-900 mb-1">資產負債表影響</h5>
                        <p className="text-sm text-purple-800">{analysis.financial_impact_balance_sheet}</p>
                      </div>
                    </div>
                  </div>

                  {/* 策略選項 */}
                  <div>
                    <h4 className="font-medium mb-3">應對策略選項 <span className="text-red-500">*</span></h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {strategies.map(strategy => (
                        <div 
                          key={strategy.key}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedStrategies[analysis.id] === strategy.key
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleStrategySelect(analysis.id, strategy.key)}
                        >
                          <h5 className="font-medium mb-1">{strategy.label}</h5>
                          <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                          <p className="text-sm text-gray-700">
                            {analysis[`strategy_${strategy.key}` as keyof typeof analysis]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 用戶修改意見 */}
                  <div>
                    <h4 className="font-medium mb-2">補充意見或修改建議</h4>
                    <Textarea
                      placeholder="您可以在此補充對策略的修改意見或額外考量因素..."
                      value={userModifications[analysis.id] || ''}
                      onChange={(e) => handleModificationChange(analysis.id, e.target.value)}
                      rows={3}
                    />
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
              {isSubmitting ? '儲存策略中...' : '進入報告生成階段'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TCFDStage4;
