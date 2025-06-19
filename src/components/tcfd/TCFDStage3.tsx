
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections, loadRiskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment.id);
  const { 
    scenarioEvaluations,
    generateComprehensiveScenarioAnalysis,
    saveScenarioEvaluation,
    loadScenarioEvaluations
  } = useTCFDScenarioEvaluations(assessment.id);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRiskOpportunitySelections();
    loadScenarioEvaluations();
  }, []);

  const handleCompleteStage = async () => {
    setIsProcessing(true);
    
    try {
      const selectedItems = riskOpportunitySelections.filter(item => item.selected);
      
      // 檢查是否已有足夠的情境評估資料
      const existingEvaluations = scenarioEvaluations.filter(eval => 
        selectedItems.some(item => item.id === eval.risk_opportunity_id)
      );

      // 只對沒有資料的項目進行 LLM 生成（通常是用戶自訂情境）
      const itemsNeedingGeneration = selectedItems.filter(item => 
        !existingEvaluations.some(eval => eval.risk_opportunity_id === item.id)
      );

      if (itemsNeedingGeneration.length > 0) {
        console.log('需要 LLM 生成的項目:', itemsNeedingGeneration);
        
        for (const item of itemsNeedingGeneration) {
          const response = await generateComprehensiveScenarioAnalysis(
            item.category_type,
            item.category_name,
            item.subcategory_name || '',
            `Generated scenario for ${item.category_name}`,
            5,
            assessment.industry,
            assessment.company_size,
            assessment.business_description || '',
            {}
          );

          await saveScenarioEvaluation({
            assessment_id: assessment.id,
            risk_opportunity_id: item.id,
            category_name: item.category_name,
            subcategory_name: item.subcategory_name || '',
            scenario_description: `Generated scenario for ${item.category_name}`,
            user_score: 5,
            likelihood_score: 5,
            llm_response: JSON.stringify(response),
            scenario_generated_by_llm: true
          });
        }
      }

      // 準備第三階段完成的資料，包含資料庫中的現有資料
      const stage3Results = {
        assessment: assessment,
        scenarios: selectedItems.map(item => {
          const existingEval = scenarioEvaluations.find(eval => eval.risk_opportunity_id === item.id);
          return {
            categoryName: item.category_name,
            categoryType: item.category_type,
            subcategoryName: item.subcategory_name || '',
            scenarioDescription: existingEval?.scenario_description || `${item.subcategory_name}的情境分析`,
            userScore: existingEval?.user_score || 5,
            llmResponse: existingEval?.llm_response || '{}',
            userNotes: ''
          };
        })
      };

      // 儲存到 sessionStorage 供第四階段使用
      sessionStorage.setItem('tcfd-stage3-results', JSON.stringify(stage3Results));
      console.log('第三階段完成，資料已儲存:', stage3Results);
      
      toast.success('第三階段完成');
      onComplete();
    } catch (error) {
      console.error('第三階段處理失敗:', error);
      toast.error('處理失敗');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">第三階段：情境資料整理</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          整理已選擇的風險與機會項目的情境資料
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>資料狀態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            已選擇 {riskOpportunitySelections.filter(item => item.selected).length} 個風險/機會項目
          </div>
          <div className="text-sm text-gray-600">
            已有情境資料 {scenarioEvaluations.length} 筆
          </div>
          
          <Button
            onClick={handleCompleteStage}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                處理中...
              </>
            ) : (
              '完成第三階段'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage3;
