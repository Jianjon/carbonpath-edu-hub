
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TCFDAssessment } from '@/types/tcfd';
import { Target, DollarSign, Loader2, Sparkles, BarChart3, TrendingUp, Building, CheckCircle, Calculator, LinkIcon } from 'lucide-react';
import { generateFinancialAnalysis, FinancialAnalysisInput } from '@/services/tcfd/financialAnalysisService';

interface TCFDStage4Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

interface SelectedStrategyData {
  scenarioKey: string;
  riskOpportunityId: string;
  strategy: string;
  scenarioDescription: string;
  categoryType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  notes: string;
}

interface Stage3Results {
  assessment: TCFDAssessment;
  strategySelections: SelectedStrategyData[];
}

const TCFDStage4 = ({ assessment, onComplete }: TCFDStage4Props) => {
  const [stage3Results, setStage3Results] = useState<Stage3Results | null>(null);
  const [userModifications, setUserModifications] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // 策略類型映射
  const strategyMapping: Record<string, string> = {
    'mitigate': '減緩策略',
    'transfer': '轉移策略',
    'accept': '接受策略',
    'control': '控制策略',
    'evaluate_explore': '評估探索',
    'capability_building': '能力建設',
    'business_transformation': '商業轉換',
    'cooperation_participation': '合作參與',
    'aggressive_investment': '積極投入'
  };

  useEffect(() => {
    // 從 sessionStorage 讀取第三階段的結果
    const storedResults = sessionStorage.getItem('tcfd-stage3-results');
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        console.log('第四階段載入第三階段結果:', results);
        setStage3Results(results);
      } catch (error) {
        console.error('解析第三階段結果失敗:', error);
      }
    }
  }, []);

  const handleModificationChange = (scenarioKey: string, modification: string) => {
    setUserModifications(prev => ({
      ...prev,
      [scenarioKey]: modification
    }));
  };

  const handleSubmit = async () => {
    if (!stage3Results) {
      console.error('沒有第三階段的資料');
      return;
    }

    setIsSubmitting(true);
    try {
      // 準備要儲存到 sessionStorage 的第四階段結果
      const stage4Results = {
        assessment: assessment,
        strategySelections: stage3Results.strategySelections,
        userModifications: userModifications,
        completedAt: new Date().toISOString()
      };

      // 將第四階段結果儲存到 sessionStorage
      sessionStorage.setItem('tcfd-stage4-results', JSON.stringify(stage4Results));
      console.log('第四階段結果已儲存:', stage4Results);
      
      // 完成第四階段，進入第五階段
      onComplete();
    } catch (error) {
      console.error('Error saving stage 4 results:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 生成財務分析報告組件
  const FinancialAnalysisGrid = ({ selection }: { selection: SelectedStrategyData }) => {
    const isRisk = selection.categoryType === 'risk';
    
    const financialAnalysisInput: FinancialAnalysisInput = {
      riskOrOpportunityType: selection.categoryType,
      categoryName: selection.categoryName,
      subcategoryName: selection.subcategoryName,
      scenarioDescription: selection.scenarioDescription,
      selectedStrategy: selection.strategy,
      companyProfile: {
        industry: assessment.industry,
        size: assessment.company_size,
        hasInternationalOperations: assessment.has_international_operations,
        hasCarbonInventory: assessment.has_carbon_inventory,
        mainEmissionSource: assessment.main_emission_source
      }
    };

    const financialAnalysis = generateFinancialAnalysis(financialAnalysisInput);

    // 6個分析類別的配置
    const analysisCategories = [
      {
        title: '損益表影響分析',
        content: financialAnalysis.profitLossAnalysis,
        icon: BarChart3,
        color: 'bg-blue-50 border-blue-200',
        iconColor: 'text-blue-600'
      },
      {
        title: '現金流影響分析',
        content: financialAnalysis.cashFlowAnalysis,
        icon: TrendingUp,
        color: 'bg-green-50 border-green-200',
        iconColor: 'text-green-600'
      },
      {
        title: '資產負債表影響分析',
        content: financialAnalysis.balanceSheetAnalysis,
        icon: Building,
        color: 'bg-purple-50 border-purple-200',
        iconColor: 'text-purple-600'
      },
      {
        title: '策略可行性與補充說明',
        content: financialAnalysis.strategyFeasibilityAnalysis,
        icon: CheckCircle,
        color: 'bg-orange-50 border-orange-200',
        iconColor: 'text-orange-600'
      },
      {
        title: '分析建議方法',
        content: financialAnalysis.analysisMethodology,
        icon: Calculator,
        color: 'bg-teal-50 border-teal-200',
        iconColor: 'text-teal-600'
      },
      {
        title: '財務連結的計算方法建議',
        content: financialAnalysis.calculationMethodSuggestions,
        icon: LinkIcon,
        color: 'bg-red-50 border-red-200',
        iconColor: 'text-red-600'
      }
    ];

    return (
      <div className="mt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="h-5 w-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">財務影響分析與計算建議</h4>
        </div>
        
        {/* 3x2 網格佈局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {analysisCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className={`${category.color} border-2`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <IconComponent className={`h-4 w-4 ${category.iconColor}`} />
                    <span className="text-gray-800">{category.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-gray-700 leading-relaxed">
                    {category.content.length > 200 ? (
                      <div>
                        <p className="mb-2">{category.content.substring(0, 200)}...</p>
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800 text-xs">
                            展開完整內容
                          </summary>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="whitespace-pre-line">{category.content}</p>
                          </div>
                        </details>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line">{category.content}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* 分析說明 */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2 text-sm">分析說明</h5>
              <p className="text-xs text-gray-600 leading-relaxed">
                本分析基於 TCFD 財務影響分類邏輯，提供結構化的財務評估框架與計算方法建議。
                請企業結合實際營運資料，進行更深入的量化分析與情境模擬。計算公式僅供參考，實際應用時請依企業狀況調整。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!stage3Results || !stage3Results.strategySelections) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
              <Target className="h-8 w-8 text-gray-600" />
              <span>第四階段：財務影響分析與計算建議</span>
            </CardTitle>
            <p className="text-gray-600 text-center">
              針對每個氣候風險／機會情境與選定策略，進行結構化的財務影響分析與計算方法建議
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">載入策略選擇資料...</h3>
            <p className="text-gray-600">
              請確保已完成第三階段的策略選擇
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAnalysis = stage3Results.strategySelections.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <Target className="h-8 w-8 text-gray-600" />
            <span>第四階段：財務影響分析與計算建議</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            針對每個氣候風險／機會情境與選定策略，提供結構化的財務分析與計算方法建議
          </p>
          <div className="flex justify-center mt-2">
            <Badge variant="outline" className="text-gray-700">
              {getChineseText(assessment.company_size)} · {getChineseText(assessment.industry)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 進度指示 */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">財務分析進度</h3>
              <p className="text-sm text-gray-600">
                完成 {totalAnalysis} 個「風險／機會 × 策略」組合的財務分析與計算建議
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-700">
                {totalAnalysis}
              </div>
              <div className="text-xs text-gray-600">個組合分析</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 策略分析卡片 */}
      <div className="grid gap-8">
        {stage3Results.strategySelections.map((selection, index) => {
          const strategyName = strategyMapping[selection.strategy] || selection.strategy;
          const isRisk = selection.categoryType === 'risk';

          return (
            <Card key={selection.scenarioKey} className="border-l-4 border-gray-400">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-lg text-gray-800">
                  組合分析 {index + 1}: {selection.subcategoryName} × {strategyName}
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    財務影響分析
                  </Badge>
                  <Badge variant={isRisk ? "destructive" : "default"}>
                    {selection.categoryName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 情境回顧 */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="font-medium mb-2 text-gray-800">情境描述</h4>
                  <p className="text-sm text-gray-700">{selection.scenarioDescription}</p>
                </div>

                {/* 選擇的策略 */}
                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <h4 className="font-medium mb-2 text-blue-900">選定管理策略</h4>
                  <p className="text-sm text-blue-800">{strategyName}</p>
                  {selection.notes && (
                    <div className="mt-2">
                      <span className="text-xs text-blue-600 font-medium">策略備註：</span>
                      <p className="text-xs text-blue-700">{selection.notes}</p>
                    </div>
                  )}
                </div>

                {/* 財務影響分析報告 - 使用新的網格佈局 */}
                <FinancialAnalysisGrid selection={selection} />

                {/* 用戶修改意見 */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">補充意見或修改建議</h4>
                  <Textarea
                    placeholder="您可以在此補充對財務分析的修改意見、內部實際狀況或額外考量因素..."
                    value={userModifications[selection.scenarioKey] || ''}
                    onChange={(e) => handleModificationChange(selection.scenarioKey, e.target.value)}
                    rows={3}
                    className="border-gray-300 focus:border-gray-400"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 提交按鈕 */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="px-8 bg-gray-800 hover:bg-gray-700"
        >
          {isSubmitting ? '儲存分析中...' : '完成財務分析，進入報告生成'}
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage4;
