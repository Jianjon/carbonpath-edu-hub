
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
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadRiskOpportunitySelections();
    loadScenarioEvaluations();
  }, []);

  const handleRunSimulation = async () => {
    setIsGenerating(true);
    
    try {
      const selectedItems = riskOpportunitySelections.filter(item => item.selected);
      
      for (const item of selectedItems) {
        console.log('Processing item:', item);
        
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
      
      toast.success('LLM 模擬完成');
    } catch (error) {
      console.error('LLM 模擬失敗:', error);
      toast.error('模擬失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">第三階段：LLM 情境評估</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          使用 AI 技術對選擇的風險與機會項目進行數據模擬
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LLM 數據模擬</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            已選擇 {riskOpportunitySelections.filter(item => item.selected).length} 個風險/機會項目進行模擬
          </div>
          
          <Button
            onClick={handleRunSimulation}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                模擬中...
              </>
            ) : (
              '開始 LLM 模擬'
            )}
          </Button>

          <Button
            onClick={onComplete}
            variant="outline"
            className="w-full"
          >
            完成階段
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage3;
