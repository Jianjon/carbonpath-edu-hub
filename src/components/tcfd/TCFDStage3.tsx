import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, Lightbulb, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import TCFDLayout from './shared/TCFDLayout';
import TCFDContentCard from './shared/TCFDContentCard';
import TCFDFormSection from './shared/TCFDFormSection';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections, loadRiskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment.id);
  const { 
    scenarioEvaluations, 
    saveScenarioEvaluation, 
    loadScenarioEvaluations,
    generateScenarioWithLLM,
    generateComprehensiveScenarioAnalysis
  } = useTCFDScenarioEvaluations(assessment.id);
  
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [scenarioAnalysis, setScenarioAnalysis] = useState<Record<string, any>>({});
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState<Record<string, boolean>>({});

  // 載入選擇的風險機會項目
  useEffect(() => {
    loadRiskOpportunitySelections();
    loadScenarioEvaluations();
  }, []);

  // 初始化情境數據
  useEffect(() => {
    if (riskOpportunitySelections.length > 0) {
      const selectedItems = riskOpportunitySelections.filter(item => item.selected);
      console.log('Selected risk/opportunity items:', selectedItems);
      
      const scenarioData = selectedItems.map(item => ({
        id: item.id,
        categoryType: item.category_type,
        categoryName: item.category_name,
        subcategoryName: item.subcategory_name,
        scenarioDescription: '',
        userScore: 5,
        userNotes: '',
        llmResponse: null,
        isGenerated: false
      }));
      
      setScenarios(scenarioData);
      
      // 檢查是否已有儲存的評估資料
      if (scenarioEvaluations.length > 0) {
        const savedData: Record<string, any> = {};
        const savedScores: Record<string, number> = {};
        const savedNotes: Record<string, string> = {};
        
        scenarioEvaluations.forEach(evaluation => {
          const key = evaluation.risk_opportunity_id;
          savedData[key] = evaluation.llm_response;
          savedScores[key] = evaluation.user_score || 5;
          savedNotes[key] = evaluation.scenario_description || '';
        });
        
        setScenarioAnalysis(savedData);
        setUserScores(savedScores);
        setUserNotes(savedNotes);
        
        // 更新scenario資料
        const updatedScenarios = scenarioData.map(scenario => {
          const savedEvaluation = scenarioEvaluations.find(e => e.risk_opportunity_id === scenario.id);
          if (savedEvaluation) {
            return {
              ...scenario,
              scenarioDescription: savedEvaluation.scenario_description || '',
              userScore: savedEvaluation.user_score || 5,
              userNotes: savedEvaluation.scenario_description || '',
              llmResponse: savedEvaluation.llm_response,
              isGenerated: !!savedEvaluation.llm_response
            };
          }
          return scenario;
        });
        setScenarios(updatedScenarios);
      }
    }
  }, [riskOpportunitySelections, scenarioEvaluations]);

  // 生成情境描述
  const generateScenario = async (scenarioIndex: number) => {
    const scenario = scenarios[scenarioIndex];
    if (!scenario) return;

    // 檢查是否已有相同參數的情境描述
    const existingEvaluation = scenarioEvaluations.find(e => 
      e.risk_opportunity_id === scenario.id &&
      e.scenario_description &&
      e.scenario_description.length > 0
    );

    if (existingEvaluation) {
      console.log('使用資料庫中的情境描述');
      setUserNotes(prev => ({
        ...prev,
        [scenario.id]: existingEvaluation.scenario_description
      }));
      
      const updatedScenarios = [...scenarios];
      updatedScenarios[scenarioIndex] = {
        ...scenario,
        scenarioDescription: existingEvaluation.scenario_description,
        isGenerated: true
      };
      setScenarios(updatedScenarios);
      return;
    }

    setIsGenerating(true);
    try {
      console.log('使用LLM生成新的情境描述');
      const response = await generateScenarioWithLLM(
        scenario.categoryType,
        scenario.categoryName,
        scenario.subcategoryName,
        assessment.industry
      );

      const updatedScenarios = [...scenarios];
      updatedScenarios[scenarioIndex] = {
        ...scenario,
        scenarioDescription: response.scenario_description,
        isGenerated: true
      };
      setScenarios(updatedScenarios);
      
      setUserNotes(prev => ({
        ...prev,
        [scenario.id]: response.scenario_description
      }));

      toast.success('情境描述已生成');
    } catch (error) {
      console.error('生成情境描述失敗:', error);
      toast.error('生成情境描述失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成綜合分析
  const generateAnalysis = async (scenarioIndex: number) => {
    const scenario = scenarios[scenarioIndex];
    if (!scenario || !scenario.scenarioDescription) {
      toast.error('請先生成情境描述');
      return;
    }

    const score = userScores[scenario.id] || 5;
    const description = userNotes[scenario.id] || scenario.scenarioDescription;

    // 檢查是否已有相同參數的分析
    const existingEvaluation = scenarioEvaluations.find(e => 
      e.risk_opportunity_id === scenario.id &&
      e.user_score === score &&
      e.scenario_description === description &&
      e.llm_response
    );

    if (existingEvaluation) {
      console.log('使用資料庫中的分析結果');
      setScenarioAnalysis(prev => ({
        ...prev,
        [scenario.id]: JSON.parse(existingEvaluation.llm_response)
      }));
      return;
    }

    setIsGeneratingAnalysis(prev => ({
      ...prev,
      [scenario.id]: true
    }));

    try {
      console.log('使用LLM生成新的分析');
      const response = await generateComprehensiveScenarioAnalysis(
        scenario.categoryType,
        scenario.categoryName,
        scenario.subcategoryName,
        description,
        score,
        assessment.industry,
        assessment.company_size
      );

      setScenarioAnalysis(prev => ({
        ...prev,
        [scenario.id]: response
      }));

      // 儲存到資料庫
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: scenario.id,
        category_name: scenario.categoryName,
        subcategory_name: scenario.subcategoryName || '',
        scenario_description: description,
        user_score: score,
        likelihood_score: score, // Use the same score for likelihood
        llm_response: JSON.stringify(response),
        scenario_generated_by_llm: true
      });

      toast.success('分析已完成並儲存');
    } catch (error) {
      console.error('生成分析失敗:', error);
      toast.error('生成分析失敗');
    } finally {
      setIsGeneratingAnalysis(prev => ({
        ...prev,
        [scenario.id]: false
      }));
    }
  };

  // 儲存評估資料
  const saveEvaluation = async (scenarioIndex: number) => {
    const scenario = scenarios[scenarioIndex];
    if (!scenario) return;

    const score = userScores[scenario.id] || 5;
    const description = userNotes[scenario.id] || scenario.scenarioDescription;

    try {
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: scenario.id,
        category_name: scenario.categoryName,
        subcategory_name: scenario.subcategoryName || '',
        scenario_description: description,
        user_score: score,
        likelihood_score: score, // Use the same score for likelihood
        llm_response: scenarioAnalysis[scenario.id] ? JSON.stringify(scenarioAnalysis[scenario.id]) : null,
        scenario_generated_by_llm: true
      });
      
      toast.success('評估已儲存');
    } catch (error) {
      console.error('儲存評估失敗:', error);
      toast.error('儲存評估失敗');
    }
  };

  const handleScoreChange = (scenarioId: string, value: number[]) => {
    setUserScores(prev => ({
      ...prev,
      [scenarioId]: value[0]
    }));
  };

  const handleNotesChange = (scenarioId: string, value: string) => {
    setUserNotes(prev => ({
      ...prev,
      [scenarioId]: value
    }));
  };

  const handleComplete = () => {
    // 儲存階段結果到 sessionStorage
    const stage3Results = {
      assessment,
      scenarios,
      userScores,
      userNotes,
      scenarioAnalysis,
      completedAt: new Date().toISOString()
    };
    
    sessionStorage.setItem('tcfd-stage3-results', JSON.stringify(stage3Results));
    console.log('第三階段結果已儲存:', stage3Results);
    
    onComplete();
  };

  const currentScenario = scenarios[currentScenarioIndex];

  if (scenarios.length === 0) {
    return (
      <TCFDLayout
        stage="第三階段"
        title="LLM 情境評估"
        description="使用 AI 技術生成具體的風險與機會情境，並進行詳細的影響評估"
        icon={Lightbulb}
        assessment={assessment}
      >
        <TCFDContentCard title="載入中" className="text-center">
          <div className="py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-600" />
            <p className="text-slate-600">正在載入選擇的風險機會項目...</p>
          </div>
        </TCFDContentCard>
      </TCFDLayout>
    );
  }

  return (
    <TCFDLayout
      stage="第三階段"
      title="LLM 情境評估"
      description="針對您選擇的風險與機會項目，使用 AI 技術生成具體情境並進行影響評估"
      icon={Lightbulb}
      assessment={assessment}
    >
      {/* 進度指示器 */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium text-slate-800">評估進度</h3>
              <p className="text-sm text-slate-600">
                第 {currentScenarioIndex + 1} 項，共 {scenarios.length} 項
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-700">
                {Math.round(((currentScenarioIndex + 1) / scenarios.length) * 100)}%
              </div>
              <div className="text-xs text-slate-500">完成率</div>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentScenarioIndex + 1) / scenarios.length) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* 當前情境評估 */}
      {currentScenario && (
        <TCFDContentCard
          title={`${currentScenario.categoryType === 'risk' ? '風險' : '機會'} - ${currentScenario.categoryName}`}
          icon={currentScenario.categoryType === 'risk' ? AlertTriangle : TrendingUp}
          badge={{
            text: currentScenario.subcategoryName,
            variant: 'outline'
          }}
        >
          <div className="space-y-6">
            {/* 情境描述生成 */}
            <TCFDFormSection
              title="情境描述"
              description="AI 將為此項目生成具體的情境描述"
              required
            >
              <div className="space-y-4">
                <Button
                  onClick={() => generateScenario(currentScenarioIndex)}
                  disabled={isGenerating || currentScenario.isGenerated}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : currentScenario.isGenerated ? (
                    '情境已生成'
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      生成情境描述
                    </>
                  )}
                </Button>

                {(currentScenario.scenarioDescription || userNotes[currentScenario.id]) && (
                  <div className="space-y-2">
                    <Label htmlFor="scenario-notes">情境描述 (可編輯)</Label>
                    <Textarea
                      id="scenario-notes"
                      value={userNotes[currentScenario.id] || currentScenario.scenarioDescription}
                      onChange={(e) => handleNotesChange(currentScenario.id, e.target.value)}
                      placeholder="編輯或補充情境描述..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                )}
              </div>
            </TCFDFormSection>

            {/* 影響程度評分 */}
            <TCFDFormSection
              title="影響程度評分"
              description="請為此情境的影響程度評分 (1-10 分)"
              required
            >
              <div className="space-y-4">
                <div className="px-4 py-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">影響程度</span>
                    <span className="text-lg font-semibold text-slate-800">
                      {userScores[currentScenario.id] || 5} 分
                    </span>
                  </div>
                  <Slider
                    value={[userScores[currentScenario.id] || 5]}
                    onValueChange={(value) => handleScoreChange(currentScenario.id, value)}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>1 (輕微)</span>
                    <span>5 (中等)</span>
                    <span>10 (嚴重)</span>
                  </div>
                </div>
              </div>
            </TCFDFormSection>

            {/* 綜合分析 */}
            <TCFDFormSection
              title="綜合分析"
              description="基於情境描述和影響程度，生成詳細的影響分析"
            >
              <div className="space-y-4">
                <Button
                  onClick={() => generateAnalysis(currentScenarioIndex)}
                  disabled={isGeneratingAnalysis[currentScenario.id] || !currentScenario.scenarioDescription}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingAnalysis[currentScenario.id] ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    '生成綜合分析'
                  )}
                </Button>

                {scenarioAnalysis[currentScenario.id] && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-slate-800">AI 分析結果</h4>
                    <div className="text-sm text-slate-600 space-y-2">
                      <div>
                        <span className="font-medium">影響評估：</span>
                        {scenarioAnalysis[currentScenario.id].impact_assessment}
                      </div>
                      <div>
                        <span className="font-medium">建議策略：</span>
                        {scenarioAnalysis[currentScenario.id].recommended_strategy}
                      </div>
                      <div>
                        <span className="font-medium">時間框架：</span>
                        {scenarioAnalysis[currentScenario.id].time_horizon}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TCFDFormSection>

            {/* 操作按鈕 */}
            <div className="flex justify-between pt-4">
              <Button
                onClick={() => setCurrentScenarioIndex(Math.max(0, currentScenarioIndex - 1))}
                disabled={currentScenarioIndex === 0}
                variant="outline"
              >
                上一項
              </Button>
              
              <Button
                onClick={() => saveEvaluation(currentScenarioIndex)}
                variant="outline"
              >
                儲存評估
              </Button>

              {currentScenarioIndex < scenarios.length - 1 ? (
                <Button
                  onClick={() => setCurrentScenarioIndex(currentScenarioIndex + 1)}
                >
                  下一項
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  完成評估
                </Button>
              )}
            </div>
          </div>
        </TCFDContentCard>
      )}
    </TCFDLayout>
  );
};

export default TCFDStage3;
