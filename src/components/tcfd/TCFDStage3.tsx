
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, Sparkles, Edit, Download } from 'lucide-react';
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
  
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRiskOpportunitySelections();
    loadScenarioEvaluations();
  }, []);

  useEffect(() => {
    // 選擇第一個已選擇的項目作為當前情境
    const selectedItems = riskOpportunitySelections.filter(item => item.selected);
    if (selectedItems.length > 0 && !currentScenario) {
      setCurrentScenario(selectedItems[0]);
      
      // 檢查是否已有現有的情境描述
      const existingEvaluation = scenarioEvaluations.find(
        eval => eval.risk_opportunity_id === selectedItems[0].id
      );
      if (existingEvaluation?.scenario_description) {
        setScenarioDescription(existingEvaluation.scenario_description);
      }
    }
  }, [riskOpportunitySelections, scenarioEvaluations]);

  const generateScenarioDescription = async () => {
    if (!currentScenario) return;

    setIsGenerating(true);
    try {
      // 這裡應該調用LLM生成情境描述
      const generatedDescription = `
基於${currentScenario.category_name}的${currentScenario.subcategory_name}情境，${assessment.industry}企業面臨以下具體挑戰：

【背景描述】
${currentScenario.category_type === 'risk' ? '氣候變遷' : '市場轉型'}帶來的${currentScenario.subcategory_name}影響正逐漸顯現，對${assessment.industry}產業造成結構性衝擊。

【業務影響】
企業營運模式需要調整以因應新的環境條件，包括供應鏈重組、技術升級投資，以及客戶需求變化的應對。

【風險壓力】
若未能及時調整策略，可能面臨營收下滑、成本上升，以及競爭力削弱的多重壓力。
      `.trim();

      setScenarioDescription(generatedDescription);
      toast.success('情境描述已生成');
    } catch (error) {
      console.error('生成情境描述失敗:', error);
      toast.error('生成情境描述失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComprehensiveAnalysis = async () => {
    if (!currentScenario || !scenarioDescription) {
      toast.error('請先生成情境描述');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await generateComprehensiveScenarioAnalysis(
        currentScenario.category_type as 'risk' | 'opportunity',
        currentScenario.category_name,
        currentScenario.subcategory_name || '',
        scenarioDescription,
        5, // 預設影響程度
        assessment.industry,
        assessment.company_size,
        assessment.business_description || '',
        { userInput }
      );

      setAnalysisResults(response);
      toast.success('綜合分析已完成');
    } catch (error) {
      console.error('綜合分析失敗:', error);
      toast.error('綜合分析失敗');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisResults = async () => {
    if (!currentScenario || !scenarioDescription) return;

    setIsSubmitting(true);
    try {
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: currentScenario.id,
        category_name: currentScenario.category_name,
        subcategory_name: currentScenario.subcategory_name || '',
        scenario_description: scenarioDescription,
        user_score: 5,
        likelihood_score: 5,
        llm_response: JSON.stringify(analysisResults || {}),
        scenario_generated_by_llm: true
      });

      // 準備第四階段資料
      const stage3Results = {
        assessment: assessment,
        scenarios: [{
          categoryName: currentScenario.category_name,
          categoryType: currentScenario.category_type,
          subcategoryName: currentScenario.subcategory_name || '',
          scenarioDescription: scenarioDescription,
          analysisResults: analysisResults,
          userInput: userInput,
          userScore: 5
        }]
      };

      sessionStorage.setItem('tcfd-stage3-results', JSON.stringify(stage3Results));
      console.log('第三階段完成，資料已儲存:', stage3Results);
      
      toast.success('分析結果已儲存');
      onComplete();
    } catch (error) {
      console.error('儲存失敗:', error);
      toast.error('儲存失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportDraft = () => {
    if (!analysisResults) {
      toast.error('請先完成綜合分析');
      return;
    }

    const draftContent = `
情境分析草稿

情境描述：
${scenarioDescription}

量化分析結果：
${JSON.stringify(analysisResults, null, 2)}

企業補充說明：
${userInput}
    `;

    const blob = new Blob([draftContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `情境分析草稿_${currentScenario?.subcategory_name || '未命名'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('草稿已匯出');
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 標題區域 */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">第三階段：情境分析</h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          根據第二階段所選擇的風險與機會類型，我們已為您列出企業可能面臨的具體情境。
          在本階段，系統將針對每一項風險或機會，逐一生成具體的情境敘述與財務影響分析內容，
          協助企業預先評估影響程度與應對策略的財務關聯。
        </p>
      </div>

      {/* 主要內容卡片 */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center justify-between">
            <span className="text-blue-900">
              風險項目：{currentScenario?.category_name} - {currentScenario?.subcategory_name}
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={generateScenarioDescription}
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
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* 情境描述區域 */}
          <div className="space-y-3">
            <Label htmlFor="scenario" className="text-lg font-medium">情境描述</Label>
            <Textarea
              id="scenario"
              value={scenarioDescription}
              onChange={(e) => setScenarioDescription(e.target.value)}
              placeholder="點擊「生成情境描述」按鈕以產生具體的情境內容，或手動輸入..."
              rows={8}
              className="text-sm border-gray-300"
            />
          </div>

          {/* 量化分析區域 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">量化分析結果</Label>
              <Button
                onClick={generateComprehensiveAnalysis}
                disabled={isAnalyzing || !scenarioDescription}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    分析中...
                  </>
                ) : (
                  '開始綜合分析'
                )}
              </Button>
            </div>

            {analysisResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 損益表影響分析 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">1. 損益表影響分析</h4>
                  <p className="text-sm text-gray-700">
                    {analysisResults.financial_impact?.profit_loss?.description || '分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 現金流影響分析 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">2. 現金流影響分析</h4>
                  <p className="text-sm text-gray-700">
                    {analysisResults.financial_impact?.cash_flow?.description || '分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 資產負債表影響分析 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">3. 資產負債表影響分析</h4>
                  <p className="text-sm text-gray-700">
                    {analysisResults.financial_impact?.balance_sheet?.description || '分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 策略可行性說明 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">4. 策略可行性說明</h4>
                  <p className="text-sm text-gray-700">
                    {analysisResults.strategy_feasibility || '策略分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 分析與估算方法建議 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">5. 分析與估算方法建議</h4>
                  <p className="text-sm text-gray-700">
                    {analysisResults.analysis_methodology || '方法建議將在此顯示...'}
                  </p>
                </div>

                {/* 財務計算邏輯建議 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">6. 財務計算邏輯建議</h4>
                  <p className="text-sm text-gray-700">
                    {analysisResults.calculation_logic || '計算邏輯建議將在此顯示...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 企業補充區域 */}
          <div className="space-y-3">
            <Label htmlFor="userInput" className="text-lg font-medium">企業可依據自身狀況補充</Label>
            <Textarea
              id="userInput"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="請依據貴企業實際狀況，補充相關資訊或調整建議..."
              rows={4}
              className="text-sm border-gray-300"
            />
          </div>

          {/* 操作按鈕區域 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <Button
                onClick={exportDraft}
                disabled={!analysisResults}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                匯出為草稿
              </Button>
            </div>
            
            <Button
              onClick={saveAnalysisResults}
              disabled={isSubmitting || !scenarioDescription}
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
