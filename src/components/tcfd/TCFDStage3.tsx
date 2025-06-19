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
    const companyContext = `${assessment.company_size}規模的${assessment.industry}企業`;
    
    // 從分析中提取情境描述，如果沒有就用默認描述
    if (analysis?.scenario_description) {
      return analysis.scenario_description;
    }
    
    // 根據不同情境類型生成具體且切身的描述，聚焦真實法規和營運狀況
    const scenarioDescriptions: Record<string, string> = {
      // 實體風險
      '急性實體風險-極端天氣事件': `近年來台灣颱風強度增強，豪雨頻率提升，對${companyContext}的營運設施造成直接威脅。當極端天氣發生時，倉儲設施可能淹水、運輸路線中斷、員工無法正常到班，導致供應鏈全面停擺。特別是夏季颱風季節，企業必須提前備妥應變計畫，包括緊急疏散程序、備用設施啟動、與保險公司的理賠流程等。缺乏完善災害應變機制的企業，往往在災後復原期面臨客戶流失、供應商重新洽談合約等長期營運挑戰。`,
      
      '慢性實體風險-氣溫上升': `台灣氣象局數據顯示，平均氣溫持續上升，夏季高溫日數增加，直接影響${companyContext}的日常營運。工作環境溫度過高不僅影響員工工作效率與健康安全，也增加設備故障風險。製造業需要投資更強力的空調系統，服務業必須調整營業時間以因應用電尖峰限制。長期而言，企業面臨勞動檢查更嚴格的職業安全衛生要求，必須重新檢視現有設施的適用性，並規劃設備升級與營運模式調整。`,
      
      // 轉型風險  
      '政策和法規-主管機關要求申報完整溫室氣體盤查': `依據《氣候變遷因應法》，主管機關已要求特定規模企業進行溫室氣體盤查申報。${companyContext}必須建立完整的碳排放數據收集系統，包含直接排放、間接排放及價值鏈排放。企業需指派專責人員、導入盤查工具、委託第三方查證機構，並在規定期限內完成申報。未依規定申報或申報不實者，將面臨罰鍰處分，情節重大者可能限制營業或撤銷許可。此外，盤查結果將影響後續碳費徵收，企業必須做好長期的碳管理規劃。`,
      
      '技術-競爭對手推出低碳替代產品，市場佔有率受威脅': `隨著消費者環保意識提升及政府綠色採購政策推動，市場上出現多款經環保標章認證的低碳替代產品。${companyContext}發現主要競爭對手已取得碳足跡標籤、環保標章等認證，並在政府標案中獲得加分優勢。傳統產品在招標時面臨劣勢，零售通路也開始要求供應商提供產品碳足跡資訊。企業必須評估現有產品線的競爭力，決定是否投入低碳技術研發、申請相關認證，或尋找策略合作夥伴共同開發符合市場需求的綠色產品。`,
      
      '市場-消費者偏好轉向環保產品，傳統產品需求下滑': `消費者行為調查顯示，越來越多消費者在購買決策時考慮產品的環境影響，特別是年輕族群對於企業社會責任的要求日益提高。${companyContext}觀察到客戶開始詢問產品的碳足跡、包裝材料是否可回收、生產過程是否符合環保標準等問題。大型通路商也開始設立綠色商品專區，要求供應商提供環保認證。企業需要重新評估產品組合策略，考慮導入綠色設計概念、改善包裝材料、調整行銷策略，以回應市場需求變化。`,
      
      '市場-public_sector_opportunities': `政府推動淨零轉型政策，公部門綠色採購比重持續提升，要求投標廠商需具備環保相關認證或承諾減碳目標。${companyContext}在參與政府標案時，發現評選標準已將環保績效納入重要考量因子。具有ISO 14001環境管理系統認證、取得碳足跡標籤或承諾使用再生能源的廠商，在評選時享有加分優勢。企業需要了解各政府機關的綠色採購政策，評估投資環保認證的必要性，並建立長期的環境績效追蹤機制，以掌握公部門商機。`,
      
      // 機會
      '資源效率-能源使用效率': `因應電價調漲及用電大戶再生能源義務，${companyContext}積極尋求能源效率改善方案。政府提供節能設備汰換補助、能源管理系統導入輔導等資源，企業可透過申請經濟部節能績效保證專案（ESCO）或設置太陽能發電系統，降低長期用電成本。同時，取得ISO 50001能源管理系統認證，不僅有助於系統性管理能源使用，也符合ESG報告揭露要求，提升企業形象與投資人信心。`,
      
      '產品和服務-低碳產品開發': `隨著碳邊境調整機制（CBAM）即將實施，出口導向企業面臨碳洩漏風險，但也創造了低碳產品的市場需求。${companyContext}可運用經濟部「產業創新條例」的研發投資抵減優惠，投入低碳技術研發。申請「產品碳足跡標籤」認證，不僅有助於產品差異化，也符合國際供應鏈的環保要求。政府「5+2產業創新計畫」中的綠能科技產業，提供多項輔導資源與補助機會，企業可善用這些政策工具建立競爭優勢。`,
      
      '韌性-建立多元化資源供應體系': `COVID-19疫情及俄烏戰爭凸顯供應鏈韌性的重要性，政府推動「供應鏈重組」政策，鼓勵企業建立多元化供應來源。${companyContext}可透過參與「台商回台投資方案」或「根留台灣企業加速投資行動方案」，獲得融資優惠與投資抵減。同時，配合新南向政策拓展東南亞供應鏈布局，不僅分散風險，也符合地緣政治重組趨勢。建立本土供應鏈也有助於降低碳足跡，符合國際品牌商的採購要求。`,
    };
    
    const key = `${scenario.category_name}-${scenario.subcategory_name}`;
    return scenarioDescriptions[key] || `${scenario.subcategory_name}情境對${companyContext}而言，代表著重要的${isRisk ? '營運風險' : '發展機會'}。此情境涉及相關法規要求與市場變化，需要企業評估現有營運模式的適應性，並制定相應的管理策略。建議密切關注主管機關政策動向、同業因應作法，以及國際趨勢發展，及早準備相關應對措施，確保企業營運的合規性與競爭力。`;
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
