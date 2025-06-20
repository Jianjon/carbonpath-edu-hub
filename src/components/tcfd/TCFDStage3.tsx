
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, Sparkles, Download, ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarioData, setScenarioData] = useState<{[key: string]: any}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadRiskOpportunitySelections();
    loadScenarioEvaluations();
  }, []);

  useEffect(() => {
    // 當載入現有評估資料時，填入對應的情境資料
    const selectedItems = riskOpportunitySelections.filter(item => item.selected);
    if (selectedItems.length > 0 && scenarioEvaluations.length > 0) {
      const newScenarioData = { ...scenarioData };
      
      selectedItems.forEach(item => {
        const existingEvaluation = scenarioEvaluations.find(
          evaluation => evaluation.risk_opportunity_id === item.id
        );
        
        if (existingEvaluation) {
          newScenarioData[item.id] = {
            scenarioDescription: existingEvaluation.scenario_description || '',
            analysisResults: existingEvaluation.llm_response ? JSON.parse(existingEvaluation.llm_response) : null,
            userInput: '',
            scenario: item
          };
        } else if (!newScenarioData[item.id]) {
          newScenarioData[item.id] = {
            scenarioDescription: '',
            analysisResults: null,
            userInput: '',
            scenario: item
          };
        }
      });
      
      setScenarioData(newScenarioData);
    }
  }, [riskOpportunitySelections, scenarioEvaluations]);

  const selectedItems = riskOpportunitySelections.filter(item => item.selected);
  const currentScenario = selectedItems[currentIndex];
  const currentData = currentScenario ? scenarioData[currentScenario.id] || {} : {};

  const updateCurrentScenarioData = (updates: any) => {
    if (!currentScenario) return;
    
    setScenarioData(prev => ({
      ...prev,
      [currentScenario.id]: {
        ...prev[currentScenario.id],
        ...updates,
        scenario: currentScenario
      }
    }));
  };

  const generateScenarioDescription = async () => {
    if (!currentScenario) return;

    setIsGenerating(true);
    try {
      const generatedDescription = `
基於${currentScenario.category_name}的${currentScenario.subcategory_name}情境，${assessment.industry}企業面臨以下具體挑戰：

【背景描述】
${currentScenario.category_type === 'risk' ? '氣候變遷' : '市場轉型'}帶來的${currentScenario.subcategory_name}影響正逐漸顯現，對${assessment.industry}產業造成結構性衝擊。

【業務影響】
企業營運模式需要調整以因應新的環境條件，包括供應鏈重組、技術升級投資，以及客戶需求變化的應對。

【風險壓力】
若未能及時調整策略，可能面臨營收下滑、成本上升，以及競爭力削弱的多重壓力。
      `.trim();

      updateCurrentScenarioData({ scenarioDescription: generatedDescription });
      toast.success('情境描述已生成');
    } catch (error) {
      console.error('生成情境描述失敗:', error);
      toast.error('生成情境描述失敗');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComprehensiveAnalysis = async () => {
    if (!currentScenario || !currentData.scenarioDescription) {
      toast.error('請先生成情境描述');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await generateComprehensiveScenarioAnalysis(
        currentScenario.category_type as 'risk' | 'opportunity',
        currentScenario.category_name,
        currentScenario.subcategory_name || '',
        currentData.scenarioDescription,
        5,
        assessment.industry,
        assessment.company_size,
        assessment.business_description || '',
        { userInput: currentData.userInput || '' }
      );

      updateCurrentScenarioData({ analysisResults: response });
      toast.success('綜合分析已完成');
    } catch (error) {
      console.error('綜合分析失敗:', error);
      toast.error('綜合分析失敗');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveCurrentScenario = async () => {
    if (!currentScenario || !currentData.scenarioDescription) return;

    try {
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: currentScenario.id,
        scenario_description: currentData.scenarioDescription,
        user_score: 5,
        likelihood_score: 5,
        llm_response: JSON.stringify(currentData.analysisResults || {}),
        scenario_generated_by_llm: true
      });

      toast.success('當前情境已儲存');
    } catch (error) {
      console.error('儲存失敗:', error);
      toast.error('儲存失敗');
    }
  };

  const completeAllAnalysis = async () => {
    setIsSubmitting(true);
    try {
      // 儲存所有情境資料
      const savePromises = selectedItems.map(item => {
        const itemData = scenarioData[item.id];
        if (itemData && itemData.scenarioDescription) {
          return saveScenarioEvaluation({
            assessment_id: assessment.id,
            risk_opportunity_id: item.id,
            scenario_description: itemData.scenarioDescription,
            user_score: 5,
            likelihood_score: 5,
            llm_response: JSON.stringify(itemData.analysisResults || {}),
            scenario_generated_by_llm: true
          });
        }
        return Promise.resolve();
      });

      await Promise.all(savePromises);

      // 準備第四階段資料
      const stage3Results = {
        assessment: assessment,
        scenarios: selectedItems.map(item => {
          const itemData = scenarioData[item.id] || {};
          return {
            categoryName: item.category_name,
            categoryType: item.category_type,
            subcategoryName: item.subcategory_name || '',
            scenarioDescription: itemData.scenarioDescription || '',
            analysisResults: itemData.analysisResults,
            userInput: itemData.userInput || '',
            userScore: 5
          };
        })
      };

      sessionStorage.setItem('tcfd-stage3-results', JSON.stringify(stage3Results));
      console.log('第三階段完成，資料已儲存:', stage3Results);
      
      toast.success('所有分析結果已儲存');
      onComplete();
    } catch (error) {
      console.error('儲存失敗:', error);
      toast.error('儲存失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportDraft = () => {
    const allData = selectedItems.map(item => {
      const itemData = scenarioData[item.id] || {};
      return {
        title: `${item.category_name} - ${item.subcategory_name}`,
        scenarioDescription: itemData.scenarioDescription || '',
        analysisResults: itemData.analysisResults,
        userInput: itemData.userInput || ''
      };
    });

    const draftContent = `
TCFD第三階段情境分析草稿

${allData.map((data, index) => `
=== 情境 ${index + 1}: ${data.title} ===

情境描述：
${data.scenarioDescription}

量化分析結果：
${JSON.stringify(data.analysisResults, null, 2)}

企業補充說明：
${data.userInput}

`).join('\n')}
    `;

    const blob = new Blob([draftContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TCFD第三階段分析草稿.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('草稿已匯出');
  };

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
        
        {/* 進度指示器 */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <span className="text-sm text-gray-500">
            情境 {currentIndex + 1} / {selectedItems.length}
          </span>
          <div className="flex space-x-2">
            {selectedItems.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 主要內容卡片 */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center justify-between">
            <span className="text-blue-900">
              {currentScenario?.category_type === 'risk' ? '風險項目' : '機會項目'}：
              {currentScenario?.category_name} - {currentScenario?.subcategory_name}
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setCurrentIndex(Math.min(selectedItems.length - 1, currentIndex + 1))}
                disabled={currentIndex === selectedItems.length - 1}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
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
              value={currentData.scenarioDescription || ''}
              onChange={(e) => updateCurrentScenarioData({ scenarioDescription: e.target.value })}
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
                disabled={isAnalyzing || !currentData.scenarioDescription}
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

            {currentData.analysisResults && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 損益表影響分析 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">1. 損益表影響分析</h4>
                  <p className="text-sm text-gray-700">
                    {currentData.analysisResults.financial_impact?.profit_loss?.description || '分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 現金流影響分析 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">2. 現金流影響分析</h4>
                  <p className="text-sm text-gray-700">
                    {currentData.analysisResults.financial_impact?.cash_flow?.description || '分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 資產負債表影響分析 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">3. 資產負債表影響分析</h4>
                  <p className="text-sm text-gray-700">
                    {currentData.analysisResults.financial_impact?.balance_sheet?.description || '分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 策略可行性說明 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">4. 策略可行性說明</h4>
                  <p className="text-sm text-gray-700">
                    {currentData.analysisResults.strategy_feasibility || '策略分析內容將在此顯示...'}
                  </p>
                </div>

                {/* 分析與估算方法建議 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">5. 分析與估算方法建議</h4>
                  <p className="text-sm text-gray-700">
                    {currentData.analysisResults.analysis_methodology || '方法建議將在此顯示...'}
                  </p>
                </div>

                {/* 財務計算邏輯建議 */}
                <div className="p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium mb-2 text-gray-800">6. 財務計算邏輯建議</h4>
                  <p className="text-sm text-gray-700">
                    {currentData.analysisResults.calculation_logic || '計算邏輯建議將在此顯示...'}
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
              value={currentData.userInput || ''}
              onChange={(e) => updateCurrentScenarioData({ userInput: e.target.value })}
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
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                匯出為草稿
              </Button>
              <Button
                onClick={saveCurrentScenario}
                disabled={!currentData.scenarioDescription}
                variant="outline"
                size="sm"
              >
                儲存當前情境
              </Button>
            </div>
            
            <Button
              onClick={completeAllAnalysis}
              disabled={isSubmitting}
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
