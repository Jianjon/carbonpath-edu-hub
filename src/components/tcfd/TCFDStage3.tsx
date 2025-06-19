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
import FinancialAnalysisReport from './FinancialAnalysisReport';
import { generateFinancialAnalysis, FinancialAnalysisInput } from '@/services/tcfd/financialAnalysisService';

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
    
    // 從分析中提取情境描述，如果沒有就用針對性描述
    if (analysis?.scenario_description) {
      return analysis.scenario_description;
    }
    
    // 根據不同類別的核心主題生成具體描述
    const scenarioDescriptions: Record<string, string> = {
      // 實體風險 - 聚焦氣候物理影響
      '急性實體風險-極端天氣事件': `台灣位處西太平洋颱風路徑，近年來氣候變遷導致極端降雨事件頻率增加。當颱風或豪雨發生時，${companyContext}的營運據點可能面臨淹水、停電、道路中斷等直接衝擊。特別是位於低窪地區或沿海的設施，在強降雨或風暴潮影響下，設備損壞風險顯著提升。企業需要建立完善的災害預警系統、緊急應變程序，以及設施防護措施，確保在極端天氣事件發生時能迅速啟動備援計畫，降低營運中斷的衝擊。`,
      
      '慢性實體風險-氣溫上升': `根據中央氣象署觀測資料，台灣年平均氣溫呈現上升趨勢，夏季高溫日數持續增加。對${companyContext}而言，持續的氣溫上升將直接影響工作環境舒適度與設備運作效率。高溫環境不僅增加空調用電負荷，也可能導致精密設備過熱當機、員工工作效率下降等問題。此外，戶外作業或運輸活動也須因應職業安全衛生法規要求，調整作業時間與防護措施，避免熱傷害事件發生。`,
      
      // 轉型風險 - 聚焦政策法規與市場技術變化
      '政策和法規-主管機關要求申報完整溫室氣體盤查': `依據《氣候變遷因應法》第25條規定，中央主管機關公告之事業應定期進行溫室氣體排放量盤查，並申報盤查報告。${companyContext}若被納入管制對象，需建立符合國際標準的溫室氣體盤查制度，包含直接排放、間接排放以及其他間接排放的量化與報告。企業須指派具備相關專業能力的人員負責盤查作業，並委託經認證的查驗機構進行查證。未依規定申報或申報不實者，將面臨新台幣10萬元以上100萬元以下罰鍰，嚴重者得限制或停止其營業。`,
      
      '技術-競爭對手推出低碳替代產品，市場佔有率受威脅': `隨著低碳技術快速發展，市場上陸續出現採用再生能源、循環材料或節能技術的創新產品。競爭對手透過技術升級，推出碳足跡更低的替代方案，並取得環保標章、碳標籤等認證，在政府綠色採購及企業永續採購政策推動下獲得競爭優勢。${companyContext}若未能及時跟進技術創新，既有產品可能在環保要求日趨嚴格的市場中失去競爭力，特別是在公部門標案或大企業採購案中面臨劣勢。技術落差將直接影響市場定位與長期發展前景。`,
      
      '市場-消費者偏好轉向環保產品，傳統產品需求下滑': `消費者環保意識抬頭，永續消費成為新趨勢。年輕世代更加重視產品的環境友善性，願意為具有環保認證、低碳足跡的產品支付溢價。通路商也開始設立綠色商品專區，要求供應商提供產品碳足跡資訊或環保認證。${companyContext}若持續提供傳統產品而未能滿足消費者的環保期待，將面臨市場需求下滑、品牌形象受損的風險。消費行為的轉變不僅影響銷售表現，也會影響與通路夥伴的合作關係。`,
      
      '市場-public_sector_opportunities': `政府積極推動淨零轉型政策，各部會陸續提高綠色採購比例，優先採購具環保標章、節能標章或碳足跡標籤的產品。公部門標案評選標準中，廠商的環境績效、減碳承諾或永續認證已成為重要評分項目。${companyContext}若能配合政府政策方向，取得相關環保認證並展現具體的環境改善成果，有機會在公部門採購案中獲得加分優勢，拓展新的市場機會。掌握政策動向並提前布局，將是抓住公部門綠色商機的關鍵。`,
      
      // 機會 - 聚焦具體的改善與發展機會
      '資源效率-能源使用效率': `面對電價上漲與用電大戶條款要求，${companyContext}可透過導入節能技術、智慧能源管理系統提升能源使用效率。政府提供多項節能獎勵措施，包括設備汰換補助、節能績效保證專案（ESCO）融資優惠等。透過系統性的能源管理，不僅能降低營運成本，也可取得ISO 50001能源管理系統認證，提升企業永續形象。有效的能源管理將成為企業降低成本、符合法規要求、增強競爭力的重要策略。`,
      
      '產品和服務-低碳產品開發': `隨著歐盟碳邊境調整機制（CBAM）實施及國際供應鏈對碳足跡要求日趨嚴格，低碳產品開發成為企業維持競爭力的必要投資。${companyContext}可運用政府「產業創新條例」研發投資抵減、「A+企業創新研發淬鍊計畫」等資源，投入綠色技術研發。取得產品碳足跡標籤認證，有助於產品在國際市場的差異化定位。配合政府5+2產業創新政策，也可獲得相關輔導資源與補助機會。`,
      
      '韌性-建立多元化資源供應體系': `COVID-19疫情及國際情勢變化凸顯供應鏈韌性的重要性。政府推動供應鏈在地化、多元化政策，鼓勵企業參與「台商回台投資方案」建立本土供應鏈。${companyContext}可配合新南向政策，在東南亞建立備援供應來源，同時發掘具有環保認證的在地供應商，降低供應鏈碳足跡。多元化的資源供應體系不僅增強風險抗性，也符合國際品牌商對供應鏈永續性的要求，創造新的合作機會。`,
    };
    
    const key = `${scenario.category_name}-${scenario.subcategory_name}`;
    return scenarioDescriptions[key] || `${scenario.subcategory_name}對${companyContext}而言，需要根據其${scenario.category_name}特性進行深入評估。建議企業密切關注相關領域的發展趨勢，評估對現有營運模式的影響，並制定相應的因應策略，確保能夠適應變化並掌握發展機會。`;
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

    // 生成財務分析報告
    const generateFinancialAnalysisReport = () => {
      if (!selectedStrategy) return null;

      const financialAnalysisInput: FinancialAnalysisInput = {
        riskOrOpportunityType: scenario.category_type,
        categoryName: scenario.category_name,
        subcategoryName: scenario.subcategory_name,
        scenarioDescription: generateScenarioDescription(scenario, analysis),
        selectedStrategy: selectedStrategy,
        companyProfile: {
          industry: assessment.industry,
          size: assessment.company_size,
          hasInternationalOperations: assessment.has_international_operations,
          hasCarbonInventory: assessment.has_carbon_inventory,
          mainEmissionSource: assessment.main_emission_source
        }
      };

      const financialAnalysis = generateFinancialAnalysis(financialAnalysisInput);
      const selectedStrategyOption = strategyOptions.find(opt => opt.value === selectedStrategy);

      return (
        <FinancialAnalysisReport
          analysis={financialAnalysis}
          scenarioTitle={scenario.subcategory_name}
          strategyType={selectedStrategyOption?.label || selectedStrategy}
          isRisk={isRisk}
        />
      );
    };

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
          
          {/* 情境描述 */}
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

          {/* 財務分析報告 */}
          {selectedStrategy && generateFinancialAnalysisReport()}

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
