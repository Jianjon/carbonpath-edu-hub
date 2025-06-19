import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TCFDAssessment, TCFD_RISK_CATEGORIES, TCFD_OPPORTUNITY_CATEGORIES } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { AlertTriangle, TrendingUp, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TCFDStage2Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage2 = ({ assessment, onComplete }: TCFDStage2Props) => {
  const { saveRiskOpportunitySelections, riskOpportunitySelections, loading } = useTCFDAssessment(assessment.id);
  const [selectedScenarios, setSelectedScenarios] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [customScenarios, setCustomScenarios] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 載入已選擇的情境
    const selectedItems = new Set<string>();
    
    riskOpportunitySelections.forEach(selection => {
      if (selection.selected && selection.subcategory_name) {
        selectedItems.add(`${selection.category_name}-${selection.subcategory_name}`);
      }
    });
    
    setSelectedScenarios(selectedItems);
  }, [riskOpportunitySelections]);

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleScenarioChange = (categoryName: string, scenarioId: string, checked: boolean) => {
    const key = `${categoryName}-${scenarioId}`;
    setSelectedScenarios(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
      return newSet;
    });
  };

  const handleCustomScenarioChange = (categoryName: string, value: string) => {
    setCustomScenarios(prev => ({
      ...prev,
      [categoryName]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selections = [];
      
      // 處理預設情境選擇
      for (const key of selectedScenarios) {
        const [categoryName, scenarioId] = key.split('-');
        
        const allCategories = [...TCFD_RISK_CATEGORIES, ...TCFD_OPPORTUNITY_CATEGORIES];
        const category = allCategories.find(cat => cat.name === categoryName);
        const scenario = category?.scenarios?.find(s => s.id === scenarioId);
        
        selections.push({
          assessment_id: assessment.id,
          category_type: category?.type as 'risk' | 'opportunity',
          category_name: categoryName,
          subcategory_name: scenario?.title || scenarioId,
          selected: true,
        });
      }
      
      // 處理自訂情境
      for (const [categoryName, customText] of Object.entries(customScenarios)) {
        if (customText && customText.trim().length > 0) {
          const allCategories = [...TCFD_RISK_CATEGORIES, ...TCFD_OPPORTUNITY_CATEGORIES];
          const category = allCategories.find(cat => cat.name === categoryName);
          
          selections.push({
            assessment_id: assessment.id,
            category_type: category?.type as 'risk' | 'opportunity',
            category_name: categoryName,
            subcategory_name: `自訂情境：${customText.substring(0, 30)}...`,
            selected: true,
            custom_scenario_description: customText,
          });
        }
      }

      await saveRiskOpportunitySelections(selections);
      onComplete();
    } catch (error) {
      console.error('Error saving selections:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategoryCard = (categories: any[], type: 'risk' | 'opportunity') => {
    const icon = type === 'risk' ? AlertTriangle : TrendingUp;
    const IconComponent = icon;
    const colorClass = type === 'risk' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50';
    const titleColor = type === 'risk' ? 'text-red-700' : 'text-green-700';

    return (
      <Card className={`${colorClass} border-2`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${titleColor}`}>
            <IconComponent className="h-6 w-6" />
            <span>{type === 'risk' ? '氣候相關風險' : '氣候相關機會'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg">
              <Collapsible
                open={expandedCategories.has(category.id)}
                onOpenChange={() => handleCategoryToggle(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      {category.scenarios && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {category.scenarios.length} 個具體情境
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-3 border-t bg-white">
                    <div className="pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        請選擇與您企業相關的具體情境：
                      </p>
                      {category.scenarios?.map((scenario: any) => (
                        <div key={scenario.id} className="space-y-2 p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`${category.id}-${scenario.id}`}
                              checked={selectedScenarios.has(`${category.name}-${scenario.id}`)}
                              onCheckedChange={(checked) => 
                                handleScenarioChange(category.name, scenario.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label 
                                htmlFor={`${category.id}-${scenario.id}`}
                                className="text-sm font-medium text-gray-900 cursor-pointer block"
                              >
                                📌 {scenario.title}
                              </label>
                              <p className="text-xs text-gray-600 mt-1">
                                {scenario.description}
                              </p>
                              <div className="mt-2 p-2 bg-blue-50 border-l-2 border-blue-300 rounded">
                                <p className="text-xs text-blue-800">
                                  💡 {scenario.hint}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* 自訂情境輸入框 */}
                      <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <Label htmlFor={`custom-${category.id}`} className="text-sm font-medium text-gray-700">
                          或者，描述您企業特有的{type === 'risk' ? '風險' : '機會'}情境：
                        </Label>
                        <Textarea
                          id={`custom-${category.id}`}
                          placeholder={`請描述您在「${category.name}」方面遇到的具體${type === 'risk' ? '風險' : '機會'}情境...（可選填）`}
                          value={customScenarios[category.name] || ''}
                          onChange={(e) => handleCustomScenarioChange(category.name, e.target.value)}
                          className="mt-2"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          此欄位為選填，您可以描述預設選項未涵蓋的特殊情境
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const hasSelections = selectedScenarios.size > 0 || Object.values(customScenarios).some(text => text.trim().length > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">第二階段：風險與機會情境選擇</CardTitle>
          <p className="text-gray-600 text-center">
            從抽象分類到具體情境 - 請選擇與您企業最相關的氣候風險與機會情境
          </p>
        </CardHeader>
      </Card>

      {/* 產業資訊提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="secondary">{assessment.industry}</Badge>
            <Badge variant="outline">{assessment.company_size}</Badge>
            {assessment.has_carbon_inventory && (
              <Badge className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                已完成碳盤查
              </Badge>
            )}
          </div>
          <p className="text-sm text-blue-800">
            💡 <strong>操作說明：</strong>點擊各類別可展開具體情境選項，每個情境都包含背景說明和評估提示。您也可以在自訂欄位中描述特殊情境。
          </p>
        </CardContent>
      </Card>

      {/* 風險與機會選擇 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderCategoryCard(TCFD_RISK_CATEGORIES, 'risk')}
        {renderCategoryCard(TCFD_OPPORTUNITY_CATEGORIES, 'opportunity')}
      </div>

      {/* 選擇摘要 */}
      {hasSelections && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">您的選擇摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  已選擇的具體情境：（共 {selectedScenarios.size} 項預設情境）
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {Array.from(selectedScenarios).map(key => {
                    const [categoryName, scenarioId] = key.split('-');
                    const allCategories = [...TCFD_RISK_CATEGORIES, ...TCFD_OPPORTUNITY_CATEGORIES];
                    const category = allCategories.find(cat => cat.name === categoryName);
                    const scenario = category?.scenarios?.find(s => s.id === scenarioId);
                    
                    return (
                      <div key={key} className="p-2 bg-white border rounded text-sm">
                        <Badge 
                          variant={category?.type === 'risk' ? 'destructive' : 'default'} 
                          className="mr-2 text-xs"
                        >
                          {categoryName}
                        </Badge>
                        {scenario?.title}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* 自訂情境摘要 */}
              {Object.entries(customScenarios).some(([_, text]) => text.trim().length > 0) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">自訂情境：</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(customScenarios).map(([categoryName, text]) => {
                      if (!text.trim()) return null;
                      const allCategories = [...TCFD_RISK_CATEGORIES, ...TCFD_OPPORTUNITY_CATEGORIES];
                      const category = allCategories.find(cat => cat.name === categoryName);
                      
                      return (
                        <div key={categoryName} className="p-3 bg-white border rounded text-sm">
                          <Badge 
                            variant={category?.type === 'risk' ? 'destructive' : 'default'} 
                            className="mr-2 text-xs"
                          >
                            {categoryName}
                          </Badge>
                          <span className="font-medium">自訂情境：</span>
                          <p className="mt-1 text-gray-600">{text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 提交按鈕 */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={!hasSelections || isSubmitting || loading}
          size="lg"
          className="px-8"
        >
          {isSubmitting ? '儲存中...' : `進入情境評估階段（已選 ${selectedScenarios.size} 項）`}
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage2;
