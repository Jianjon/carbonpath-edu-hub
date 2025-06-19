import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [selectedStrategies, setSelectedStrategies] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState<number>(-1);

  // 風險策略選項定義
  const riskStrategies = [
    { 
      id: 'mitigate', 
      name: '減緩策略', 
      icon: '🛡️',
      description: '主動降低風險發生的可能性或影響程度'
    },
    { 
      id: 'transfer', 
      name: '轉移策略', 
      icon: '🔄',
      description: '透過保險、合約等方式將風險轉移給第三方'
    },
    { 
      id: 'accept', 
      name: '接受策略', 
      icon: '✅',
      description: '承擔風險並建立相應的應對準備'
    },
    { 
      id: 'control', 
      name: '控制策略', 
      icon: '📊',
      description: '建立監控機制以管理和控制風險'
    }
  ];

  // 機會策略選項定義
  const opportunityStrategies = [
    { 
      id: 'evaluate_explore', 
      name: '評估探索策略', 
      icon: '🔍',
      description: '深入研究機會的可行性和潛在價值'
    },
    { 
      id: 'capability_building', 
      name: '能力建設策略', 
      icon: '💪',
      description: '強化內部能力以把握機會'
    },
    { 
      id: 'business_transformation', 
      name: '商業轉換策略', 
      icon: '🔄',
      description: '調整商業模式以充分利用機會'
    },
    { 
      id: 'cooperation_participation', 
      name: '合作參與策略', 
      icon: '🤝',
      description: '透過合作夥伴關係共同開發機會'
    },
    { 
      id: 'aggressive_investment', 
      name: '積極投入策略', 
      icon: '🚀',
      description: '大規模投資以快速把握機會'
    }
  ];

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
        default: `根據您企業的基本條件（${context.industry}、${context.size}${context.revenue ? `、${context.revenue}` : ''}），面對${scenario.subcategory_name}的挑戰時，需要考量企業規模限制與資源配置。此情境可能對營收和成本結構帶來顯著影響，預估影響幅度約為年營收的3-12%，具體程度取決於企業的應對策略與執行時程。${context.hasCarbonInventory === '已完成' ? '基於現有碳盤查基礎，' : '在建立碳盤查機制的同時，'}建議制定符合企業能力的應對策略，並設定可行的執行時程與預算規劃。${context.hasInternational === '有' ? '考量國際營運複雜度，' : ''}企業應建立跨部門協調機制，確保策略執行的一致性與有效性，同時建立持續監控與調整機制。`
      },
      opportunity: {
        manufacturing: `作為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}為您帶來轉型升級的良機。此機會可望透過綠色製程創新、循環經濟模式導入等方式，提升產品附加價值20-40%，並開拓ESG供應鏈、綠色產品等新市場商機。${context.hasInternational === '有' ? '憑藉國際營運經驗，' : ''}更能把握全球淨零轉型趨勢帶來的商機，預估可增加年營收5-15%。${context.hasCarbonInventory === '已完成' ? '基於既有的碳管理基礎，' : '建議同步建立碳管理能力，'}能更有效把握綠色轉型趨勢，並滿足國際客戶的永續供應鏈要求。建議評估投資回收期與預期效益，制定分階段的投資計畫，並考慮申請相關政府補助資源，降低初期投資負擔。`,
        technology: `身為${context.size}的${context.industry}企業，${context.revenue ? `（${context.revenue}）` : ''}${scenario.subcategory_name}提供了技術創新與市場擴張的重要契機。透過開發氣候科技解決方案、數位轉型服務等，預估可創造年營收10-30%的成長空間。${context.hasInternational === '有' ? '結合國際市場經驗，' : ''}更能掌握全球氣候科技趨勢，開發具競爭力的產品服務。${context.hasCarbonInventory === '已完成' ? '基於現有永續管理經驗，' : '建議同步建立永續營運能力，'}提升企業在ESG科技領域的競爭優勢，並吸引永續投資資金，加速事業發展。`,
        default: `根據您企業的條件（${context.industry}、${context.size}${context.revenue ? `、${context.revenue}` : ''}），${scenario.subcategory_name}提供了業務成長的新契機。此機會可能為企業帶來新的收入來源和競爭優勢，預估營收成長潛力約8-20%，同時能提升企業在永續發展方面的品牌價值與市場定位。${context.hasCarbonInventory === '已完成' ? '結合現有的永續管理基礎，' : '建議同步強化永續管理能力，'}更能有效把握市場趨勢，滿足利害關係人期待。${context.hasInternational === '有' ? '憑藉國際營運視野，' : ''}建議進行詳細的可行性評估，制定符合企業資源的投資策略，並建立階段性的成效評估機制。`
      }
    };

    const categoryKey = scenario.category_type as CategoryType;
    const industryKey = (assessment.industry in templates[categoryKey] ? assessment.industry : 'default') as IndustryType | 'default';
    
    return templates[categoryKey][industryKey];
  };

  const generateStrategyRecommendations = (scenario: any, context: any) => {
    if (scenario.category_type === 'risk') {
      return {
        mitigate: `建議導入${context.industry === 'manufacturing' ? '自動化節能設備和智慧製程監控系統，包含熱回收系統、變頻器、LED照明等' : context.industry === 'finance' ? 'ESG風險評估系統和綠色金融商品開發' : '數位化管理工具和節能技術'}，預估投資${context.size === 'large' ? '500-1000萬元' : context.size === 'medium' ? '100-300萬元' : '50-150萬元'}。${context.hasCarbonInventory === '已完成' ? '基於現有碳盤查數據，' : '建議先完成碳盤查，'}制定3-5年的減碳路徑圖，設定年減碳3-5%的目標，並申請經濟部節能補助、環保署低碳認證等資源，預期可降低風險影響60-80%，同時減少營運成本8-15%。`,
        
        transfer: `考慮購買${scenario.subcategory_name.includes('極端天氣') ? '天災責任險和營業中斷險，涵蓋颱風、豪雨、乾旱等' : '環境責任險和碳風險保險，包含碳價波動、法規變更等風險'}，年保費約營收的0.1-0.3%。${context.hasInternational === '有' ? '針對國際據點，考慮跨國保險方案，' : ''}可與主要客戶協商風險分攤條款，或透過碳權期貨、綠電憑證等金融工具轉移價格波動風險。建議與專業保險公司討論客製化保單設計，並評估設立風險互助基金的可行性。`,
        
        accept: `設立風險準備金約${context.revenue === 'large' ? '500-1000萬元' : context.revenue === 'medium' ? '100-300萬元' : '50-100萬元'}，相當於月營收的1-2倍，並建立應急響應機制。${context.industry === 'manufacturing' ? '備妥替代供應商名單和緊急生產計畫，建立多元化供應鏈' : '制定業務持續營運計畫，包含遠距辦公、數位化流程等'}，定期進行風險壓力測試，模擬不同情境下的財務衝擊，確保企業能承受短期衝擊並逐步改善體質。同時建立董事會層級的風險治理機制。`,
        
        control: `建立${scenario.subcategory_name}風險監控儀表板，設定關鍵預警指標（如${context.industry === 'manufacturing' ? '能耗密度、碳排放量、供應鏈穩定度、原物料價格' : '營運成本、法規變化指數、市場波動率、客戶滿意度'}）。成立跨部門風險管理小組，每季檢討風險狀況，每月更新風險矩陣，並建立標準作業程序與應變手冊。投資監控系統約${context.size === 'large' ? '50-100萬元' : '20-50萬元'}，包含數據收集、分析預警、自動報告等功能。`
      };
    } else {
      return {
        evaluate_explore: `建議投入${context.size === 'large' ? '100-300萬元' : context.size === 'medium' ? '50-150萬元' : '20-80萬元'}進行市場研究和技術評估，包含可行性分析、競爭對手研究、法規環境評估等。${context.industry === 'manufacturing' ? '分析生產線改善潛力和產品升級可行性，評估循環經濟、綠色製程等創新模式' : '評估服務模式創新和數位轉型機會，探索ESG科技、永續金融等新興領域'}，委託專業顧問進行投資報酬率分析，預期評估期3-6個月，ROI目標設定15-25%。`,
        
        capability_building: `規劃${context.industry === 'manufacturing' ? '製程技術和品質管理、環境工程、永續供應鏈管理' : '數位技能和永續管理、ESG報告、綠色金融'}等人才培訓計畫，預算${context.size === 'large' ? '200-400萬元' : context.size === 'medium' ? '80-200萬元' : '30-100萬元'}。建立內部創新團隊，設立永續發展部門或綠色創新實驗室，並考慮與大學或研究機構合作，申請產學合作計畫，強化技術研發能量。預期18-24個月建立核心能力，培養20-50位專業人才。`,
        
        business_transformation: `制定${context.industry}數位轉型和永續發展策略，投資${context.size === 'large' ? '500-1500萬元' : context.size === 'medium' ? '200-600萬元' : '100-300萬元'}進行業務模式調整，包含產品服務創新、通路策略優化、組織結構調整等。${context.hasInternational === '有' ? '整合國際資源，建立全球永續供應鏈，' : ''}開發ESG產品線或綠色服務項目，預期2-3年完成轉型，帶來20-50%營收成長，並提升企業ESG評等至前25%。`,
        
        cooperation_participation: `尋求與${context.industry === 'manufacturing' ? '上下游廠商和技術供應商、環保科技公司' : '同業夥伴和解決方案提供商、永續顧問公司'}的策略合作。參與產業聯盟（如台灣淨零排放協會）或政府綠色轉型計畫，共同投資約${context.size === 'large' ? '300-800萬元' : context.size === 'medium' ? '100-300萬元' : '50-150萬元'}。透過合作分攤風險，加速市場進入，並建立產業生態系，預期合作效益可提升投資效率30-50%。`,
        
        aggressive_investment: `大膽投資${context.industry === 'manufacturing' ? '先進生產設備和自動化系統、再生能源設施、循環經濟基礎建設' : '創新技術和市場擴張、數位平台、永續金融商品開發'}，預算${context.size === 'large' ? '1000-3000萬元' : context.size === 'medium' ? '300-1000萬元' : '150-500萬元'}。${context.revenue === 'large' ? '憑藉充足資金實力，' : '可考慮申請國發基金、綠色金融或引進策略投資者，'}搶佔市場先機，建立技術護城河，預期3-5年回收投資，並成為產業標竿企業。`
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
    setSelectedStrategies(prev => {
      const currentSelections = prev[scenarioId] || [];
      const isSelected = currentSelections.includes(strategyId);
      
      if (isSelected) {
        return {
          ...prev,
          [scenarioId]: currentSelections.filter(id => id !== strategyId)
        };
      } else {
        return {
          ...prev,
          [scenarioId]: [...currentSelections, strategyId]
        };
      }
    });
  };

  const handleSubmit = async () => {
    // 檢查是否所有情境都已選擇至少一個策略
    const missingStrategies = generatedScenarios.filter(scenario => 
      !selectedStrategies[scenario.id] || selectedStrategies[scenario.id].length === 0
    );
    
    if (missingStrategies.length > 0) {
      alert(`請為所有情境選擇至少一個應對策略。尚未選擇策略的情境：${missingStrategies.map(s => s.subcategory_name).join('、')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      for (const scenario of generatedScenarios) {
        const analysis = scenarioAnalyses[scenario.id];
        const selectedStrategiesForScenario = selectedStrategies[scenario.id] || [];
        
        await saveScenarioEvaluation({
          assessment_id: assessment.id,
          risk_opportunity_id: scenario.risk_opportunity_id,
          scenario_description: scenario.scenario_description,
          scenario_generated_by_llm: scenario.scenario_generated_by_llm,
          user_score: 3,
          llm_response: analysis ? JSON.stringify(analysis) : undefined,
          selected_strategy: selectedStrategiesForScenario.join(','),
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
    selectedStrategies[scenario.id] && selectedStrategies[scenario.id].length > 0
  );

  const riskScenarios = generatedScenarios.filter(s => s.category_type === 'risk');
  const opportunityScenarios = generatedScenarios.filter(s => s.category_type === 'opportunity');

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
                    已選擇策略 {Object.values(selectedStrategies).filter(strategies => strategies.length > 0).length} 個情境
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((Object.values(selectedStrategies).filter(strategies => strategies.length > 0).length / Math.max(completedScenarios, 1)) * 100)}%
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
              </h3>

              <div className="grid gap-6">
                {riskScenarios.map((scenario, index) => {
                  const analysis = scenarioAnalyses[scenario.id];
                  const isExpanded = expandedScenarios[scenario.id];
                  const isAnalysisLoading = isGeneratingAnalyses[scenario.id];
                  const selectedStrategiesForScenario = selectedStrategies[scenario.id] || [];
                  
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
                                  請選擇適合的應對策略（可多選）<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="grid grid-cols-1 gap-4">
                                  {riskStrategies.map((strategy) => (
                                    <div key={strategy.id} className={`border rounded-lg p-4 transition-colors ${
                                      selectedStrategiesForScenario.includes(strategy.id) 
                                        ?  'border-red-500 bg-red-50' 
                                        : 'border-gray-200 hover:border-red-300'
                                    }`}>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox
                                          id={`${scenario.id}-${strategy.id}`}
                                          checked={selectedStrategiesForScenario.includes(strategy.id)}
                                          onCheckedChange={(checked) => {
                                            handleStrategySelection(scenario.id, strategy.id);
                                          }}
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
                                              <p className="text-sm text-gray-700 leading-relaxed">
                                                {analysis.strategy_recommendations[strategy.id]}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
              </h3>

              <div className="grid gap-6">
                {opportunityScenarios.map((scenario, index) => {
                  const analysis = scenarioAnalyses[scenario.id];
                  const isExpanded = expandedScenarios[scenario.id];
                  const isAnalysisLoading = isGeneratingAnalyses[scenario.id];
                  const selectedStrategiesForScenario = selectedStrategies[scenario.id] || [];
                  
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
                                  請選擇適合的把握策略（可多選）<span className="text-red-500 ml-1">*</span>
                                </Label>
                                <div className="grid grid-cols-1 gap-4">
                                  {opportunityStrategies.map((strategy) => (
                                    <div key={strategy.id} className={`border rounded-lg p-4 transition-colors ${
                                      selectedStrategiesForScenario.includes(strategy.id) 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-200 hover:border-green-300'
                                    }`}>
                                      <div className="flex items-start space-x-3">
                                        <Checkbox
                                          id={`${scenario.id}-${strategy.id}`}
                                          checked={selectedStrategiesForScenario.includes(strategy.id)}
                                          onCheckedChange={(checked) => {
                                            handleStrategySelection(scenario.id, strategy.id);
                                          }}
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
                                              <p className="text-sm text-gray-700 leading-relaxed">
                                                {analysis.strategy_recommendations[strategy.id]}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
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
                `進入策略分析階段（${Object.values(selectedStrategies).filter(strategies => strategies.length > 0).length}/${completedScenarios} 已選擇策略）`
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TCFDStage3;
