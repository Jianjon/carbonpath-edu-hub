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

interface SelectedStrategyData {
  scenarioKey: string;
  strategy: string;
  analysis: any;
  notes: string;
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

  // 參數中文對映
  const getChineseText = (text: string): string => {
    const translations: Record<string, string> = {
      'medium': '中型',
      'large': '大型',
      'small': '小型',
      'hospitality': '旅宿業',
      'manufacturing': '製造業',
      'technology': '科技業',
      'finance': '金融業',
      'retail': '零售業',
      'healthcare': '醫療業',
      'education': '教育業',
      'construction': '建築業',
      'transportation': '運輸業',
      'restaurant': '餐飲業'
    };
    return translations[text] || text;
  };

  // 生成具體的情境描述
  const generateDetailedScenarioDescription = (scenario: any): string => {
    const industryText = getChineseText(assessment.industry);
    const sizeText = getChineseText(assessment.company_size);
    const isRisk = scenario.category_type === 'risk';

    // 根據不同類別生成具體描述
    if (scenario.category_name === '政策和法規') {
      if (scenario.subcategory_name.includes('碳定價')) {
        return `主管機關預計於2026年正式實施碳費徵收制度，${sizeText}${industryText}企業將面臨每噸碳排放300-500元的徵收標準。此政策將直接影響企業營運成本結構，需要建立完整的碳排放盤查與申報機制。對於${industryText}而言，這將導致能源使用成本增加15-25%，同時需投入人力進行月度碳排放數據收集與季度申報作業。企業需重新評估能源採購策略，考慮導入再生能源或提升能源效率設備，預估初期合規成本將佔營收的2-3%。此外，供應商選擇也將納入碳足跡考量，可能影響既有供應鏈合作關係，並增加採購程序的複雜度。`;
      } else if (scenario.subcategory_name.includes('強制性報告')) {
        return `金管會規劃自2025年起，要求${sizeText}以上企業強制揭露氣候相關財務資訊，${industryText}企業需依循TCFD框架進行年度報告。此要求將使企業面臨全新的資訊揭露義務，需建立跨部門協作機制，包含財務、永續、營運等單位的整合。企業必須投入專職人力進行氣候風險識別、情境分析及財務量化評估，預估需要6-12個月的準備期建立相關制度。對於${industryText}來說，這將增加每年約200-500萬元的顧問費用及內部人力成本，同時需要董事會層級的治理參與。未能及時完成揭露將面臨主管機關裁罰，影響企業聲譽及投資人信心。`;
      }
    }

    if (scenario.category_name === '技術') {
      if (scenario.subcategory_name.includes('低碳技術')) {
        return `市場對低碳技術解決方案的需求急速增長，${industryText}企業面臨技術轉型的關鍵時期。${sizeText}企業需要評估導入節能設備、智慧化系統或替代能源技術，以滿足客戶對低碳服務的期待。此轉型將要求企業投入大量資本支出，預估設備更新成本為既有設備價值的30-50%。對於${industryText}而言，技術升級將改變營運流程，需要員工重新培訓，並可能面臨3-6個月的磨合期影響營運效率。同時，新技術的維護成本及技術支援需求將增加營運複雜度，但成功轉型後可望獲得政府補助及綠色金融優惠，並提升市場競爭力，預期可帶來10-20%的營運效率提升。`;
      }
    }

    if (scenario.category_name === '實體風險') {
      if (scenario.subcategory_name.includes('極端天氣')) {
        return `氣候變遷導致極端降雨及颱風強度增強，對${industryText}的${sizeText}企業營運場所造成直接威脅。根據氣象局資料，未來十年極端降雨事件發生頻率將增加40%，單次降雨量可能超過歷史記錄。此情境將使企業面臨設施淹水、停電及交通中斷等營運中斷風險，特別是位於低窪地區或沿海區域的設施。對於${industryText}來說，每次極端天氣事件可能造成3-7天的營運中斷，直接影響營收並增加緊急應變成本。企業需要投資防災設備、備援系統及緊急應變計畫，預估防災投資成本約為設施價值的5-10%。同時，保險費用將因風險提高而增加，供應鏈中斷也將影響正常營運節奏。`;
      }
    }

    if (scenario.category_name === '市場') {
      if (scenario.subcategory_name.includes('消費者偏好改變')) {
        return `消費者環保意識抬頭，對低碳產品及服務的需求快速成長，${industryText}企業需要重新定位產品策略以符合市場期待。市場調查顯示，超過60%的消費者願意為環保產品支付10-15%的溢價，這為${sizeText}企業創造了差異化競爭的機會。然而，此趨勢也要求企業投入產品研發、認證取得及行銷宣傳，以建立綠色品牌形象。對於${industryText}而言，需要重新設計服務流程，導入環保材料或低碳作業方式，預估產品開發週期將延長2-3個月。企業必須投資綠色供應鏈建置，可能面臨原料成本上升15-25%的壓力，但成功轉型後可獲得新的客群及市場區隔，預期可提升品牌價值及客戶忠誠度。`;
      }
    }

    // 機會類情境
    if (scenario.category_name === '資源效率') {
      return `透過數位化及自動化技術提升資源使用效率，${sizeText}${industryText}企業可以顯著降低營運成本並提升競爭力。智慧化系統導入將使企業能夠即時監控能源、水資源及原料使用情況，透過數據分析優化作業流程。此機會要求企業投入數位轉型，包含IoT設備、數據分析平台及員工培訓，預估初期投資約為年營收的3-5%。對於${industryText}來說，系統化管理將使資源使用效率提升20-30%，每年可節省能源成本15-25%。同時，精確的資源控制有助於減少浪費，提升產品品質穩定性。企業需要6-12個月的導入期，期間可能面臨作業流程調整的挑戰，但長期而言將建立可持續的成本優勢及營運韌性。`;
    }

    // 預設通用描述
    return `${scenario.category_name}類型的${scenario.subcategory_name}情境將對${sizeText}${industryText}企業產生${isRisk ? '重要風險影響' : '潛在發展機會'}。此情境要求企業重新評估現有營運模式，投入相應資源進行應對準備。預計將影響企業的成本結構、作業流程及市場定位，需要管理層制定明確的因應策略。企業應建立跨部門協作機制，定期評估影響程度並調整應對措施，以確保營運韌性及競爭優勢的維持。`;
  };

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

