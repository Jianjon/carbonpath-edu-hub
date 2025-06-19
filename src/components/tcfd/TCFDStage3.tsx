
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { Brain, Loader2, Sparkles, Target, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Star } from 'lucide-react';

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

  // 策略選項定義
  const riskStrategies = [
    { id: 'mitigate', name: '減緩策略', description: '主動降低風險發生的可能性或影響程度' },
    { id: 'transfer', name: '轉移策略', description: '透過保險、合約等方式將風險轉移給第三方' },
    { id: 'accept', name: '接受策略', description: '承擔風險並建立相應的應對準備' },
    { id: 'control', name: '控制策略', description: '建立監控機制以管理和控制風險' }
  ];

  const opportunityStrategies = [
    { id: 'evaluate_explore', name: '評估探索策略', description: '深入研究機會的可行性和潛在價值' },
    { id: 'capability_building', name: '能力建設策略', description: '強化內部能力以把握機會' },
    { id: 'business_transformation', name: '商業轉換策略', description: '調整商業模式以充分利用機會' },
    { id: 'cooperation_participation', name: '合作參與策略', description: '透過合作夥伴關係共同開發機會' },
    { id: 'aggressive_investment', name: '積極投入策略', description: '大規模投資以快速把握機會' }
  ];

  // 情境描述對應表 - 增加財務考量的150字描述
  const scenarioDescriptions: Record<string, string> = {
    // 風險情境描述（150字左右，包含財務考量）
    '急性實體風險': '極端天氣事件（如颱風、洪水、熱浪）頻率與強度增加，對企業營運設施造成直接衝擊。這類風險將導致生產中斷、設備損毀、物流延誤等問題，直接影響營收與成本結構。財務方面需考量：設備修復與更換成本、營業中斷損失、保險費率上升、以及因應災害的資本支出增加。企業需評估現有保險涵蓋範圍，並規劃緊急應變資金，同時考慮將防災投資納入長期資本規劃，以降低未來潛在損失並維持營運韌性。',
    
    '慢性實體風險': '長期氣候變化如海平面上升、平均溫度升高、降雨模式改變等，逐步改變企業營運環境。這類風險影響供應鏈穩定性、原料供給、以及營運成本結構。財務影響包括：冷卻系統能耗增加、水資源成本上升、原料價格波動、以及可能的廠址遷移需求。企業需進行中長期財務規劃，評估氣候變化對營運成本的累積影響，並考慮在資產配置、供應鏈佈局等方面的調整投資，確保長期競爭力與獲利能力不受侵蝕。',
    
    '碳定價機制': '政府實施碳稅、碳費或總量管制與交易制度，直接增加企業碳排放成本。此政策風險對高碳排產業影響尤為顯著，將改變產品成本結構與競爭態勢。財務衝擊包括：直接碳成本支出、產品價格競爭力下降、以及減碳投資需求增加。企業需建立碳會計制度，準確估算碳成本對利潤的影響，並評估減碳投資的投資報酬率。同時需考慮碳權交易的套期保值策略，以及將碳成本轉嫁給客戶的定價策略調整，確保獲利能力維持。',
    
    '法規政策變化': '氣候相關法規日趨嚴格，包括能源效率標準、環保排放限制、永續揭露要求等，增加合規成本與營運限制。法規變化可能影響產品設計、生產流程、以及市場准入條件。財務考量包括：合規投資成本、可能的罰款風險、以及因法規限制導致的商機損失。企業需建立法規監控機制，提前規劃合規投資預算，並評估法規變化對現有資產價值的影響。同時需考慮將合規成本納入產品定價，並探索法規驅動的新商業機會。',
    
    '技術發展風險': '低碳技術快速發展可能使現有技術與設備面臨淘汰風險，影響企業競爭地位。技術變革速度加快，要求企業持續投資研發與設備更新。財務風險包括：現有資產提前折舊、技術升級投資需求、以及可能的技術落後導致市場份額流失。企業需建立技術路線圖與投資計畫，評估技術升級的時機與投資規模，並考慮與技術領先企業的合作或授權策略。同時需平衡創新投資與現有資產利用，確保技術轉型過程中的財務穩定性。',
    
    '市場偏好轉變': '消費者與投資人日益重視環境永續，偏好低碳產品與ESG表現良好的企業，傳統高碳產品需求可能下降。市場偏好轉變影響產品銷售、品牌價值、以及資金取得成本。財務影響包括：傳統產品營收下滑、綠色產品開發成本、以及ESG投資需求。企業需重新評估產品組合策略，估算綠色轉型的投資需求與預期報酬，並考慮永續金融工具的運用。同時需建立ESG績效追蹤機制，確保永續投資能有效提升企業價值與降低資金成本。',

    // 機會情境描述（150字左右，包含財務考量）
    '能源效率提升': '透過導入先進節能技術、智慧化能源管理系統、以及製程優化，大幅提升能源使用效率。此機會不僅能直接降低營運成本，還能提升企業永續形象，吸引ESG投資。財務效益包括：能源成本年減15-30%、設備效率提升帶來的產能增加、以及可能的政府節能補助。投資考量需評估節能設備的投資報酬率，通常回收期為2-5年。企業應建立能源績效監控機制，量化節能效益，並考慮將節能成果納入綠色債券或永續連結貸款的申請條件，進一步降低融資成本。',
    
    '再生能源應用': '採用太陽能、風能等再生能源，減少對傳統電力的依賴，同時獲得綠電憑證與碳權效益。此機會能穩定長期能源成本，提升供應鏈韌性，並滿足國際客戶的綠電需求。財務效益包括：長期電力成本鎖定、綠電憑證銷售收入、以及吸引重視永續的客戶訂單。投資評估需考慮再生能源設備的初期資本支出、20年期間的現金流分析、以及政府相關補助政策。企業可透過電力購買協議(PPA)降低初期投資，並評估自建與購買綠電的成本效益比較。',
    
    '低碳產品開發': '開發環保材料、節能產品、或具有碳足跡優勢的創新商品，搶攻快速成長的綠色市場。低碳產品通常享有價格溢價，能提升企業獲利能力與市場地位。財務機會包括：新產品營收貢獻、較高的毛利率、以及品牌價值提升帶來的整體溢價效應。投資需求涵蓋研發費用、生產線調整、以及行銷推廣成本。企業應建立產品碳足跡評估機制，量化環境效益，並考慮申請相關環保認證，提升產品競爭力。同時需評估綠色產品的市場接受度與成長潛力。',
    
    '綠色金融商品': '金融業者可開發綠色債券、永續投資基金、碳權交易服務等創新金融商品，滿足市場對永續金融的需求。此機會能開拓新的收入來源，提升客戶黏著度，並建立永續金融領域的專業形象。財務效益包括：手續費收入增加、資產管理規模擴大、以及與ESG表現良好企業的業務機會。投資需求包括系統建置、人才培訓、以及法規合規成本。金融機構需建立ESG評估能力，並考慮與國際永續金融標準接軌，提升商品競爭力與國際認可度。'
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

      // 分批生成，每次生成一個情境並立即顯示
      for (let i = 0; i < selectedItems.length; i++) {
        const selection = selectedItems[i];
        setCurrentGeneratingIndex(i);
        
        try {
          console.log(`正在生成情境 ${i + 1}/${selectedItems.length}:`, selection.category_name, selection.subcategory_name);
          
          let scenarioDescription = '';
          
          // 如果是自訂情境，使用自訂描述
          if (selection.subcategory_name?.startsWith('自訂情境：')) {
            scenarioDescription = selection.custom_scenario_description || selection.subcategory_name;
          } else {
            // 使用預設描述或 AI 生成
            scenarioDescription = scenarioDescriptions[selection.subcategory_name!] || 
                                await generateScenarioWithLLM(
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
          };

          scenarios.push(scenario);
          
          // 立即更新顯示，讓用戶看到進度
          setGeneratedScenarios([...scenarios]);

          // 異步生成詳細分析（不影響情境顯示）
          if (!scenario.is_custom) {
            generateAnalysisAsync(scenario);
          }

        } catch (error) {
          console.error('生成情境失敗：', selection.subcategory_name, error);
          // 使用預設描述作為後備
          const fallbackScenario = {
            id: `scenario-${selection.id}`,
            risk_opportunity_id: selection.id,
            category_name: selection.category_name,
            subcategory_name: selection.subcategory_name,
            category_type: selection.category_type,
            scenario_description: scenarioDescriptions[selection.subcategory_name!] || `針對「${selection.subcategory_name}」的具體情境正在生成中，請稍後重新整理頁面查看完整內容。`,
            scenario_generated_by_llm: true,
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

      // 只生成情境概要，不包括財務影響分析
      const enhancedSummary = analysis?.scenario_summary || 
        `這是一個關於${scenario.category_name}的${scenario.category_type === 'risk' ? '風險' : '機會'}情境，需要企業重視並制定相應的管理策略。建議進行詳細的影響評估，並根據企業實際情況選擇最適合的應對策略，以確保營運韌性與長期競爭力。`;

      setScenarioAnalyses(prev => ({
        ...prev,
        [scenario.id]: {
          scenario_summary: enhancedSummary
        }
      }));

    } catch (error) {
      console.error('生成分析失敗：', scenario.subcategory_name, error);
      // 提供預設的概要
      setScenarioAnalyses(prev => ({
        ...prev,
        [scenario.id]: {
          scenario_summary: `針對${scenario.subcategory_name}情境，企業需要建立完整的${scenario.category_type === 'risk' ? '風險管理' : '機會把握'}機制。建議透過系統性的評估與規劃，制定符合企業資源與目標的策略方案，並定期檢討調整，以確保策略的有效性與適應性，維持企業在變動環境中的競爭優勢。`
        }
      }));
    } finally {
      setIsGeneratingAnalyses(prev => ({
        ...prev,
        [scenario.id]: false
      }));
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
    const missingStrategies = generatedScenarios.filter(scenario => !selectedStrategies[scenario.id]);
    if (missingStrategies.length > 0) {
      alert(`請為所有情境選擇應對策略。尚未選擇策略的情境：${missingStrategies.map(s => s.subcategory_name).join('、')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // 儲存所有評估結果
      for (const scenario of generatedScenarios) {
        const analysis = scenarioAnalyses[scenario.id];
        const selectedStrategy = selectedStrategies[scenario.id];
        
        await saveScenarioEvaluation({
          assessment_id: assessment.id,
          risk_opportunity_id: scenario.risk_opportunity_id,
          scenario_description: scenario.scenario_description,
          scenario_generated_by_llm: scenario.scenario_generated_by_llm,
          user_score: 3, // 預設高相關性
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
  const canProceed = completedScenarios > 0 && generatedScenarios.every(scenario => selectedStrategies[scenario.id]);

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
            AI 已為您生成具體的業務情境描述，請為每個情境選擇最適合的應對策略
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
              根據您的產業別（{assessment.industry}）和企業規模，
              為您量身定制氣候相關情境描述
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
                  <h3 className="font-medium text-blue-900">分析進度</h3>
                  <p className="text-sm text-blue-700">
                    已完成 {completedScenarios} 個情境，
                    已選擇策略 {Object.keys(selectedStrategies).length} 個
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((Object.keys(selectedStrategies).length / Math.max(completedScenarios, 1)) * 100)}%
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
                <span>風險情境分析</span>
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
                            <CardTitle className="text-lg mb-2">
                              🔴 風險情境 {index + 1}: {scenario.subcategory_name}
                            </CardTitle>
                            
                            {/* 情境概要 */}
                            {analysis?.scenario_summary && (
                              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400 mb-4">
                                <h4 className="font-medium text-red-900 mb-2">🔍 情境概要</h4>
                                <p className="text-red-800 text-sm leading-relaxed">{analysis.scenario_summary}</p>
                              </div>
                            )}

                            {/* 載入中狀態 */}
                            {isAnalysisLoading && (
                              <div className="text-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600 mb-2" />
                                <p className="text-gray-600 text-sm">正在生成詳細分析...</p>
                              </div>
                            )}
                            
                            <div className="flex space-x-2 mb-4">
                              <Badge variant="outline">{scenario.category_name}</Badge>
                              <Badge className="bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />風險
                              </Badge>
                              {scenario.scenario_generated_by_llm && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI 生成
                                </Badge>
                              )}
                              {scenario.is_custom && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  用戶自填
                                </Badge>
                              )}
                            </div>

                            {/* 策略選擇 */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-red-700">
                                請選擇應對策略 <span className="text-red-500">*</span>
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {riskStrategies.map((strategy) => (
                                  <div key={strategy.id} className="flex items-start space-x-3">
                                    <Checkbox
                                      id={`${scenario.id}-${strategy.id}`}
                                      checked={selectedStrategy === strategy.id}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          handleStrategySelection(scenario.id, strategy.id);
                                        }
                                      }}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <label 
                                        htmlFor={`${scenario.id}-${strategy.id}`}
                                        className="text-sm font-medium text-gray-900 cursor-pointer block"
                                      >
                                        {strategy.name}
                                      </label>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {strategy.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
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
                <span>機會情境分析</span>
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
                            <CardTitle className="text-lg mb-2">
                              🟢 機會情境 {index + 1}: {scenario.subcategory_name}
                            </CardTitle>
                            
                            {/* 情境概要 */}
                            {analysis?.scenario_summary && (
                              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400 mb-4">
                                <h4 className="font-medium text-green-900 mb-2">🔍 情境概要</h4>
                                <p className="text-green-800 text-sm leading-relaxed">{analysis.scenario_summary}</p>
                              </div>
                            )}

                            {/* 載入中狀態 */}
                            {isAnalysisLoading && (
                              <div className="text-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-purple-600 mb-2" />
                                <p className="text-gray-600 text-sm">正在生成詳細分析...</p>
                              </div>
                            )}
                            
                            <div className="flex space-x-2 mb-4">
                              <Badge variant="outline">{scenario.category_name}</Badge>
                              <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />機會
                              </Badge>
                              {scenario.scenario_generated_by_llm && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI 生成
                                </Badge>
                              )}
                              {scenario.is_custom && (
                                <Badge className="bg-orange-100 text-orange-800">
                                  用戶自填
                                </Badge>
                              )}
                            </div>

                            {/* 策略選擇 */}
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-green-700">
                                請選擇應對策略 <span className="text-red-500">*</span>
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {opportunityStrategies.map((strategy) => (
                                  <div key={strategy.id} className="flex items-start space-x-3">
                                    <Checkbox
                                      id={`${scenario.id}-${strategy.id}`}
                                      checked={selectedStrategy === strategy.id}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          handleStrategySelection(scenario.id, strategy.id);
                                        }
                                      }}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <label 
                                        htmlFor={`${scenario.id}-${strategy.id}`}
                                        className="text-sm font-medium text-gray-900 cursor-pointer block"
                                      >
                                        {strategy.name}
                                      </label>
                                      <p className="text-xs text-gray-600 mt-1">
                                        {strategy.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
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
              {isSubmitting ? '儲存評估中...' : `進入策略分析階段（${Object.keys(selectedStrategies).length}/${completedScenarios} 已選擇策略）`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TCFDStage3;
