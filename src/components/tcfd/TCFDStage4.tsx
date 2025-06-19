
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { Target, DollarSign, Loader2, Sparkles } from 'lucide-react';
import FinancialAnalysisReport from './FinancialAnalysisReport';
import { generateFinancialAnalysis, FinancialAnalysisInput } from '@/services/tcfd/financialAnalysisService';

interface TCFDStage4Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

interface SelectedStrategyData {
  scenarioKey: string;
  strategy: string;
  analysis: any;
  notes: string;
}

interface Stage3Results {
  assessment: TCFDAssessment;
  strategySelections: SelectedStrategyData[];
}

const TCFDStage4 = ({ assessment, onComplete }: TCFDStage4Props) => {
  const {
    saveStrategyAnalysis,
    loading
  } = useTCFDAssessment(assessment.id);

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

  // 生成 UUID 的輔助函數
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  useEffect(() => {
    // 從 sessionStorage 讀取第三階段的結果
    const storedResults = sessionStorage.getItem('tcfd-stage3-results');
    if (storedResults) {
      try {
        const results: Stage3Results = JSON.parse(storedResults);
        setStage3Results(results);
        console.log('第四階段載入第三階段結果:', results);
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

      for (const selection of stage3Results.strategySelections) {
        const modifications = userModifications[selection.scenarioKey];
        const scenarioEvaluationId = generateUUID(); // 生成真正的 UUID

        await saveStrategyAnalysis({
          assessment_id: assessment.id,
          scenario_evaluation_id: scenarioEvaluationId,
          detailed_description: selection.analysis?.scenario_description || '',
          financial_impact_pnl: '',
          financial_impact_cashflow: '',
          financial_impact_balance_sheet: '',
          strategy_avoid: '',
          strategy_accept: '',
          strategy_transfer: '',
          strategy_mitigate: '',
          selected_strategy: selection.strategy,
          user_modifications: modifications,
          generated_by_llm: true,
        });
      }
      
      // 將第四階段結果儲存到 sessionStorage 供第五階段使用
      sessionStorage.setItem('tcfd-stage4-results', JSON.stringify(stage4Results));
      console.log('第四階段結果已儲存:', stage4Results);
      
      onComplete();
    } catch (error) {
      console.error('Error saving strategy analysis:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 生成財務分析報告
  const generateFinancialAnalysisForSelection = (selection: SelectedStrategyData) => {
    if (!selection.strategy || !selection.analysis) return null;

    // 從情境描述中判斷風險或機會類型
    const isRisk = selection.analysis.risk_strategies ? true : false;
    
    // 提取類別資訊
    const [categoryName, subcategoryName] = selection.scenarioKey.split('-');

    const financialAnalysisInput: FinancialAnalysisInput = {
      riskOrOpportunityType: isRisk ? 'risk' : 'opportunity',
      categoryName: categoryName,
      subcategoryName: subcategoryName,
      scenarioDescription: selection.analysis.scenario_description,
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
    const strategyName = strategyMapping[selection.strategy] || selection.strategy;

    return (
      <FinancialAnalysisReport
        analysis={financialAnalysis}
        scenarioTitle={subcategoryName}
        strategyType={strategyName}
        isRisk={isRisk}
      />
    );
  };

  if (!stage3Results) {
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
          const [categoryName, subcategoryName] = selection.scenarioKey.split('-');
          const strategyName = strategyMapping[selection.strategy] || selection.strategy;
          const isRisk = selection.analysis.risk_strategies ? true : false;

          return (
            <Card key={selection.scenarioKey} className="border-l-4 border-gray-400">
              <CardHeader className="bg-gray-50 border-b border-gray-100">
                <CardTitle className="text-lg text-gray-800">
                  組合分析 {index + 1}: {subcategoryName} × {strategyName}
                </CardTitle>
                <div className="flex space-x-2">
                  <Badge className="bg-gray-100 text-gray-800 border border-gray-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    財務影響分析
                  </Badge>
                  <Badge variant={isRisk ? "destructive" : "default"}>
                    {categoryName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 情境回顧 */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="font-medium mb-2 text-gray-800">情境描述</h4>
                  <p className="text-sm text-gray-700">{selection.analysis.scenario_description}</p>
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

                {/* 財務影響分析報告 */}
                {generateFinancialAnalysisForSelection(selection)}

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
