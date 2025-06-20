
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, ChevronLeft, ChevronRight, Shield, Target, Lightbulb, Eye, Settings, Coins, Sprout, Rocket } from 'lucide-react';
import { toast } from 'sonner';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

interface StrategySelection {
  riskOpportunityId: string;
  selectedStrategy: string;
  notes: string;
  llmGeneratedContent?: any;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections, loadRiskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment.id);
  const { generateComprehensiveScenarioAnalysis } = useTCFDScenarioEvaluations(assessment.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [strategySelections, setStrategySelections] = useState<Record<string, StrategySelection>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [llmStrategies, setLlmStrategies] = useState<Record<string, any>>({});

  // 風險策略選項
  const riskStrategies = [
    {
      id: 'mitigate',
      icon: Shield,
      title: '減緩策略',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'transfer',
      icon: Target,
      title: '轉移策略', 
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      id: 'accept',
      icon: Lightbulb,
      title: '接受策略',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    },
    {
      id: 'control',
      icon: Settings,
      title: '控制策略',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    }
  ];

  // 機會策略選項
  const opportunityStrategies = [
    {
      id: 'evaluate_explore',
      icon: Eye,
      title: '評估探索',
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      subtitle: '風險偏好低、謹慎型企業'
    },
    {
      id: 'capability_building',
      icon: Settings,
      title: '能力建設',
      color: 'bg-green-50 border-green-200 text-green-800',
      subtitle: '預備期、長期策略'
    },
    {
      id: 'business_transformation',
      icon: Coins,
      title: '商業轉換',
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      subtitle: '把機會轉為營收的具體策略'
    },
    {
      id: 'cooperation_participation',
      icon: Sprout,
      title: '合作參與',
      color: 'bg-teal-50 border-teal-200 text-teal-800',
      subtitle: '共享資源、降低單點風險'
    },
    {
      id: 'aggressive_investment',
      icon: Rocket,
      title: '積極投入',
      color: 'bg-red-50 border-red-200 text-red-800',
      subtitle: '對氣候機會有高掌握度或急迫需求'
    }
  ];

  // 生成情境描述（150-180字）
  const generateScenarioDescription = (item: any, assessment: TCFDAssessment): string => {
    const industry = assessment.industry;
    const companySize = assessment.company_size;
    const hasInventory = assessment.has_carbon_inventory;
    const isRisk = item.category_type === 'risk';
    const categoryName = item.category_name || '';
    const subcategoryName = item.subcategory_name || '';

    // 產業中文對應
    const industryMap: Record<string, string> = {
      'manufacturing': '製造業',
      'technology': '科技業',
      'finance': '金融業',
      'retail': '零售業',
      'hospitality': '旅宿業',
      'restaurant': '餐飲業',
      'construction': '營建業',
      'transportation': '運輸業',
      'healthcare': '醫療保健',
      'education': '教育服務'
    };

    const sizeMap: Record<string, string> = {
      'small': '小型',
      'medium': '中型',
      'large': '大型'
    };

    const industryText = industryMap[industry] || industry;
    const sizeText = sizeMap[companySize] || companySize;
    const inventoryStatus = hasInventory ? '已建立碳盤查制度' : '尚未建立完整碳盤查制度';

    // 情境描述模板
    if (isRisk && categoryName.includes('政策')) {
      return `${sizeText}${industryText}企業面臨政策法規趨嚴的轉型壓力，特別是${subcategoryName}相關要求將直接影響營運合規成本。監管機構逐步提高環境標準，企業需投入資源進行制度調整與技術升級。${inventoryStatus}的現況將影響合規準備的起始點與所需投入程度。法規遵循失敗將面臨罰款風險，同時可能影響客戶信任度與市場競爭力。合規成本上升將壓縮獲利空間，需要重新評估營運模式的可持續性。此情境要求企業在成本控制與風險管理間找到平衡點，制定前瞻性的應對策略以維持營運穩定性。`;
    }

    if (!isRisk && categoryName.includes('市場')) {
      return `${sizeText}${industryText}企業正面臨市場需求轉向永續產品服務的機會窗口，${subcategoryName}相關需求快速成長為新的營收來源。消費者環保意識提升促使採購決策改變，願意為永續價值支付溢價。${inventoryStatus}的基礎將影響企業把握綠色商機的速度與可信度。競爭對手積極布局永續市場，搶佔先機者將獲得品牌差異化優勢。此機會窗口具有時效性，延遲進入將錯失市場定位良機。企業需要快速建立永續能力與產品組合，才能有效轉換市場機會為實際營收成長動能。`;
    }

    // 通用情境描述
    return `${sizeText}${industryText}企業在${categoryName}面向遭遇${subcategoryName}挑戰，需要建立系統性應對機制。${inventoryStatus}的現況將影響因應策略的制定與執行效率。此情境將對企業營運模式產生結構性影響，需要跨部門協調與資源重新配置。管理團隊必須在短期成本投入與長期競爭力維持間做出平衡決策。延遲應對將增加後續調整的複雜度與成本，主動因應則有機會轉危為安並建立競爭優勢。企業應制定階段性目標與執行計畫，確保在變動環境中維持營運韌性與持續發展能力。`;
  };

  // 使用 LLM 生成客制化策略內容
  const generateLLMStrategies = async (item: any, scenarioDescription: string) => {
    const cacheKey = `${item.id}_${item.category_type}`;
    
    // 檢查是否已經生成過
    if (llmStrategies[cacheKey]) {
      return llmStrategies[cacheKey];
    }

    setIsGeneratingStrategy(true);
    try {
      console.log('生成LLM策略:', {
        categoryType: item.category_type,
        categoryName: item.category_name,
        subcategoryName: item.subcategory_name,
        industry: assessment.industry,
        companySize: assessment.company_size,
        scenarioDescription
      });

      const userCustomInputs = {
        user_notes: '',
        scenario_modifications: '',
        business_context: assessment.business_description || ''
      };

      const response = await generateComprehensiveScenarioAnalysis(
        item.category_type,
        item.categoryName,
        item.subcategory_name,
        scenarioDescription,
        3, // 假設高影響評分
        assessment.industry,
        assessment.company_size,
        assessment.business_description || '',
        userCustomInputs
      );

      console.log('LLM策略生成回應:', response);

      const strategies = {
        categoryType: item.category_type,
        categoryName: item.category_name,
        subcategoryName: item.subcategory_name,
        scenarioDescription,
        ...response
      };

      // 快取結果
      setLlmStrategies(prev => ({
        ...prev,
        [cacheKey]: strategies
      }));

      return strategies;
    } catch (error) {
      console.error('LLM策略生成失敗:', error);
      toast.error('策略生成失敗，將使用預設內容');
      return null;
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  // 根據選擇的策略取得 LLM 生成的內容 - 確保回傳字串型別
  const getStrategyContent = (strategy: string, item: any): string => {
    const cacheKey = `${item.id}_${item.category_type}`;
    const llmData = llmStrategies[cacheKey];
    
    if (!llmData) {
      return '正在生成客制化策略建議...';
    }

    const isRisk = item.category_type === 'risk';
    
    try {
      if (isRisk && llmData.risk_strategies) {
        const strategyData = llmData.risk_strategies[strategy];
        if (strategyData && typeof strategyData.description === 'string') {
          return strategyData.description;
        }
      } else if (!isRisk && llmData.opportunity_strategies) {
        const strategyData = llmData.opportunity_strategies[strategy];
        if (strategyData && typeof strategyData.description === 'string') {
          return strategyData.description;
        }
      }
    } catch (error) {
      console.error('取得策略內容失敗:', error);
    }

    return '策略內容生成中...';
  };

  useEffect(() => {
    loadRiskOpportunitySelections();
  }, []);

  const selectedItems = riskOpportunitySelections.filter(item => item.selected);
  const currentScenario = selectedItems[currentIndex];

  const updateStrategySelection = async (strategy: string) => {
    if (!currentScenario) return;
    
    // 如果還沒有 LLM 策略，先生成
    const scenarioDescription = generateScenarioDescription(currentScenario, assessment);
    const llmStrategies = await generateLLMStrategies(currentScenario, scenarioDescription);
    
    setStrategySelections(prev => ({
      ...prev,
      [currentScenario.id]: {
        riskOpportunityId: currentScenario.id,
        selectedStrategy: strategy,
        notes: prev[currentScenario.id]?.notes || '',
        llmGeneratedContent: llmStrategies
      }
    }));
  };

  const updateNotes = (notes: string) => {
    if (!currentScenario) return;
    
    setStrategySelections(prev => ({
      ...prev,
      [currentScenario.id]: {
        ...prev[currentScenario.id],
        riskOpportunityId: currentScenario.id,
        selectedStrategy: prev[currentScenario.id]?.selectedStrategy || '',
        notes: notes
      }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 準備第三階段結果資料，包含完整的評估資訊
      const stage3Results = {
        assessment: {
          id: assessment.id,
          industry: assessment.industry,
          company_size: assessment.company_size,
          has_carbon_inventory: assessment.has_carbon_inventory,
          has_international_operations: assessment.has_international_operations,
          annual_revenue_range: assessment.annual_revenue_range,
          supply_chain_carbon_disclosure: assessment.supply_chain_carbon_disclosure,
          has_sustainability_team: assessment.has_sustainability_team,
          main_emission_source: assessment.main_emission_source,
          business_description: assessment.business_description,
          current_stage: assessment.current_stage,
          status: assessment.status,
          created_at: assessment.created_at,
          updated_at: assessment.updated_at,
          user_id: assessment.user_id
        },
        strategySelections: Object.values(strategySelections).map(selection => {
          const item = selectedItems.find(item => item.id === selection.riskOpportunityId);
          return {
            scenarioKey: `${item?.category_name}-${item?.subcategory_name}`,
            riskOpportunityId: selection.riskOpportunityId,
            strategy: selection.selectedStrategy,
            scenarioDescription: generateScenarioDescription(item, assessment),
            categoryType: item?.category_type,
            categoryName: item?.category_name,
            subcategoryName: item?.subcategory_name,
            notes: selection.notes,
            llmGeneratedContent: selection.llmGeneratedContent,
            // 保留原始選擇資訊
            originalSelection: {
              id: item?.id,
              assessment_id: item?.assessment_id,
              category_type: item?.category_type,
              category_name: item?.category_name,
              subcategory_name: item?.subcategory_name,
              selected: item?.selected,
              created_at: item?.created_at
            }
          };
        }),
        completedAt: new Date().toISOString()
      };

      sessionStorage.setItem('tcfd-stage3-results', JSON.stringify(stage3Results));
      console.log('第三階段完成，策略選擇已儲存:', stage3Results);
      
      toast.success('策略選擇已完成');
      onComplete();
    } catch (error) {
      console.error('儲存失敗:', error);
      toast.error('儲存失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 當切換情境時自動生成 LLM 策略
  useEffect(() => {
    if (currentScenario) {
      const scenarioDescription = generateScenarioDescription(currentScenario, assessment);
      generateLLMStrategies(currentScenario, scenarioDescription);
    }
  }, [currentIndex, currentScenario]);

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">無選擇項目</h3>
            <p className="text-gray-600">請先在第二階段選擇風險或機會項目</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isRisk = currentScenario?.category_type === 'risk';
  const strategies = isRisk ? riskStrategies : opportunityStrategies;
  const currentSelection = currentScenario ? strategySelections[currentScenario.id] : null;
  const scenarioDescription = currentScenario ? generateScenarioDescription(currentScenario, assessment) : '';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 標題區域 */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">第三階段：策略選擇</h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          針對第二階段選定的每個風險與機會項目，請選擇最適合的應對策略。
          系統會依據您的企業背景提供具體的策略建議內容。
        </p>
        
        {/* 進度指示器 */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <span className="text-sm text-gray-500">
            項目 {currentIndex + 1} / {selectedItems.length}
          </span>
          <div className="flex space-x-2">
            {selectedItems.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 主要內容卡片 */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center justify-between">
            <span className="text-blue-900">
              {isRisk ? '風險項目' : '機會項目'}：
              {currentScenario?.category_name} - {currentScenario?.subcategory_name}
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentIndex(Math.min(selectedItems.length - 1, currentIndex + 1))}
                disabled={currentIndex === selectedItems.length - 1}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* 情境描述 */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h4 className="font-medium mb-2 text-gray-800">情境描述</h4>
            <p className="text-sm text-gray-700">
              {scenarioDescription}
            </p>
          </div>

          {/* 策略選擇區域 */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">
              請選擇最適合的{isRisk ? '風險應對' : '機會把握'}策略：
            </Label>
            
            {isGeneratingStrategy && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">正在生成客制化策略建議...</span>
              </div>
            )}
            
            <RadioGroup 
              value={currentSelection?.selectedStrategy || ''} 
              onValueChange={updateStrategySelection}
              className="space-y-3"
            >
              {strategies.map((strategy) => {
                const IconComponent = strategy.icon;
                const isSelected = currentSelection?.selectedStrategy === strategy.id;
                
                return (
                  <div key={strategy.id} className={`border-2 rounded-lg p-4 transition-colors ${
                    isSelected ? strategy.color : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={strategy.id} id={strategy.id} className="mt-1" />
                      <div className="flex-1">
                        <label 
                          htmlFor={strategy.id}
                          className="flex items-center space-x-2 cursor-pointer mb-2"
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="font-medium">{strategy.title}</span>
                          {'subtitle' in strategy && strategy.subtitle && (
                            <Badge variant="outline" className="text-xs">
                              {strategy.subtitle}
                            </Badge>
                          )}
                        </label>
                        
                        {isSelected && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border">
                            <p className="text-sm text-gray-700">
                              {currentScenario ? getStrategyContent(strategy.id, currentScenario) : ''}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* 補充意見區域 */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-lg font-medium">補充意見或調整建議</Label>
            <Textarea
              id="notes"
              value={currentSelection?.notes || ''}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="您可以針對選定策略補充具體執行想法或調整建議..."
              rows={4}
              className="text-sm border-gray-300"
            />
          </div>

          {/* 操作按鈕區域 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              已完成 {Object.keys(strategySelections).length} / {selectedItems.length} 項策略選擇
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(strategySelections).length !== selectedItems.length}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  儲存中...
                </>
              ) : (
                '完成策略選擇，進入財務分析'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage3;
