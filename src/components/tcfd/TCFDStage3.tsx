
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface TCFDStage3Props {
  assessment: any;
  onNext: () => void;
  onPrevious: () => void;
}

// 根據企業背景生成個人化策略描述的函數
const getPersonalizedStrategyDescription = (
  strategyType: string, 
  industry: string, 
  companySize: string,
  categoryName: string,
  categoryType: 'risk' | 'opportunity'
) => {
  const industryMap: {[key: string]: string} = {
    'manufacturing': '製造業',
    'service': '服務業',
    'technology': '科技業',
    'finance': '金融業',
    'retail': '零售業'
  };

  const sizeMap: {[key: string]: string} = {
    'large': '大型',
    'medium': '中型',
    'small': '小型'
  };

  const industryName = industryMap[industry] || industry;
  const sizeName = sizeMap[companySize] || companySize;

  if (categoryType === 'risk') {
    switch(strategyType) {
      case 'mitigate':
        return `針對${industryName}${sizeName}企業，建議採取積極的預防措施，如導入新技術、改善作業流程或建立監控系統，以降低${categoryName}發生的可能性與衝擊程度。`;
      case 'transfer':
        return `考量${sizeName}企業資源限制，可透過購買相關保險、外包專業服務或與合作夥伴分攤風險的方式，將${categoryName}的潛在損失轉移給第三方承擔。`;
      case 'accept':
        return `基於${industryName}特性與成本效益考量，企業選擇承認並接受${categoryName}的存在，同時建立應變計畫與準備金，以因應風險發生時的後果。`;
      case 'control':
        return `建立完善的內控制度與定期監測機制，透過標準作業程序、員工訓練與定期稽核，持續監控並管理${categoryName}的發展趨勢與影響範圍。`;
      default:
        return '請選擇適合的風險管理策略';
    }
  } else {
    switch(strategyType) {
      case 'explore':
        return `針對${industryName}市場特性，建議先進行市場調研與可行性分析，評估${categoryName}的潛在價值與實現條件，為後續投入做好充分準備。`;
      case 'build':
        return `依據${sizeName}企業現況，逐步建立相關能力與資源基礎，包含人才培育、技術開發與組織調整，為把握${categoryName}做好內部準備。`;
      case 'transform':
        return `考量${industryName}轉型趨勢，建議調整現有營運模式或開發新的服務產品，透過組織變革與流程再造來充分利用${categoryName}的價值。`;
      case 'collaborate':
        return `善用${sizeName}企業靈活性，主動尋求與業界夥伴、研究機構或政府部門的合作機會，透過策略聯盟共同開發${categoryName}的市場潛力。`;
      case 'invest':
        return `基於${categoryName}的長期價值，建議企業投入必要的資金與資源，包含設備更新、系統建置與人力擴充，以實現機會的最大效益。`;
      default:
        return '請選擇適合的機會把握策略';
    }
  }
};

// 基本策略選項定義
const RISK_STRATEGIES = [
  { value: 'mitigate', label: '減緩 (Mitigate)' },
  { value: 'transfer', label: '轉移 (Transfer)' },
  { value: 'accept', label: '接受 (Accept)' },  
  { value: 'control', label: '控制 (Control)' },
];

const OPPORTUNITY_STRATEGIES = [
  { value: 'explore', label: '探索 (Explore)' },
  { value: 'build', label: '建設 (Build)' },
  { value: 'transform', label: '轉換 (Transform)' },
  { value: 'collaborate', label: '合作 (Collaborate)' },
  { value: 'invest', label: '投入 (Invest)' },
];

