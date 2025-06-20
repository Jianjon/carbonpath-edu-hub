import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
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
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections, loadRiskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [strategySelections, setStrategySelections] = useState<Record<string, StrategySelection>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 生成策略建議內容
  const generateStrategyContent = (strategy: string, item: any, assessment: TCFDAssessment): string => {
    const industry = assessment.industry;
    const companySize = assessment.company_size;
    const hasInventory = assessment.has_carbon_inventory;
    const isRisk = item.category_type === 'risk';
    
    if (isRisk) {
      return generateRiskStrategyContent(strategy, item, industry, companySize, hasInventory);
    } else {
      return generateOpportunityStrategyContent(strategy, item, industry, companySize, hasInventory);
    }
  };

  // 風險策略內容生成
  const generateRiskStrategyContent = (strategy: string, item: any, industry: string, companySize: string, hasInventory: boolean): string => {
    const subcategory = item.subcategory_name || item.category_name;
    
    switch (strategy) {
      case 'mitigate':
        return getIndustrySpecificMitigationStrategy(industry, subcategory, companySize, hasInventory);
      case 'transfer':
        return getIndustrySpecificTransferStrategy(industry, subcategory, companySize);
      case 'accept':
        return getIndustrySpecificAcceptStrategy(industry, subcategory, companySize, hasInventory);
      case 'control':
        return getIndustrySpecificControlStrategy(industry, subcategory, companySize, hasInventory);
      default:
        return '策略建議生成中...';
    }
  };

  // 機會策略內容生成
  const generateOpportunityStrategyContent = (strategy: string, item: any, industry: string, companySize: string, hasInventory: boolean): string => {
    const subcategory = item.subcategory_name || item.category_name;
    
    switch (strategy) {
      case 'evaluate_explore':
        return getOpportunityEvaluateStrategy(industry, subcategory, companySize);
      case 'capability_building':
        return getOpportunityCapabilityStrategy(industry, subcategory, companySize, hasInventory);
      case 'business_transformation':
        return getOpportunityTransformationStrategy(industry, subcategory, companySize);
      case 'cooperation_participation':
        return getOpportunityCooperationStrategy(industry, subcategory, companySize);
      case 'aggressive_investment':
        return getOpportunityAggressiveStrategy(industry, subcategory, companySize);
      default:
        return '策略建議生成中...';
    }
  };

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
      'hospitality': '旅宿業'
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

  useEffect(() => {
    loadRiskOpportunitySelections();
  }, []);

  const selectedItems = riskOpportunitySelections.filter(item => item.selected);
  const currentScenario = selectedItems[currentIndex];

  const updateStrategySelection = (strategy: string) => {
    if (!currentScenario) return;
    
    setStrategySelections(prev => ({
      ...prev,
      [currentScenario.id]: {
        riskOpportunityId: currentScenario.id,
        selectedStrategy: strategy,
        notes: prev[currentScenario.id]?.notes || ''
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
      // 準備第三階段結果資料
      const stage3Results = {
        assessment: assessment,
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
            notes: selection.notes
          };
        })
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
                              {currentScenario ? generateStrategyContent(strategy.id, currentScenario, assessment) : ''}
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

// 策略生成函數實作
const getIndustrySpecificMitigationStrategy = (industry: string, subcategory: string, size: string, hasInventory: boolean): string => {
  const baseStrategies: Record<string, string> = {
    manufacturing: '導入節能設備如變頻空壓機、LED照明系統，建置太陽能板降低用電成本。考慮製程優化與循環經濟模式。',
    technology: '採用高效能伺服器與雲端架構，導入智慧電網管理系統。建置綠色數據中心，使用再生能源憑證。',
    finance: '推動無紙化作業與數位金融服務，減少分行營運碳足跡。投資綠色金融商品組合。',
    retail: '導入智慧照明與空調系統，建置屋頂太陽能發電設施。推動包裝減量與循環包材使用。',
    hospitality: '更換節能空調與熱水系統，導入客房智慧節能控制。建立廢棄物分類回收機制。'
  };
  
  return baseStrategies[industry] || '根據產業特性導入相應的節能減碳設備與製程改善措施。';
};

const getIndustrySpecificTransferStrategy = (industry: string, subcategory: string, size: string): string => {
  const baseStrategies: Record<string, string> = {
    manufacturing: '投保氣候風險保險涵蓋設備損失與營運中斷。與供應商簽訂包含碳排放責任的合約條款。',
    technology: '採用雲端服務轉移數據中心營運風險，簽訂綠電購售合約穩定能源成本。',
    finance: '透過再保險機制分散氣候相關理賠風險。建立氣候風險基金分散暴險。',
    retail: '與物流業者簽訂低碳運輸合約。採用租賃模式取代設備採購，降低資產減值風險。',
    hospitality: '投保極端氣候營運中斷保險。外包洗衣、清潔等高耗能服務降低直接排放。'
  };
  
  return baseStrategies[industry] || '透過保險、合約安排與外包等方式，將氣候風險轉移至第三方承擔。';
};

const getIndustrySpecificAcceptStrategy = (industry: string, subcategory: string, size: string, hasInventory: boolean): string => {
  if (size === 'small') {
    return '暫時接受現況並設定分階段改善計劃，優先處理成本效益最佳的減碳措施。';
  }
  
  const baseStrategies: Record<string, string> = {
    manufacturing: '承認短期內無法大幅降低製程排放，但建立內部碳定價機制。設定年度減量目標。',
    technology: '接受數據中心高耗能現實，但承諾逐年提升再生能源使用比例。',
    finance: '承認金融業務碳足跡相對較低，專注於投融資組合的碳風險管理。',
    retail: '接受傳統零售模式的碳排放現況，但推動店鋪綠色營運改善計劃。',
    hospitality: '承認服務業高耗能特性，建立客戶環保意識宣導計劃。'
  };
  
  return baseStrategies[industry] || '暫時承擔風險並建立監測改善機制，設定階段性目標逐步降低風險。';
};

const getIndustrySpecificControlStrategy = (industry: string, subcategory: string, size: string, hasInventory: boolean): string => {
  const monitoringBase = hasInventory ? 
    '基於現有碳盤查資料建立動態監測儀表板，' : 
    '建立基礎碳排放監測制度，';
  
  const baseStrategies: Record<string, string> = {
    manufacturing: `${monitoringBase}設置生產線即時能耗監控系統。建立跨部門氣候風險管理委員會。`,
    technology: `${monitoringBase}導入AI智慧電力管理系統追蹤各系統耗能狀況。`,
    finance: `${monitoringBase}建立氣候風險量化模型追蹤投融資組合風險暴險。`,
    retail: `${monitoringBase}建置門市能耗即時監控系統與異常警示機制。`,
    hospitality: `${monitoringBase}建立客房與公共區域分區能耗監測系統。`
  };
  
  return baseStrategies[industry] || '建立全面性監測預警系統，制定標準作業程序確保風險可控。';
};

const getOpportunityEvaluateStrategy = (industry: string, subcategory: string, size: string): string => {
  const baseStrategies: Record<string, string> = {
    manufacturing: '委託專業顧問進行綠色轉型可行性評估，分析設備投資回收期與政府補助機會。',
    technology: '評估綠色技術商業化潛力，進行市場需求調查與競爭分析。',
    finance: '研究永續金融商品市場機會，評估ESG投資策略的風險報酬特性。',
    retail: '調查消費者對永續商品的付費意願，評估綠色商品線的市場接受度。',
    hospitality: '研究綠色旅遊市場趨勢，評估永續認證對客戶選擇的影響程度。'
  };
  
  return baseStrategies[industry] || '進行深度市場研究與技術可行性評估，透過小規模測試驗證商業模式。';
};

const getOpportunityCapabilityStrategy = (industry: string, subcategory: string, size: string, hasInventory: boolean): string => {
  const trainingBase = hasInventory ? 
    '基於現有碳管理經驗擴展團隊專業能力，' :
    '建立基礎碳管理團隊與訓練體系，';
  
  const baseStrategies: Record<string, string> = {
    manufacturing: `${trainingBase}培訓工程師綠色製程與循環經濟知識。`,
    technology: `${trainingBase}培養綠色IT與永續軟體開發專業人才。`,
    finance: `${trainingBase}培訓投資團隊ESG分析與氣候風險評估技能。`,
    retail: `${trainingBase}訓練採購團隊永續供應鏈管理技能。`,
    hospitality: `${trainingBase}培訓服務團隊永續營運與客戶溝通技巧。`
  };
  
  return baseStrategies[industry] || '系統性建立內部永續專業能力，培養跨部門協作與創新思維。';
};

const getOpportunityTransformationStrategy = (industry: string, subcategory: string, size: string): string => {
  const baseStrategies: Record<string, string> = {
    manufacturing: '開發低碳版本的核心產品，進軍綠色建材或再生能源設備市場。',
    technology: '開發碳管理軟體解決方案，提供企業碳盤查與減碳顧問服務。',
    finance: '推出綠色債券、永續基金等新金融商品，建立ESG投資諮詢服務。',
    retail: '建立永續商品專賣品牌，開發循環包裝與零廢棄購物模式。',
    hospitality: '發展生態旅遊與永續住宿品牌，推出碳中和旅遊套裝行程。'
  };
  
  return baseStrategies[industry] || '開發具永續特色的新產品服務，建立差異化競爭優勢搶占綠色市場。';
};

const getOpportunityCooperationStrategy = (industry: string, subcategory: string, size: string): string => {
  const baseStrategies: Record<string, string> = {
    manufacturing: '加入產業淨零聯盟共享減碳技術，申請經濟部綠色工廠轉型補助。',
    technology: '參與科技業RE100倡議集體採購綠電，加入數位發展部淨零技術創新計劃。',
    finance: '加入赤道原則與TCFD支持者聯盟，參與金管會永續金融評鑑。',
    retail: '參與零售業永續發展聯盟，申請環保署循環經濟推動計劃補助。',
    hospitality: '加入永續旅遊認證體系，申請觀光局永續觀光發展補助。'
  };
  
  return baseStrategies[industry] || '積極參與產業聯盟與政府計劃，透過策略合作降低轉型成本。';
};

const getOpportunityAggressiveStrategy = (industry: string, subcategory: string, size: string): string => {
  const baseStrategies: Record<string, string> = {
    manufacturing: '立即簽署綠電購售合約鎖定長期電價，大規模投資自動化減碳設備。',
    technology: '全面導入再生能源供電，投資大型綠色數據中心建設。',
    finance: '設立永續金融專業子公司，大量發行綠色債券籌資永續投資。',
    retail: '全門市導入太陽能發電與儲能系統，建立自有永續商品品牌。',
    hospitality: '全面改造為綠建築標準，投資大型再生能源設施。'
  };
  
  return baseStrategies[industry] || '全面投入永續轉型，大規模投資綠色基礎設施與技術。';
};

export default TCFDStage3;