        // 生成具體的情境描述
        const detailedDescription = generateDetailedScenarioDescription(scenario);

        // 尋找對應的scenario evaluation或創建默認值
        let scenarioEvaluation = scenarioEvaluations.find(evaluation => 
          evaluation.category_name === scenario.category_name && 
          evaluation.subcategory_name === scenario.subcategory_name
        );

        if (!scenarioEvaluation) {
          scenarioEvaluation = {
            id: `temp-${Date.now()}-${index}`,
            assessment_id: assessment.id,
            risk_opportunity_id: scenario.id,
            category_name: scenario.category_name,
            subcategory_name: scenario.subcategory_name,
            scenario_description: detailedDescription,
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
          detailedDescription, // 使用生成的詳細描述
          scenarioEvaluation.likelihood_score,
          assessment.industry,
          assessment.company_size
        );

        // 更新完成進度
        setGenerationProgress(prev => ({ 
          ...prev, 
          completed: prev.completed + 1 
        }));

        return { scenarioKey, analysis: { ...analysis, scenario_description: detailedDescription } };
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
      // 準備傳遞給第四階段的資料
      const strategySelections: SelectedStrategyData[] = selectedScenarios.map(scenario => {
        const scenarioKey = `${scenario.category_name}-${scenario.subcategory_name}`;
        return {
          scenarioKey,
          strategy: selectedStrategies[scenarioKey],
          analysis: strategyAnalyses[scenarioKey],
          notes: notes[scenarioKey] || ''
        };
      });

      // 將資料存儲到 sessionStorage 供第四階段使用
      sessionStorage.setItem('tcfd-stage3-results', JSON.stringify({
        assessment,
        strategySelections
      }));

      toast.success('策略選擇已完成');
      onComplete();
    } catch (error) {
      console.error('保存策略選擇錯誤:', error);
      toast.error('保存失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
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
          
          {/* 情境描述 - 使用詳細生成的描述 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              情境描述
            </h4>
            <p className="text-gray-700 leading-relaxed text-sm">
              {analysis?.scenario_description || generateDetailedScenarioDescription(scenario)}
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
              {getChineseText(assessment.company_size)} · {getChineseText(assessment.industry)}
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