const TCFDStage3: React.FC<TCFDStage3Props> = ({ 
  assessment, 
  onNext, 
  onPrevious 
}) => {
  const { riskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment?.id);
  const { scenarioEvaluations, saveScenarioEvaluation } = useTCFDScenarioEvaluations(assessment?.id);
  
  const [scenarioDescriptions, setScenarioDescriptions] = useState<{[key: string]: string}>({});
  const [selectedStrategies, setSelectedStrategies] = useState<{[key: string]: string}>({});
  const [isGenerating, setIsGenerating] = useState<{[key: string]: boolean}>({});
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // 載入已完成的情境評估
  useEffect(() => {
    if (scenarioEvaluations && scenarioEvaluations.length > 0) {
      const descriptions: {[key: string]: string} = {};
      const strategies: {[key: string]: string} = {};
      const completed = new Set<string>();
      
      scenarioEvaluations.forEach(evaluation => {
        const key = evaluation.risk_opportunity_id;
        if (evaluation.scenario_description) {
          descriptions[key] = evaluation.scenario_description;
          completed.add(key);
        }
        if (evaluation.selected_strategy) {
          strategies[key] = evaluation.selected_strategy;
        }
      });
      
      setScenarioDescriptions(descriptions);
      setSelectedStrategies(strategies);
      setCompletedItems(completed);
    }
  }, [scenarioEvaluations]);

  // 生成情境描述
  const generateScenarioDescription = async (selection: any) => {
    const key = selection.id;
    setIsGenerating(prev => ({ ...prev, [key]: true }));
    
    try {
      console.log('正在生成情境描述:', selection);
      
      const { data, error } = await supabase.functions.invoke('tcfd-llm-generator', {
        body: {
          type: 'generate_scenario_description',
          category_type: selection.category_type,
          category_name: selection.category_name,
          subcategory_name: selection.subcategory_name,
          industry: assessment.industry,
          company_size: assessment.company_size,
          business_description: assessment.business_description,
          has_carbon_inventory: assessment.has_carbon_inventory,
          has_international_operations: assessment.has_international_operations,
          annual_revenue_range: assessment.annual_revenue_range,
          main_emission_source: assessment.main_emission_source
        }
      });

      if (error) throw error;

      const scenarioDescription = data.scenario_description;
      
      // 更新本地狀態
      setScenarioDescriptions(prev => ({
        ...prev,
        [key]: scenarioDescription
      }));
      
      setCompletedItems(prev => new Set([...prev, key]));
      
      // 保存到資料庫
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: selection.id,
        scenario_description: scenarioDescription,
        scenario_generated_by_llm: true,
        is_demo_data: assessment.is_demo_data || false,
      });
      
      toast.success(`${selection.category_name}的情境描述已生成！`);
      
    } catch (error: any) {
      console.error('生成情境描述時發生錯誤:', error);
      toast.error(`生成失敗: ${error.message}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, [key]: false }));
    }
  };

  // 處理策略選擇
  const handleStrategySelection = async (selectionId: string, strategyValue: string) => {
    setSelectedStrategies(prev => ({
      ...prev,
      [selectionId]: strategyValue
    }));

    try {
      // 找到對應的情境評估
      const existingEvaluation = scenarioEvaluations.find(
        evaluation => evaluation.risk_opportunity_id === selectionId
      );

      if (existingEvaluation) {
        // 更新現有評估
        await saveScenarioEvaluation({
          ...existingEvaluation,
          selected_strategy: strategyValue,
          strategy_type: strategyValue as any,
        });
      } else {
        // 創建新評估（如果情境描述還未生成）
        await saveScenarioEvaluation({
          assessment_id: assessment.id,
          risk_opportunity_id: selectionId,
          scenario_description: '',
          selected_strategy: strategyValue,
          strategy_type: strategyValue as any,
          scenario_generated_by_llm: false,
          is_demo_data: assessment.is_demo_data || false,
        });
      }

      toast.success('策略選擇已保存！');
    } catch (error: any) {
      console.error('保存策略選擇時發生錯誤:', error);
      toast.error(`保存失敗: ${error.message}`);
    }
  };

  // 檢查是否所有項目都已完成
  const allItemsCompleted = riskOpportunitySelections?.every(selection => 
    completedItems.has(selection.id) && selectedStrategies[selection.id]
  );

  if (!riskOpportunitySelections || riskOpportunitySelections.length === 0) {
    return (
      <div className="text-center py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            請先返回第二階段選擇風險與機會項目
          </AlertDescription>
        </Alert>
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={onPrevious}>
            返回
          </Button>
          <Button onClick={onNext} disabled>
            下一步
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>情境評估與策略選擇</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            系統將為您選擇的風險與機會項目生成貼近企業現況的情境描述，並請您選擇相應的策略。
          </p>
        </CardContent>
      </Card>

      {riskOpportunitySelections.map((selection) => {
        const key = selection.id;
        const scenarioDescription = scenarioDescriptions[key];
        const selectedStrategy = selectedStrategies[key];
        const isCompleted = completedItems.has(key);
        const isGeneratingItem = isGenerating[key];
        const strategies = selection.category_type === 'risk' ? RISK_STRATEGIES : OPPORTUNITY_STRATEGIES;
        
        return (
          <Card key={key} className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selection.category_name} - {selection.subcategory_name}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selection.category_type === 'risk' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {selection.category_type === 'risk' ? '風險' : '機會'}
                  </span>
                  {isCompleted && selectedStrategy && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">已完成</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={() => generateScenarioDescription(selection)}
                disabled={isGeneratingItem}
                variant={isCompleted ? "outline" : "default"}
              >
                {isGeneratingItem ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  isCompleted ? "重新生成" : "生成情境"
                )}
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {scenarioDescription && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">情境描述</Label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {scenarioDescription}
                    </p>
                  </div>
                </div>
              )}
              
              {scenarioDescription && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    請選擇策略方針
                  </Label>
                  <RadioGroup
                    value={selectedStrategy || ''}
                    onValueChange={(value) => handleStrategySelection(key, value)}
                    className="space-y-3"
                  >
                    {strategies.map((strategy) => {
                      const personalizedDescription = getPersonalizedStrategyDescription(
                        strategy.value,
                        assessment.industry,
                        assessment.company_size,
                        selection.category_name,
                        selection.category_type
                      );
                      
                      return (
                        <div key={strategy.value} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50">
                          <RadioGroupItem value={strategy.value} id={`${key}-${strategy.value}`} className="mt-1" />
                          <div className="flex-1">
                            <Label 
                              htmlFor={`${key}-${strategy.value}`}
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {strategy.label}
                            </Label>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {personalizedDescription}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          返回
        </Button>
        <Button 
          onClick={onNext}
          disabled={!allItemsCompleted}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage3;
