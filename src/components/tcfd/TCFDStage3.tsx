
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

interface GenerationProgress {
  total: number;
  completed: number;
  current: string;
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
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({ total: 0, completed: 0, current: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 從評估結果中獲取選擇的情境
  const selectedScenarios = riskOpportunitySelections.filter(selection => selection.selected);

  // 優化：並行生成所有策略分析
  const generateAllStrategiesAnalysis = useCallback(async () => {
    if (selectedScenarios.length === 0) return;
    
    console.log('開始並行生成所有情境的策略分析');
    setIsGenerating(true);
    setGenerationProgress({ total: selectedScenarios.length, completed: 0, current: '' });

    // 創建所有生成任務的 Promise 數組
    const generationTasks = selectedScenarios.map(async (scenario, index) => {
      const scenarioKey = `${scenario.category_name}-${scenario.subcategory_name}`;
      
      // 如果已經有分析結果，跳過
      if (strategyAnalyses[scenarioKey]) {
        return { scenarioKey, analysis: strategyAnalyses[scenarioKey] };
      }

      try {
        // 更新當前進度
        setGenerationProgress(prev => ({ 
          ...prev, 
          current: scenario.subcategory_name 
        }));

        // 尋找對應的scenario evaluation或創建默認值
        let scenarioEvaluation = scenarioEvaluations.find(evaluation => 
          evaluation.category_name === scenario.category_name && 
          evaluation.subcategory_name === scenario.subcategory_name
        );

        if (!scenarioEvaluation) {
          const defaultDescription = `${scenario.category_name}類型的${scenario.subcategory_name}情境，對${assessment.industry}行業的${assessment.company_size}企業可能造成${scenario.category_type === 'risk' ? '風險' : '機會'}影響。`;
          scenarioEvaluation = {
            id: `temp-${Date.now()}-${index}`,
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

        const analysis = await generateComprehensiveScenarioAnalysis(
          scenario.category_type,
          scenario.category_name,
          scenario.subcategory_name,
          scenarioEvaluation.scenario_description,
          scenarioEvaluation.likelihood_score,
          assessment.industry,
          assessment.company_size
        );

        // 更新完成進度
        setGenerationProgress(prev => ({ 
          ...prev, 
          completed: prev.completed + 1 
        }));

        return { scenarioKey, analysis };
      } catch (error) {
        console.error(`策略分析生成失敗 (${scenarioKey}):`, error);
        toast.error(`${scenario.subcategory_name} 策略分析生成失敗`);
        
        // 更新完成進度（即使失敗也算完成）
        setGenerationProgress(prev => ({ 
          ...prev, 
          completed: prev.completed + 1 
        }));
        
        return { scenarioKey, analysis: null };
      }
    });

    try {
      // 並行執行所有生成任務
      const results = await Promise.all(generationTasks);
      
      // 批量更新狀態
      const newAnalyses: Record<string, any> = {};
      results.forEach(result => {
        if (result.analysis) {
          newAnalyses[result.scenarioKey] = result.analysis;
        }
      });
      
      setStrategyAnalyses(prev => ({ ...prev, ...newAnalyses }));
      
      const successCount = results.filter(r => r.analysis).length;
      if (successCount > 0) {
        toast.success(`成功生成 ${successCount} 個情境的策略分析`);
      }
      
    } catch (error) {
      console.error('批量生成策略分析失敗:', error);
      toast.error('策略分析生成過程中發生錯誤');
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ total: 0, completed: 0, current: '' });
    }
  }, [selectedScenarios, strategyAnalyses, scenarioEvaluations, assessment, generateComprehensiveScenarioAnalysis]);

  // 使用 useCallback 避免重複渲染
  const initializeStrategies = useCallback(() => {
    if (selectedScenarios.length > 0 && !initialized) {
      console.log('初始化策略選擇狀態，情境數量:', selectedScenarios.length);
      const initialStrategies: Record<string, string> = {};
      selectedScenarios.forEach(scenario => {
        const key = `${scenario.category_name}-${scenario.subcategory_name}`;
        initialStrategies[key] = '';
      });
      setSelectedStrategies(initialStrategies);
      setInitialized(true);
      
      // 立即開始並行生成所有策略分析
      generateAllStrategiesAnalysis();
    }
  }, [selectedScenarios, initialized, generateAllStrategiesAnalysis]);

  useEffect(() => {
    initializeStrategies();
  }, [initializeStrategies]);

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

  // 生成切身相關的情境描述
  const generateScenarioDescription = (scenario: any, analysis: any) => {
    const isRisk = scenario.category_type === 'risk';
    const companyContext = `${assessment.company_size}的${assessment.industry}企業`;
    
    // 從分析中提取情境描述，如果沒有就用默認描述
    if (analysis?.scenario_description) {
      return analysis.scenario_description;
    }
    
    // 根據不同情境類型生成具體描述
    const scenarioDescriptions: Record<string, string> = {
      // 實體風險
      '急性實體風險-極端天氣事件': `對於${companyContext}而言，極端天氣如颱風、暴雨可能導致生產設施受損、供應鏈中斷，每次災害可能造成數百萬至千萬元損失。特別是依賴戶外作業或精密設備的企業，更需要提前建立應變機制。`,
      '慢性實體風險-氣溫上升': `隨著全球暖化，${companyContext}將面臨冷卻成本增加、員工工作效率下降等挑戰。製造業可能需要額外投資空調設備，服務業則需考慮顧客舒適度對營收的影響。`,
      
      // 轉型風險
      '政策法規風險-碳定價機制': `政府推動碳費、碳稅政策，${companyContext}每年可能面臨數十萬至數百萬元的碳成本。高排放行業如製造業、運輸業影響尤為顯著，需要儘早規劃減碳措施。`,
      '技術風險-低碳技術轉換': `隨著低碳技術快速發展，${companyContext}若未及時導入新技術，可能在競爭中落後。傳統製程面臨淘汰壓力，需要投資設備升級或技術轉型。`,
      '市場風險-消費者偏好改變': `消費者越來越重視環保，${companyContext}若無法提供綠色產品或服務，可能失去市場份額。零售業、服務業需要調整產品組合以滿足新需求。`,
      
      // 機會
      '資源效率機會-能源使用效率': `透過提升能源效率，${companyContext}可以顯著降低營運成本。導入LED照明、變頻空調等措施，每年可節省數十萬元電費，投資回收期通常在3-5年內。`,
      '產品服務機會-低碳產品開發': `開發低碳產品為${companyContext}帶來新商機。環保意識抬頭下，綠色產品往往能獲得價格溢價，有助於提升獲利能力和品牌形象。`,
      '市場機會-新興市場進入': `綠色轉型為${companyContext}開啟新市場機會。政府綠色採購、ESG投資熱潮等趨勢，為具備環保認證的企業創造更多商業機會。`,
    };
    
    const key = `${scenario.category_name}-${scenario.subcategory_name}`;
    return scenarioDescriptions[key] || `${scenario.subcategory_name}對${companyContext}可能帶來重要的${isRisk ? '風險' : '機會'}影響，需要制定相應的管理策略來因應。`;
  };

  const renderScenarioCard = (scenario: any) => {
    const scenarioKey = `${scenario.category_name}-${scenario.subcategory_name}`;
    const selectedStrategy = selectedStrategies[scenarioKey];
    const analysis = strategyAnalyses[scenarioKey];
    
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
          
          {/* 情境描述 - 新增這個區塊 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              情境描述
            </h4>
            <p className="text-gray-700 leading-relaxed text-sm">
              {generateScenarioDescription(scenario, analysis)}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 生成進度狀態 */}
          {isGenerating && !analysis && (
            <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <div className="text-blue-800">
                <div className="font-medium">正在生成策略分析...</div>
                <div className="text-sm mt-1">
                  進度: {generationProgress.completed}/{generationProgress.total}
                  {generationProgress.current && ` - 當前: ${generationProgress.current}`}
                </div>
              </div>
            </div>
          )}

          {/* 策略分析結果 */}
          {analysis && (
            <div className="space-y-4">
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
              {isGenerating && (
                <p className="text-xs text-blue-600 mt-1">
                  🔄 正在並行生成策略分析 ({generationProgress.completed}/{generationProgress.total})
                </p>
              )}
              {!isGenerating && Object.keys(strategyAnalyses).length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ 已生成 {Object.keys(strategyAnalyses).length} 個情境的策略分析
                </p>
              )}
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
            isGenerating
          }
          size="lg"
          className="px-8"
        >
          {isSubmitting ? '保存中...' : 
           isGenerating ? `生成中... (${generationProgress.completed}/${generationProgress.total})` :
           `完成策略制定 (${Object.values(selectedStrategies).filter(s => s).length}/${selectedScenarios.length})`}
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage3;
