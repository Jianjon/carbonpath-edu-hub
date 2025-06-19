import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { Brain, Loader2, Sparkles, Target, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Star, CheckCircle } from 'lucide-react';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { 
    riskOpportunitySelections, 
    saveScenarioEvaluation,
    generateScenarioWithLLM,
    generateScenarioAnalysisWithLLM,
    loading 
  } = useTCFDAssessment(assessment.id);
  
  const [generatedScenarios, setGeneratedScenarios] = useState<any[]>([]);
  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);
  const [scenarioAnalyses, setScenarioAnalyses] = useState<Record<string, any>>({});
  const [isGeneratingAnalyses, setIsGeneratingAnalyses] = useState<Record<string, boolean>>({});
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, boolean>>({});
  const [selectedStrategies, setSelectedStrategies] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<number>(-1);

  // 風險策略選項定義 - 根據企業規模調整
  const getRiskStrategies = (companySize: string) => {
    const baseStrategies = [
      { 
        id: 'mitigate', 
        name: '減緩策略', 
        icon: '🛡️',
        description: companySize === 'small' 
          ? '採用成本效益高的措施降低風險影響'
          : companySize === 'medium'
          ? '投資中等規模的設備與技術改善來減緩風險'
          : '大規模投資先進技術與系統性改善來減緩風險'
      },
      { 
        id: 'transfer', 
        name: '轉移策略', 
        icon: '🔄',
        description: companySize === 'small'
          ? '透過保險或合約條款將風險轉移給第三方'
          : companySize === 'medium'
          ? '結合保險、合約與策略夥伴關係分散風險'
          : '建立完整風險轉移機制，包含保險、期貨與策略聯盟'
      },
      { 
        id: 'accept', 
        name: '接受策略', 
        icon: '✅',
        description: companySize === 'small'
          ? '建立基本應急準備金並持續監控風險'
          : companySize === 'medium'
          ? '設立風險準備金並建立標準應變程序'
          : '建立完整風險承受機制與董事會層級治理'
      },
      { 
        id: 'control', 
        name: '控制策略', 
        icon: '📊',
        description: companySize === 'small'
          ? '建立簡單有效的風險監控與預警機制'
          : companySize === 'medium'
          ? '投資數位化監控系統與定期風險評估'
          : '建立智慧化風險管理平台與預測性分析'
      }
    ];
    return baseStrategies;
  };

  // 機會策略選項定義 - 根據企業規模調整
  const getOpportunityStrategies = (companySize: string) => {
    const baseStrategies = [
      { 
        id: 'evaluate_explore', 
        name: '評估探索策略', 
        icon: '🔍',
        description: companySize === 'small'
          ? '進行基礎市場調研與可行性評估'
          : companySize === 'medium'
          ? '委託專業顧問進行深度市場與技術評估'
          : '建立專業評估團隊進行全面的戰略分析'
      },
      { 
        id: 'capability_building', 
        name: '能力建設策略', 
        icon: '💪',
        description: companySize === 'small'
          ? '培訓核心人員並建立基本永續管理能力'
          : companySize === 'medium'
          ? '建立永續發展部門並投資人才培育'
          : '建立卓越中心並與頂尖機構合作'
      },
      { 
        id: 'business_transformation', 
        name: '商業轉換策略', 
        icon: '🔄',
        description: companySize === 'small'
          ? '調整產品服務組合並優化營運模式'
          : companySize === 'medium'
          ? '投資新技術並拓展綠色產品線'
          : '全面數位轉型並重新定義商業模式'
      },
      { 
        id: 'cooperation_participation', 
        name: '合作參與策略', 
        icon: '🤝',
        description: companySize === 'small'
          ? '參與產業聯盟並尋求政府計畫支持'
          : companySize === 'medium'
          ? '建立策略夥伴關係並參與產業標準制定'
          : '領導產業聯盟並主導生態系建立'
      },
      { 
        id: 'aggressive_investment', 
        name: '積極投入策略', 
        icon: '🚀',
        description: companySize === 'small'
          ? '在資源範圍內積極投入核心機會'
          : companySize === 'medium'
          ? '大膽投資關鍵技術與市場機會'
          : '領先投入前瞻技術並搶佔市場先機'
      }
    ];
    return baseStrategies;
  };

  // 生成企業背景描述
  const generateCompanyContext = () => {
    const industryMap: Record<string, string> = {
      'manufacturing': '製造業',
      'finance': '金融業',
      'technology': '科技業',
      'retail': '零售業',
      'construction': '營建業',
      'transportation': '運輸業',
      'energy': '能源業',
      'healthcare': '醫療保健業',
      'hospitality': '餐旅業',
      'education': '教育業',
      'agriculture': '農業',
      'other': '其他產業'
    };

    const sizeMap: Record<string, string> = {
      'small': '中小企業（50人以下）',
      'medium': '中型企業（50-250人）',
      'large': '大型企業（250人以上）'
    };

    const revenueMap: Record<string, string> = {
      'small': '年營收小於1,000萬元',
      'medium': '年營收1,000萬至1億元',
      'large': '年營收大於1億元'
    };

    return {
      industry: industryMap[assessment.industry] || assessment.industry,
      size: sizeMap[assessment.company_size] || assessment.company_size,
      revenue: assessment.annual_revenue_range ? revenueMap[assessment.annual_revenue_range] : '',
      hasCarbonInventory: assessment.has_carbon_inventory ? '已完成' : '尚未完成',
      hasInternational: assessment.has_international_operations ? '有' : '無',
      emissionSource: assessment.main_emission_source || ''
    };
  };

  useEffect(() => {
    if (riskOpportunitySelections.length > 0 && generatedScenarios.length === 0) {
      generateScenariosInBatches();
    }
  }, [riskOpportunitySelections]);

  const generateScenariosInBatches = async () => {
    setIsGeneratingScenarios(true);
    try {
      const selectedItems = riskOpportunitySelections.filter(sel => sel.selected && sel.subcategory_name);
      const scenarios = [];
      const companyContext = generateCompanyContext();

      for (let i = 0; i < selectedItems.length; i++) {
        const selection = selectedItems[i];
        setCurrentGeneratingIndex(i);
        
        try {
          console.log(`正在生成情境 ${i + 1}/${selectedItems.length}:`, selection.category_name, selection.subcategory_name);
          
          let scenarioDescription = '';
          
          if (selection.subcategory_name?.startsWith('自訂情境：')) {
            scenarioDescription = selection.custom_scenario_description || selection.subcategory_name;
          } else {
            scenarioDescription = await generateScenarioWithLLM(
              selection.category_type as 'risk' | 'opportunity',
              selection.category_name,
              selection.subcategory_name!,
              assessment.industry
            );
          }

          const scenario = {
            id: `scenario-${selection.id}`,
            risk_opportunity_id: selection.id,
            category_name: selection.category_name,
            subcategory_name: selection.subcategory_name,
            category_type: selection.category_type,
            scenario_description: scenarioDescription,
            scenario_generated_by_llm: !selection.subcategory_name?.startsWith('自訂情境：'),
            is_custom: selection.subcategory_name?.startsWith('自訂情境：'),
            company_context: companyContext
          };

          scenarios.push(scenario);
          setGeneratedScenarios([...scenarios]);

          // 異步生成詳細分析
          if (!scenario.is_custom) {
            generateAnalysisAsync(scenario);
          }

        } catch (error) {
          console.error('生成情境失敗：', selection.subcategory_name, error);
          const fallbackScenario = {
            id: `scenario-${selection.id}`,
            risk_opportunity_id: selection.id,
            category_name: selection.category_name,
            subcategory_name: selection.subcategory_name,
            category_type: selection.category_type,
            scenario_description: `針對「${selection.subcategory_name}」的具體情境正在生成中，請稍後重新整理頁面查看完整內容。`,
            scenario_generated_by_llm: true,
            company_context: companyContext
          };
          scenarios.push(fallbackScenario);
          setGeneratedScenarios([...scenarios]);
        }
      }
      
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGeneratingScenarios(false);
      setCurrentGeneratingIndex(-1);
    }
  };

  const generateAnalysisAsync = async (scenario: any) => {
    setIsGeneratingAnalyses(prev => ({
      ...prev,
      [scenario.id]: true
    }));

    try {
      const analysis = await generateScenarioAnalysisWithLLM(
        scenario.scenario_description,
        3,
        assessment.industry
      );

      const companyContext = scenario.company_context;
      
      // 生成具體的情境描述和策略建議
      const contextualDescription = generateContextualDescription(scenario, companyContext);
      const strategyRecommendations = generateStrategyRecommendations(scenario, companyContext);

      setScenarioAnalyses(prev => ({
        ...prev,
        [scenario.id]: {
          contextual_description: contextualDescription,
          strategy_recommendations: strategyRecommendations,
          scenario_summary: analysis?.scenario_summary || 
            `針對${scenario.subcategory_name}情境，${companyContext.industry}企業需要建立完整的${scenario.category_type === 'risk' ? '風險管理' : '機會把握'}機制。建議透過系統性評估與規劃，制定符合企業資源與目標的策略方案，並定期檢討調整，以確保策略有效性與適應性，維持企業在變動環境中的競爭優勢。此情境預計對企業年度營收產生3-8%的潛在影響，建議企業提前布局相關因應措施，並納入中長期策略規劃考量。透過完善的風險評估機制，企業可更精準掌握情境變化趨勢，進而制定更具前瞻性的應對策略，確保在不確定的外部環境中仍能維持穩健營運。`
        }
      }));

    } catch (error) {
      console.error('生成分析失敗：', scenario.subcategory_name, error);
      const companyContext = scenario.company_context;
      setScenarioAnalyses(prev => ({
        ...prev,
        [scenario.id]: {
          contextual_description: `作為${companyContext.industry}且${companyContext.size}的企業，面對${scenario.subcategory_name}的挑戰時，需要綜合考量企業規模、資源配置與營運特性。建議建立系統性的評估機制，並根據企業實際情況制定適合的應對策略。此情境可能對企業營運成本產生5-15%的影響，特別是在${companyContext.hasCarbonInventory === '已完成' ? '既有碳管理基礎上' : '建立碳管理能力的過程中'}，需要更謹慎的資源配置與時程規劃。建議企業評估內部資源與外部合作機會，制定階段性的實施計畫，確保策略的可行性與有效性。`,
          strategy_recommendations: generateStrategyRecommendations(scenario, companyContext),
          scenario_summary: `針對${scenario.subcategory_name}情境，企業需要建立完整的管理機制。此情境預計對企業財務表現產生中等程度影響，建議透過分階段實施策略，降低轉換成本並提升適應能力。企業應考量自身資源限制與市場定位，選擇最適合的應對方式，並建立持續監控機制以確保策略執行效果。同時建議定期檢視外部環境變化，適時調整策略方向，維持企業競爭優勢與營運韌性。`
        }
      }));
    } finally {
      setIsGeneratingAnalyses(prev => ({
        ...prev,
        [scenario.id]: false
      }));
    }
  };

  const generateContextualDescription = (scenario: any, context: any) => {
    type CategoryType = 'risk' | 'opportunity';
    type IndustryType = 'manufacturing' | 'finance' | 'technology' | 'retail' | 'construction' | 'transportation' | 'energy' | 'healthcare' | 'hospitality' | 'education' | 'agriculture' | 'other';
    
    const templates: Record<CategoryType, Record<IndustryType | 'default', string>> = {
      risk: {
        manufacturing: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}風險時，您的生產製程和供應鏈將首當其衝。${context.hasInternational === '有' ? '由於具備國際營運據點，' : ''}此風險可能導致生產成本上升15-30%，並影響產品競爭力。特別是在碳邊境調整機制(CBAM)實施後，出口產品將面臨額外的碳關稅負擔，預估每年可能增加數百萬至千萬元的額外成本。${context.hasCarbonInventory === '已完成' ? '雖然已完成碳盤查基礎，但仍需' : '特別是在碳盤查基礎尚未完善的情況下，更需要'}建立完整的風險管控機制，包含供應商碳足跡管理、生產流程優化、能源轉換等面向，以確保營運韌性和長期獲利能力。建議立即評估現有製程的脆弱點，制定分階段的風險應對計畫，並考慮申請相關政府補助資源，降低轉型成本負擔。`,
        finance: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}風險將直接衝擊您的投資組合與放貸政策。氣候風險可能導致不良債權增加10-25%，同時面臨法規要求揭露氣候相關財務風險的壓力。${context.hasInternational === '有' ? '國際業務' : '本土業務'}都需要重新評估風險定價模型，並建立氣候壓力測試機制。${context.hasCarbonInventory === '已完成' ? '基於現有永續管理基礎，' : '在建立永續金融能力的同時，'}建議強化ESG風險評估流程，開發綠色金融商品，並提升氣候風險管理能力，以滿足監管要求並把握永續金融商機。`,
        technology: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}風險時，需要考量技術創新週期與市場需求變化。此風險可能影響研發投資回報率，特別是在綠色科技轉型需求增加的情況下，傳統技術產品可能面臨市場淘汰風險。${context.hasInternational === '有' ? '國際市場競爭' : '本土市場競爭'}將更加激烈，建議加速投入氣候科技研發，並評估既有產品線的環境影響，制定技術轉型策略。`,
        retail: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}風險將影響消費者購買行為和供應鏈穩定性。環保意識提升可能導致傳統商品銷售下滑5-20%，同時供應商環保法規遵循成本可能轉嫁給零售業者。建議評估商品組合的環境友善程度，並建立永續供應鏈管理機制，把握綠色消費趨勢商機。`,
        construction: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}風險時，綠建築法規和永續建材需求將重塑市場競爭格局。傳統建築工法可能面臨法規限制，同時業主對綠建築認證需求增加。建議投資綠色建築技術和永續建材供應鏈，並培養相關專業人才，以把握政策推動的市場機會。`,
        transportation: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}風險將直接影響燃料成本和車隊營運效率。電動化轉型和碳費徵收可能大幅增加營運成本，特別是大型車隊業者面臨的壓力更大。建議評估車隊電動化可行性，並建立燃料效率監控系統，制定分階段的低碳轉型計畫。`,
        energy: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}風險時，能源轉型政策將重新定義市場競爭規則。傳統化石燃料業務可能面臨法規限制和投資撤資風險，同時再生能源需求快速成長創造新商機。建議加速投資再生能源技術，並評估既有資產的轉型或退場策略。`,
        healthcare: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}風險可能影響醫療設備能耗和廢棄物處理成本。氣候變遷導致的健康風險增加將提升醫療需求，但同時環保法規要求醫療機構降低環境影響。建議投資節能醫療設備，並建立醫療廢棄物減量機制，平衡醫療品質與環境責任。`,
        hospitality: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}風險時，消費者對永續旅遊的需求將影響住宿選擇偏好。能源成本上升和環保法規要求可能增加營運成本10-25%，同時綠色認證成為市場差異化要素。建議投資節能設備和永續營運管理，並取得相關環保認證，提升品牌競爭力。`,
        education: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}風險將影響校園能源管理和永續教育需求。學生和家長對學校環境責任的期待提升，同時政府推動校園節能政策。建議建立校園永續管理機制，並將氣候教育納入課程規劃，培養未來人才的環境意識。`,
        agriculture: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}風險時，氣候變遷將直接影響作物生長和產量穩定性。極端天氣頻率增加可能導致農損風險提升，同時消費者對有機和永續農產品需求增加。建議投資氣候韌性農業技術，並建立多元化種植策略，降低氣候風險影響。`,
        other: `根據您企業的基本條件（${context.industry}、${context.size}${context.revenue ? `、${context.revenue}` : ''}），面對${scenario.subcategory_name}的挑戰時，需要考量企業規模限制與資源配置。此情境可能對營收和成本結構帶來顯著影響，預估影響幅度約為年營收的3-12%，具體程度取決於企業的應對策略與執行時程。${context.hasCarbonInventory === '已完成' ? '基於現有碳盤查基礎，' : '在建立碳盤查機制的同時，'}建議制定符合企業能力的應對策略，並設定可行的執行時程與預算規劃。${context.hasInternational === '有' ? '考量國際營運複雜度，' : ''}企業應建立跨部門協調機制，確保策略執行的一致性與有效性，同時建立持續監控與調整機制。`,
        default: `根據您企業的基本條件（${context.industry}、${context.size}${context.revenue ? `、${context.revenue}` : ''}），面對${scenario.subcategory_name}的挑戰時，需要考量企業規模限制與資源配置。此情境可能對營收和成本結構帶來顯著影響，預估影響幅度約為年營收的3-12%，具體程度取決於企業的應對策略與執行時程。${context.hasCarbonInventory === '已完成' ? '基於現有碳盤查基礎，' : '在建立碳盤查機制的同時，'}建議制定符合企業能力的應對策略，並設定可行的執行時程與預算規劃。${context.hasInternational === '有' ? '考量國際營運複雜度，' : ''}企業應建立跨部門協調機制，確保策略執行的一致性與有效性，同時建立持續監控與調整機制。`
      },
      opportunity: {
        manufacturing: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}為您帶來轉型升級的良機。此機會可望透過綠色製程創新、循環經濟模式導入等方式，提升產品附加價值20-40%，並開拓ESG供應鏈、綠色產品等新市場商機。${context.hasInternational === '有' ? '憑藉國際營運經驗，' : ''}更能把握全球淨零轉型趨勢帶來的商機，預估可增加年營收5-15%。${context.hasCarbonInventory === '已完成' ? '基於既有的碳管理基礎，' : '建議同步建立碳管理能力，'}能更有效把握綠色轉型趨勢，並滿足國際客戶的永續供應鏈要求。建議評估投資回收期與預期效益，制定分階段的投資計畫，並考慮申請相關政府補助資源，降低初期投資負擔。`,
        technology: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}提供了技術創新與市場擴張的重要契機。透過開發氣候科技解決方案、數位轉型服務等，預估可創造年營收10-30%的成長空間。${context.hasInternational === '有' ? '結合國際市場經驗，' : ''}更能掌握全球氣候科技趨勢，開發具競爭力的產品服務。${context.hasCarbonInventory === '已完成' ? '基於現有永續管理經驗，' : '建議同步建立永續營運能力，'}提升企業在ESG科技領域的競爭優勢，並吸引永續投資資金，加速事業發展。`,
        finance: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}機會時，綠色金融市場快速成長提供業務拓展契機。ESG投資需求增加可創造新的手續費收入，同時綠色債券和永續貸款市場規模持續擴大。建議開發綠色金融商品組合，並建立ESG風險評估能力，把握永續金融轉型商機。`,
        retail: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}機會反映消費者永續消費意識提升趨勢。綠色商品和永續品牌溢價可提升毛利率5-15%，同時循環經濟商業模式創造新營收來源。建議調整商品組合策略，並建立永續品牌形象，滿足消費者環保需求。`,
        construction: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}機會時，綠建築市場需求快速成長提供業務拓展契機。政府推動綠建築政策和企業ESG需求增加，預估可帶來20-40%的營收成長機會。建議投資綠建築技術和取得相關認證，搶攻永續建築市場商機。`,
        transportation: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}機會來自電動車和智慧物流市場快速發展。低碳運輸服務需求增加，同時政府提供電動車補助和充電基礎設施建設。建議評估電動車隊投資可行性，並開發智慧物流解決方案，把握綠色運輸轉型商機。`,
        energy: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}機會時，再生能源市場快速成長創造巨大商機。政府推動能源轉型政策和企業綠電需求增加，預估可帶來顯著營收成長。建議加速投資太陽能、風電等再生能源項目，並開發綠電交易服務，搶攻能源轉型市場。`,
        healthcare: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}機會來自預防醫學和健康管理需求增加。氣候變遷相關健康風險提升民眾健康意識，同時綠色醫療和永續健康管理服務需求成長。建議開發氣候健康管理服務，並投資綠色醫療技術，創造新的服務價值。`,
        hospitality: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}機會時，永續旅遊和生態觀光市場快速成長。消費者願意為環保住宿支付溢價，同時綠色認證提升品牌競爭力。建議投資永續設施和取得環保認證，開發生態旅遊產品，把握綠色觀光商機。`,
        education: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}機會反映永續教育和氣候人才培育需求增加。企業對ESG培訓和永續管理人才需求提升，同時政府推動環境教育政策。建議開發永續教育課程和ESG培訓服務，培養氣候變遷專業人才，創造新的教育價值。`,
        agriculture: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}面對${scenario.subcategory_name}機會時，有機農業和永續農產品市場需求持續成長。消費者對食品安全和環境友善農產品的關注提升，同時政府推動友善農業政策。建議轉型有機農業生產，並建立永續農產品品牌，把握綠色農業商機。`,
        other: `根據您企業的條件（${context.industry}、${context.size}${context.revenue ? `、${context.revenue}` : ''}），${scenario.subcategory_name}提供了業務成長的新契機。此機會可能為企業帶來新的收入來源和競爭優勢，預估營收成長潛力約8-20%，同時能提升企業在永續發展方面的品牌價值與市場定位。${context.hasCarbonInventory === '已完成' ? '結合現有的永續管理基礎，' : '建議同步強化永續管理能力，'}更能有效把握市場趨勢，滿足利害關係人期待。${context.hasInternational === '有' ? '憑藉國際營運視野，' : ''}建議進行詳細的可行性評估，制定符合企業資源的投資策略，並建立階段性的成效評估機制。`,
        default: `根據您企業的條件（${context.industry}、${context.size}${context.revenue ? `、${context.revenue}` : ''}），${scenario.subcategory_name}提供了業務成長的新契機。此機會可能為企業帶來新的收入來源和競爭優勢，預估營收成長潛力約8-20%，同時能提升企業在永續發展方面的品牌價值與市場定位。${context.hasCarbonInventory === '已完成' ? '結合現有的永續管理基礎，' : '建議同步強化永續管理能力，'}更能有效把握市場趨勢，滿足利害關係人期待。${context.hasInternational === '有' ? '憑藉國際營運視野，' : ''}建議進行詳細的可行性評估，制定符合企業資源的投資策略，並建立階段性的成效評估機制。`
      }
    };

    const categoryKey = scenario.category_type as CategoryType;
    const industryKey = (assessment.industry in templates[categoryKey] ? assessment.industry : 'default') as IndustryType | 'default';
    
    return templates[categoryKey][industryKey];
  };

  const generateStrategyRecommendations = (scenario: any, context: any) => {
    const companySize = assessment.company_size;
    const industry = assessment.industry;
    const hasInternational = context.hasInternational === '有';
    const hasCarbonInventory = context.hasCarbonInventory === '已完成';
    
    // 根據企業規模設定投資金額範圍
    const getInvestmentRange = (low: number, medium: number, high: number) => {
      switch (companySize) {
        case 'small': return `${low}-${Math.round(low * 1.5)}萬元`;
        case 'medium': return `${medium}-${Math.round(medium * 1.5)}萬元`;
        case 'large': return `${high}-${Math.round(high * 2)}萬元`;
        default: return `${medium}-${Math.round(medium * 1.5)}萬元`;
      }
    };

    // 根據企業規模設定實施時程
    const getImplementationTimeline = (strategy: string) => {
      const timelines = {
        small: { quick: '2-4個月', medium: '6-12個月', long: '1-2年' },
        medium: { quick: '3-6個月', medium: '12-18個月', long: '2-3年' },
        large: { quick: '6-12個月', medium: '18-24個月', long: '3-5年' }
      };
      
      const sizeKey = companySize as keyof typeof timelines;
      const timelineMap = timelines[sizeKey] || timelines.medium;
      
      if (strategy.includes('evaluate') || strategy.includes('accept')) return timelineMap.quick;
      if (strategy.includes('mitigate') || strategy.includes('control')) return timelineMap.medium;
      return timelineMap.long;
    };

    if (scenario.category_type === 'risk') {
      return {
        mitigate: `【具體執行方案】${companySize === 'small' ? 
          `優先導入低成本高效益措施：LED照明汰換、變頻空調、節水設備等基礎節能改善。` :
          companySize === 'medium' ?
          `投資中階節能設備：智慧電表、能源管理系統、高效率馬達，並建立能源監控機制。` :
          `大規模導入先進技術：AI能源管理、自動化製程、再生能源系統，建立碳中和示範工廠。`
        }
        【投資預算】${getInvestmentRange(30, 150, 800)}
        【實施時程】${getImplementationTimeline('mitigate')}
        【預期效益】降低${companySize === 'small' ? '10-20%' : companySize === 'medium' ? '20-35%' : '35-50%'}能耗成本
        ${hasCarbonInventory ? '【碳管理整合】結合現有碳盤查數據，設定年減碳3-8%目標' : '【建議先期作業】建議先完成碳盤查，建立減碳基準線'}
        【政府資源】${companySize === 'small' ? '申請中小企業節能補助' : '爭取工業局智慧製造補助'}`,

        transfer: `【風險轉移方案】${companySize === 'small' ?
          `購買基礎氣候風險保險（年保費約營收0.1-0.3%），與主要客戶協商風險分攤條款。` :
          companySize === 'medium' ?
          `建立完整保險組合：環境責任險、營業中斷險、碳風險保險，並與供應商建立風險共擔機制。` :
          `建立企業級風險轉移策略：國際保險、碳權期貨避險、設立海外風險基金，並主導供應鏈風險分攤協議。`
        }
        【年度成本】${getInvestmentRange(5, 25, 100)}
        【實施時程】${getImplementationTimeline('transfer')}
        ${hasInternational ? '【國際布局】整合全球據點風險管理，建立跨國保險網絡' : '【本土重點】聚焦台灣市場風險特性'}
        【預期效果】轉移60-80%潛在損失風險`,

        accept: `【風險承擔策略】${companySize === 'small' ?
          `設立應急基金${getInvestmentRange(20, 80, 300)}（約2-3個月營運成本），建立基本應變SOP。` :
          companySize === 'medium' ?
          `建立風險準備金${getInvestmentRange(50, 200, 800)}，成立跨部門危機處理小組，制定完整BCP計畫。` :
          `設立專業風險管理基金${getInvestmentRange(200, 800, 2000)}，建立董事會層級治理機制，定期進行情境壓力測試。`
        }
        【監控機制】${companySize === 'small' ? '每季檢討風險狀況' : companySize === 'medium' ? '每月風險評估會議' : '即時風險監控儀表板'}
        【應變能力】確保能承受${companySize === 'small' ? '3-6個月' : companySize === 'medium' ? '6-12個月' : '12-24個月'}的營運衝擊`,

        control: `【監控管理系統】${companySize === 'small' ?
          `建立簡易監控機制：Excel追蹤表、月報系統、關鍵指標警示，投資${getInvestmentRange(10, 30, 80)}建置基礎監控工具。` :
          companySize === 'medium' ?
          `投資${getInvestmentRange(30, 100, 300)}建立數位化監控平台：即時儀表板、自動預警、趨勢分析功能。` :
          `建立${getInvestmentRange(100, 300, 1000)}的智慧風險管理中心：AI預測分析、情境模擬、自動化應變機制。`
        }
        【關鍵指標】${industry === 'manufacturing' ? '能耗密度、碳排放量、供應鏈穩定度' : '營運成本波動、法規合規度、客戶滿意度'}
        【組織架構】${companySize === 'small' ? '指派專責人員' : companySize === 'medium' ? '成立永續管理小組' : '設立企業永續長職位'}
        【檢討頻率】${companySize === 'small' ? '每季檢討' : companySize === 'medium' ? '每月評估' : '即時監控＋每週檢討'}`
      };
    } else {
      return {
        evaluate_explore: `【市場評估計畫】${companySize === 'small' ?
          `投資${getInvestmentRange(20, 60, 200)}進行基礎調研：競爭對手分析、客戶需求調查、政策環境評估。` :
          companySize === 'medium' ?
          `委託專業顧問投資${getInvestmentRange(80, 200, 500)}進行深度分析：市場規模評估、技術可行性研究、財務影響評估。` :
          `建立內部評估團隊，投資${getInvestmentRange(200, 500, 1500)}進行全面戰略分析：全球趨勢研究、技術路徑圖、商業模式創新。`
        }
        【評估期程】${getImplementationTimeline('evaluate_explore')}
        【ROI目標】${companySize === 'small' ? '15-20%' : companySize === 'medium' ? '20-30%' : '25-35%'}
        【決策里程碑】${companySize === 'small' ? '3個月內完成go/no-go決策' : '6個月內完成投資決策'}`,

        capability_building: `【人才培育計畫】${companySize === 'small' ?
          `投資${getInvestmentRange(30, 80, 200)}培訓5-10位核心人員：永續管理、碳盤查、ESG報告撰寫能力。` :
          companySize === 'medium' ?
          `建立專業團隊，投資${getInvestmentRange(100, 300, 800)}培育20-50位專業人才，設立永續發展部門。` :
          `成立卓越中心，投資${getInvestmentRange(300, 800, 2000)}與頂尖大學合作，培養100+永續專業人才。`
        }
        【技術能力】${industry === 'manufacturing' ? '綠色製程、循環經濟、能源管理' : industry === 'technology' ? 'ESG科技、碳足跡軟體、永續創新' : '永續營運、綠色供應鏈、ESG管理'}
        【認證目標】${companySize === 'small' ? 'ISO 14001環境管理' : companySize === 'medium' ? 'ISO 50001能源管理 + B Corp認證' : 'SBTi科學減碳目標 + TCFD揭露'}
        【建置時程】${getImplementationTimeline('capability_building')}`,

        business_transformation: `【轉型投資計畫】${companySize === 'small' ?
          `調整產品組合，投資${getInvestmentRange(100, 300, 800)}開發環保產品線，優化現有服務流程。` :
          companySize === 'medium' ?
          `投資${getInvestmentRange(300, 800, 2000)}進行數位轉型：導入IoT、AI技術，開發綠色解決方案。` :
          `全面重塑商業模式，投資${getInvestmentRange(800, 2000, 5000)}建立循環經濟平台，引領產業轉型。`
        }
        【新業務方向】${industry === 'manufacturing' ? '循環經濟產品、碳中和製程服務' : industry === 'technology' ? '氣候科技解決方案、ESG數據平台' : '永續品牌、綠色服務'}
        【市場預期】${companySize === 'small' ? '新業務佔營收10-20%' : companySize === 'medium' ? '新業務佔營收20-40%' : '新業務佔營收40-60%'}
        【轉型時程】${getImplementationTimeline('business_transformation')}
        ${hasInternational ? '【國際拓展】結合全球永續趨勢，開拓國際綠色市場' : '【本土深耕】先在台灣建立成功模式，再擴展海外'}`,

        cooperation_participation: `【合作策略方案】${companySize === 'small' ?
          `參與產業聯盟（如台灣淨零協會），投資${getInvestmentRange(20, 50, 150)}加入政府綠色轉型計畫，尋求技術合作夥伴。` :
          companySize === 'medium' ?
          `建立策略聯盟，投資${getInvestmentRange(100, 300, 800)}與上下游夥伴共同開發綠色解決方案，參與國際永續標準制定。` :
          `領導產業生態系，投資${getInvestmentRange(300, 800, 2000)}主導永續供應鏈建設，與國際頂尖企業建立戰略夥伴關係。`
        }
        【合作對象】${industry === 'manufacturing' ? '綠色技術供應商、循環經濟夥伴、研發機構' : '同業領導企業、永續顧問、學術機構'}
        【政府資源】申請${companySize === 'small' ? '中小企業創新補助' : companySize === 'medium' ? '產業創新條例獎勵' : '前瞻基礎建設計畫'}
        【預期綜效】降低投資風險30-50%，加速市場進入時間`,

        aggressive_investment: `【積極投入計畫】${companySize === 'small' ?
          `在核心優勢領域投資${getInvestmentRange(150, 400, 1000)}，包含設備升級、技術採購、人才招募，搶攻利基市場。` :
          companySize === 'medium' ?
          `大膽投資${getInvestmentRange(500, 1500, 4000)}建立競爭優勢：先進設備、專利技術、品牌建設，搶佔市場領導地位。` :
          `領先投入${getInvestmentRange(1500, 4000, 10000)}突破性技術：前瞻研發、國際併購、生態系建立，成為產業標竿。`
        }
        【投資重點】${industry === 'manufacturing' ? '智慧製造、綠色工廠、循環經濟設施' : industry === 'technology' ? '氣候科技、永續平台、AI解決方案' : '數位轉型、綠色服務、品牌升級'}
        【風險控制】分階段投入，設定明確里程碑，${companySize === 'small' ? '6個月' : companySize === 'medium' ? '12個月' : '18個月'}檢討調整
        【預期回報】3-5年達成${companySize === 'small' ? '50-100%' : companySize === 'medium' ? '100-200%' : '200-300%'}投資回報率
        【市場地位】${companySize === 'small' ? '在利基市場建立領導地位' : companySize === 'medium' ? '成為區域永續標竿企業' : '引領全球產業永續轉型'}`
      };
    }
  };

  const toggleScenarioExpansion = (scenarioId: string) => {
    setExpandedScenarios(prev => ({
      ...prev,
      [scenarioId]: !prev[scenarioId]
    }));
  };

  const handleStrategySelection = (scenarioId: string, strategyId: string) => {
    setSelectedStrategies(prev => ({
      ...prev,
      [scenarioId]: strategyId
    }));
  };

  const handleSubmit = async () => {
    // 檢查是否所有情境都已選擇策略
    const missingStrategies = generatedScenarios.filter(scenario => 
      !selectedStrategies[scenario.id]
    );
    
    if (missingStrategies.length > 0) {
      alert(`請為所有情境選擇應對策略。尚未選擇策略的情境：${missingStrategies.map(s => s.subcategory_name).join('、')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      for (const scenario of generatedScenarios) {
        const analysis = scenarioAnalyses[scenario.id];
        const selectedStrategy = selectedStrategies[scenario.id];
        
        await saveScenarioEvaluation({
          assessment_id: assessment.id,
          risk_opportunity_id: scenario.risk_opportunity_id,
          scenario_description: scenario.scenario_description,
          scenario_generated_by_llm: scenario.scenario_generated_by_llm,
          user_score: 3,
          llm_response: analysis ? JSON.stringify(analysis) : undefined,
          selected_strategy: selectedStrategy,
        });
      }
      onComplete();
    } catch (error) {
      console.error('Error saving evaluations:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedScenarios = generatedScenarios.length;
  const canProceed = completedScenarios > 0 && generatedScenarios.every(scenario => 
    selectedStrategies[scenario.id]
  );

  const riskScenarios = generatedScenarios.filter(s => s.category_type === 'risk');
  const opportunityScenarios = generatedScenarios.filter(s => s.category_type === 'opportunity');

  const riskStrategies = getRiskStrategies(assessment.company_size);
  const opportunityStrategies = getOpportunityStrategies(assessment.company_size);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <Brain className="h-8 w-8 text-purple-600" />
            <span>第三階段：情境評估與策略選擇</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            基於您的企業背景，AI 為您量身打造具體的業務情境與策略建議
          </p>
        </CardHeader>
      </Card>

      {isGeneratingScenarios && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-purple-600 animate-pulse" />
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">AI 正在生成情境...</h3>
            <p className="text-gray-600 mb-4">
              結合您的產業（{assessment.industry}）、企業規模和營運特性，
              為您客製化氣候相關情境與策略建議
            </p>
            {currentGeneratingIndex >= 0 && (
              <div className="text-sm text-blue-600">
                正在處理第 {currentGeneratingIndex + 1} 個情境...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(riskScenarios.length > 0 || opportunityScenarios.length > 0) && (
        <>
          {/* 進度指示 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">策略選擇進度</h3>
                  <p className="text-sm text-blue-700">
                    已完成 {completedScenarios} 個情境分析，
                    已選擇策略 {Object.values(selectedStrategies).filter(strategy => strategy).length} 個情境
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((Object.values(selectedStrategies).filter(strategy => strategy).length / Math.max(completedScenarios, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-blue-600">策略選擇完成度</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 風險情境 */}
          {riskScenarios.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-700 flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6" />
                <span>風險情境分析與策略建議</span>
                <Badge variant="outline" className="ml-2">
                  {assessment.company_size === 'small' ? '中小企業適用' : 
                   assessment.company_size === 'medium' ? '中型企業適用' : '大型企業適用'}
                </Badge>
              </h3>

              <div className="grid gap-6">
                {riskScenarios.map((scenario, index) => {
                  const analysis = scenarioAnalyses[scenario.id];
                  const isExpanded = expandedScenarios[scenario.id];
                  const isAnalysisLoading = isGeneratingAnalyses[scenario.id];
                  const selectedStrategy = selectedStrategies[scenario.id];
                  
                  return (
                    <Card key={scenario.id} className="border-l-4 border-red-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-3">
                              🔴 風險情境 {index + 1}: {scenario.subcategory_name}
                            </CardTitle>
                            
                            <div className="flex space-x-2 mb-4">
                              <Badge variant="outline">{scenario.category_name}</Badge>
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />風險
                              </Badge>
                              {scenario.scenario_generated_by_llm && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="h-3 w-3 mr-1" />AI 生成
                                </Badge>
                              )}
                            </div>

                            {/* 情境描述 */}
                            {analysis?.contextual_description && (
                              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400 mb-4">
                                <h4 className="font-medium text-red-900 mb-2 flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  情境影響分析
                                </h4>
                                <p className="text-red-800 text-sm leading-relaxed">{analysis.contextual_description}</p>
                              </div>
                            )}

                            {/* 載入中狀態 */}
                            {isAnalysisLoading && (
                              <div className="text-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600 mb-2" />
                                <p className="text-gray-600 text-sm">正在生成詳細策略建議...</p>
                              </div>
                            )}
                            
                            {/* 策略選擇 */}
                            {analysis?.strategy_recommendations && (
                              <div className="space-y-4">
                                <Label className="text-sm font-bold text-red-700 flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  請選擇適合的應對策略<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <RadioGroup
                                  value={selectedStrategy || ''}
                                  onValueChange={(value) => handleStrategySelection(scenario.id, value)}
                                >
                                  <div className="grid grid-cols-1 gap-4">
                                    {riskStrategies.map((strategy) => (
                                      <div key={strategy.id} className={`border rounded-lg p-4 transition-colors ${
                                        selectedStrategy === strategy.id 
                                          ?  'border-red-500 bg-red-50' 
                                          : 'border-gray-200 hover:border-red-300'
                                      }`}>
                                        <div className="flex items-start space-x-3">
                                          <RadioGroupItem
                                            value={strategy.id}
                                            id={`${scenario.id}-${strategy.id}`}
                                            className="mt-1"
                                          />
                                          <div className="flex-1">
                                            <label 
                                              htmlFor={`${scenario.id}-${strategy.id}`}
                                              className="text-sm font-medium text-gray-900 cursor-pointer block mb-2 flex items-center"
                                            >
                                              <span className="mr-2">{strategy.icon}</span>
                                              {strategy.name}
                                            </label>
                                            <p className="text-xs text-gray-600 mb-2">
                                              {strategy.description}
                                            </p>
                                            {analysis.strategy_recommendations[strategy.id] && (
                                              <div className="bg-white p-3 rounded border-l-4 border-red-300">
                                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                  {analysis.strategy_recommendations[strategy.id]}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </RadioGroup>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleScenarioExpansion(scenario.id)}
                            className="ml-4"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">完整情境描述</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {scenario.scenario_description}
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 機會情境 */}
          {opportunityScenarios.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-700 flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span>機會情境分析與策略建議</span>
                <Badge variant="outline" className="ml-2">
                  {assessment.company_size === 'small' ? '中小企業適用' : 
                   assessment.company_size === 'medium' ? '中型企業適用' : '大型企業適用'}
                </Badge>
              </h3>

              <div className="grid gap-6">
                {opportunityScenarios.map((scenario, index) => {
                  const analysis = scenarioAnalyses[scenario.id];
                  const isExpanded = expandedScenarios[scenario.id];
                  const isAnalysisLoading = isGeneratingAnalyses[scenario.id];
                  const selectedStrategy = selectedStrategies[scenario.id];
                  
                  return (
                    <Card key={scenario.id} className="border-l-4 border-green-500">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-3">
                              🟢 機會情境 {index + 1}: {scenario.subcategory_name}
                            </CardTitle>
                            
                            <div className="flex space-x-2 mb-4">
                              <Badge variant="outline">{scenario.category_name}</Badge>
                              <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />機會
                              </Badge>
                              {scenario.scenario_generated_by_llm && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="h-3 w-3 mr-1" />AI 生成
                                </Badge>
                              )}
                            </div>

                            {/* 情境描述 */}
                            {analysis?.contextual_description && (
                              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400 mb-4">
                                <h4 className="font-medium text-green-900 mb-2 flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  機會價值分析
                                </h4>
                                <p className="text-green-800 text-sm leading-relaxed">{analysis.contextual_description}</p>
                              </div>
                            )}

                            {/* 載入中狀態 */}
                            {isAnalysisLoading && (
                              <div className="text-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600 mb-2" />
                                <p className="text-gray-600 text-sm">正在生成詳細策略建議...</p>
                              </div>
                            )}
                            
                            {/* 策略選擇 */}
                            {analysis?.strategy_recommendations && (
                              <div className="space-y-4">
                                <Label className="text-sm font-bold text-green-700 flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  請選擇適合的把握策略<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <RadioGroup
                                  value={selectedStrategy || ''}
                                  onValueChange={(value) => handleStrategySelection(scenario.id, value)}
                                >
                                  <div className="grid grid-cols-1 gap-4">
                                    {opportunityStrategies.map((strategy) => (
                                      <div key={strategy.id} className={`border rounded-lg p-4 transition-colors ${
                                        selectedStrategy === strategy.id 
                                          ? 'border-green-500 bg-green-50' 
                                          : 'border-gray-200 hover:border-green-300'
                                      }`}>
                                        <div className="flex items-start space-x-3">
                                          <RadioGroupItem
                                            value={strategy.id}
                                            id={`${scenario.id}-${strategy.id}`}
                                            className="mt-1"
                                          />
                                          <div className="flex-1">
                                            <label 
                                              htmlFor={`${scenario.id}-${strategy.id}`}
                                              className="text-sm font-medium text-gray-900 cursor-pointer block mb-2 flex items-center"
                                            >
                                              <span className="mr-2">{strategy.icon}</span>
                                              {strategy.name}
                                            </label>
                                            <p className="text-xs text-gray-600 mb-2">
                                              {strategy.description}
                                            </p>
                                            {analysis.strategy_recommendations[strategy.id] && (
                                              <div className="bg-white p-3 rounded border-l-4 border-green-300">
                                                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                                  {analysis.strategy_recommendations[strategy.id]}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </RadioGroup>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleScenarioExpansion(scenario.id)}
                            className="ml-4"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">完整情境描述</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {scenario.scenario_description}
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* 提交按鈕 */}
          <div className="flex justify-center pt-6">
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  儲存評估中...
                </>
              ) : (
                `進入策略分析階段（${Object.values(selectedStrategies).filter(strategy => strategy).length}/${completedScenarios} 已選擇策略）`
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TCFDStage3;
