
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections, loadRiskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment.id);
  const { 
    scenarioEvaluations,
    generateScenarioWithLLM,
    saveScenarioEvaluation,
    loadScenarioEvaluations
  } = useTCFDScenarioEvaluations(assessment.id);
  
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRiskOpportunitySelections();
    loadScenarioEvaluations();
  }, []);

  useEffect(() => {
    // 載入現有的情境描述
    if (scenarioEvaluations.length > 0) {
      setScenarioDescription(scenarioEvaluations[0].scenario_description || '');
    }
  }, [scenarioEvaluations]);

  const handleGenerateScenario = async () => {
    const selectedItems = riskOpportunitySelections.filter(item => item.selected);
    if (selectedItems.length === 0) {
      toast.error('請先選擇風險或機會項目');
      return;
    }

    setIsGenerating(true);
    
    try {
      const item = selectedItems[0]; // 使用第一個選擇的項目
      const response = await generateScenarioWithLLM(
        item.category_type as 'risk' | 'opportunity',
        item.category_name,
        item.subcategory_name || '',
        assessment.industry
      );

      setScenarioDescription(response.scenario_description);
      toast.success('情境描述已生成');
    } catch (error) {
      console.error('生成情境描述失敗:', error);
      toast.error('生成情境描述失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteStage = async () => {
    if (!scenarioDescription.trim()) {
      toast.error('請先生成或輸入情境描述');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedItems = riskOpportunitySelections.filter(item => item.selected);
      
      // 儲存情境評估
      for (const item of selectedItems) {
        await saveScenarioEvaluation({
          assessment_id: assessment.id,
          risk_opportunity_id: item.id,
          category_name: item.category_name,
          subcategory_name: item.subcategory_name || '',
          scenario_description: scenarioDescription,
          user_score: 5,
          likelihood_score: 5,
          llm_response: JSON.stringify({}),
          scenario_generated_by_llm: true
        });
      }

      // 準備第四階段資料
      const stage3Results = {
        assessment: assessment,
        scenarios: selectedItems.map(item => ({
          categoryName: item.category_name,
          categoryType: item.category_type,
          subcategoryName: item.subcategory_name || '',
          scenarioDescription: scenarioDescription,
          userScore: 5,
          userNotes: ''
        }))
      };

      sessionStorage.setItem('tcfd-stage3-results', JSON.stringify(stage3Results));
      console.log('第三階段完成，資料已儲存:', stage3Results);
      
      toast.success('第三階段完成');
      onComplete();
    } catch (error) {
      console.error('第三階段處理失敗:', error);
      toast.error('處理失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItems = riskOpportunitySelections.filter(item => item.selected);

  if (selectedItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium mb-2">無選擇項目</h3>
            <p className="text-gray-600">請先在第二階段選擇風險或機會項目</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">第三階段：情境分析</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          針對選定的風險/機會項目進行情境分析
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>情境描述</span>
            <Button
              onClick={handleGenerateScenario}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  生成情境描述
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="scenario">情境內容</Label>
            <Textarea
              id="scenario"
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
              placeholder="點擊「生成情境描述」按鈕以產生具體的情境內容，或手動輸入..."
              rows={8}
              className="text-sm"
            />
          </div>

          {selectedItems.length > 0 && (
            <div className="text-sm text-gray-600 space-y-2">
              <div><strong>已選擇項目：</strong></div>
              {selectedItems.map((item, index) => (
                <div key={item.id} className="ml-4">
                  {index + 1}. {item.category_name} - {item.subcategory_name}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center pt-6">
            <Button
              onClick={handleCompleteStage}
              disabled={isSubmitting || !scenarioDescription.trim()}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  儲存中...
                </>
              ) : (
                '完成第三階段'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage3;
