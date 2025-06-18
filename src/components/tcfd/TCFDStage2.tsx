
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment, TCFD_RISK_CATEGORIES, TCFD_OPPORTUNITY_CATEGORIES } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { AlertTriangle, TrendingUp, Check } from 'lucide-react';

interface TCFDStage2Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage2 = ({ assessment, onComplete }: TCFDStage2Props) => {
  const { saveRiskOpportunitySelections, riskOpportunitySelections, loading } = useTCFDAssessment(assessment.id);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 載入已選擇的項目
    const selectedCats = new Set<string>();
    const selectedSubcats = new Set<string>();
    
    riskOpportunitySelections.forEach(selection => {
      if (selection.selected) {
        selectedCats.add(selection.category_name);
        if (selection.subcategory_name) {
          selectedSubcats.add(`${selection.category_name}-${selection.subcategory_name}`);
        }
      }
    });
    
    setSelectedCategories(selectedCats);
    setSelectedSubcategories(selectedSubcats);
  }, [riskOpportunitySelections]);

  const handleCategoryChange = (categoryName: string, checked: boolean) => {
    const newSelected = new Set(selectedCategories);
    if (checked) {
      newSelected.add(categoryName);
    } else {
      newSelected.delete(categoryName);
      // 同時取消該類別下的所有子類別
      const categoryData = [...TCFD_RISK_CATEGORIES, ...TCFD_OPPORTUNITY_CATEGORIES]
        .find(cat => cat.name === categoryName);
      if (categoryData?.subcategories) {
        categoryData.subcategories.forEach(sub => {
          selectedSubcategories.delete(`${categoryName}-${sub}`);
        });
      }
    }
    setSelectedCategories(newSelected);
  };

  const handleSubcategoryChange = (categoryName: string, subcategoryName: string, checked: boolean) => {
    const key = `${categoryName}-${subcategoryName}`;
    const newSelected = new Set(selectedSubcategories);
    if (checked) {
      newSelected.add(key);
      // 自動勾選主類別
      setSelectedCategories(prev => new Set(prev).add(categoryName));
    } else {
      newSelected.delete(key);
    }
    setSelectedSubcategories(newSelected);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const selections = [];
      
      // 處理主類別選擇
      selectedCategories.forEach(categoryName => {
        const categoryData = [...TCFD_RISK_CATEGORIES, ...TCFD_OPPORTUNITY_CATEGORIES]
          .find(cat => cat.name === categoryName);
        
        if (categoryData) {
          selections.push({
            assessment_id: assessment.id,
            category_type: categoryData.type,
            category_name: categoryName,
            subcategory_name: null,
            selected: true,
          });
        }
      });

      // 處理子類別選擇
      selectedSubcategories.forEach(key => {
        const [categoryName, subcategoryName] = key.split('-');
        const categoryData = [...TCFD_RISK_CATEGORIES, ...TCFD_OPPORTUNITY_CATEGORIES]
          .find(cat => cat.name === categoryName);
        
        if (categoryData) {
          selections.push({
            assessment_id: assessment.id,
            category_type: categoryData.type,
            category_name: categoryName,
            subcategory_name: subcategoryName,
            selected: true,
          });
        }
      });

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
        <CardContent className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.has(category.name)}
                  onCheckedChange={(checked) => handleCategoryChange(category.name, !!checked)}
                />
                <div className="flex-1">
                  <label htmlFor={category.id} className="font-medium text-gray-900 cursor-pointer">
                    {category.name}
                  </label>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              
              {category.subcategories && selectedCategories.has(category.name) && (
                <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-2">
                  {category.subcategories.map((subcategory: string) => (
                    <div key={subcategory} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${category.id}-${subcategory}`}
                        checked={selectedSubcategories.has(`${category.name}-${subcategory}`)}
                        onCheckedChange={(checked) => 
                          handleSubcategoryChange(category.name, subcategory, !!checked)
                        }
                      />
                      <label 
                        htmlFor={`${category.id}-${subcategory}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {subcategory}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const hasSelections = selectedCategories.size > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">第二階段：風險與機會類別選擇</CardTitle>
          <p className="text-gray-600 text-center">
            根據 TCFD 官方架構，請選擇與您企業最相關的氣候風險與機會類別
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
            建議根據您的產業特性和企業規模，重點關注最可能影響業務營運的風險與機會類別。
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
                <h4 className="font-medium text-gray-900 mb-2">已選擇的主要類別：</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedCategories).map(category => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  已選擇的子類別：（共 {selectedSubcategories.size} 項）
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedSubcategories).map(key => {
                    const [, subcategory] = key.split('-');
                    return (
                      <Badge key={key} variant="outline" className="text-xs">
                        {subcategory}
                      </Badge>
                    );
                  })}
                </div>
              </div>
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
          {isSubmitting ? '儲存中...' : '進入情境評估階段'}
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage2;
