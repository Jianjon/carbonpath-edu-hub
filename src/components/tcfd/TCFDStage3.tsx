
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDRiskOpportunitySelections } from '@/hooks/tcfd/useTCFDRiskOpportunitySelections';
import { useTCFDScenarioEvaluations } from '@/hooks/tcfd/useTCFDScenarioEvaluations';
import { Loader2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface TCFDStage3Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage3 = ({ assessment, onComplete }: TCFDStage3Props) => {
  const { riskOpportunitySelections, loadRiskOpportunitySelections } = useTCFDRiskOpportunitySelections(assessment.id);
  const { 
    scenarioEvaluations,
    saveScenarioEvaluation,
    loadScenarioEvaluations
  } = useTCFDScenarioEvaluations(assessment.id);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarioData, setScenarioData] = useState<{[key: string]: any}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 卡片內容生成規則
  const getCardContent = (cardType: string, scenario: any) => {
    const isRisk = scenario?.category_type === 'risk';
    const categoryName = scenario?.category_name || '';
    const subcategoryName = scenario?.subcategory_name || '';
    const industryName = assessment.industry;
    
    switch (cardType) {
      case 'profit_loss':
        return `描述${subcategoryName}情境對${industryName}企業營收、毛利、成本變化的影響原因與方向。此${isRisk ? '風險' : '機會'}可能導致${isRisk ? '營收下降、成本增加或毛利縮減' : '營收增長、成本優化或毛利提升'}，需要企業評估對核心獲利能力的具體衝擊程度。`;
      
      case 'cash_flow':
        return `描述${subcategoryName}情境下的短期投入、現金週轉、資金壓力或應設預算的區段與影響來源。${isRisk ? '風險應對' : '機會把握'}可能需要額外的現金流出，企業應評估流動性需求並制定相應的資金管理策略。`;
      
      case 'balance_sheet':
        return `評估${subcategoryName}情境是否需汰換資產、提列準備金或面臨跌價、租賃改約、資本性支出調整等資產負債表影響。${categoryName}相關的${isRisk ? '風險管理' : '機會投資'}可能改變企業的資產結構與負債水準。`;
      
      case 'strategy_feasibility':
        return `說明針對${subcategoryName}${isRisk ? '風險' : '機會'}採取相應策略的可行性分析。結合${industryName}產業特性與企業規模，評估不同策略選項的適用性、執行難度與預期效果，並解釋為什麼某些策略較為適合。`;
      
      case 'analysis_methodology':
        return `針對${subcategoryName}情境，建議採用敏感度分析、情境模擬、KPI追蹤等分析技術。參考同業標竿、產業報告、政府政策文件等資料來源，建立完整的評估框架以支援管理決策。`;
      
      case 'calculation_logic':
        return `提出${subcategoryName}情境下可供內部估算的公式或關鍵變數項目。建議建立影響係數 × 基準值的計算結構，如：${isRisk ? '損失機率 × 潛在損失金額' : '市場機會 × 獲利潜力'}等關鍵變數組合，協助量化財務影響。`;
      
      default:
        return '內容生成中...';
    }
  };

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
            userInput: '',
            scenario: item
          };
        } else if (!newScenarioData[item.id]) {
          // 自動生成情境描述
          const autoDescription = `基於${item.category_name}的${item.subcategory_name}情境，${assessment.industry}企業面臨以下具體挑戰：

【背景描述】
${item.category_type === 'risk' ? '氣候變遷' : '市場轉型'}帶來的${item.subcategory_name}影響正逐漸顯現，對${assessment.industry}產業造成結構性衝擊。

【業務影響】
企業營運模式需要調整以因應新的環境條件，包括供應鏈重組、技術升級投資，以及客戶需求變化的應對。

【${item.category_type === 'risk' ? '風險' : '機會'}評估】
${item.category_type === 'risk' ? '若未能及時調整策略，可能面臨營收下滑、成本上升，以及競爭力削弱的多重壓力。' : '及時把握此機會，可望創造新的營收來源、提升競爭優勢，並強化長期永續發展能力。'}`;

          newScenarioData[item.id] = {
            scenarioDescription: autoDescription,
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

  const saveCurrentScenario = async () => {
    if (!currentScenario || !currentData.scenarioDescription) return;

    try {
      await saveScenarioEvaluation({
        assessment_id: assessment.id,
        risk_opportunity_id: currentScenario.id,
        scenario_description: currentData.scenarioDescription,
        user_score: 5,
        likelihood_score: 5,
        llm_response: JSON.stringify({}),
        scenario_generated_by_llm: false
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
            llm_response: JSON.stringify({}),
            scenario_generated_by_llm: false
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
            analysisResults: {},
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
        userInput: itemData.userInput || ''
      };
    });

    const draftContent = `
TCFD第三階段情境分析草稿

${allData.map((data, index) => `
=== 情境 ${index + 1}: ${data.title} ===

情境描述：
${data.scenarioDescription}

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
              placeholder="情境描述將自動載入..."
              rows={8}
              className="text-sm border-gray-300"
            />
          </div>

          {/* 量化分析區域 - 直接顯示內容 */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">量化分析結果</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 損益表影響分析 */}
              <div className="p-4 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2 text-gray-800 flex items-center">
                  📊 1. 損益表影響分析
                </h4>
                <p className="text-sm text-gray-700">
                  {getCardContent('profit_loss', currentScenario)}
                </p>
              </div>

              {/* 現金流影響分析 */}
              <div className="p-4 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2 text-gray-800 flex items-center">
                  💵 2. 現金流影響分析
                </h4>
                <p className="text-sm text-gray-700">
                  {getCardContent('cash_flow', currentScenario)}
                </p>
              </div>

              {/* 資產負債表影響分析 */}
              <div className="p-4 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2 text-gray-800 flex items-center">
                  🏦 3. 資產負債影響分析
                </h4>
                <p className="text-sm text-gray-700">
                  {getCardContent('balance_sheet', currentScenario)}
                </p>
              </div>

              {/* 策略可行性說明 */}
              <div className="p-4 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2 text-gray-800 flex items-center">
                  🧠 4. 策略可行性說明
                </h4>
                <p className="text-sm text-gray-700">
                  {getCardContent('strategy_feasibility', currentScenario)}
                </p>
              </div>

              {/* 分析與估算方法建議 */}
              <div className="p-4 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2 text-gray-800 flex items-center">
                  📈 5. 分析與估算方法
                </h4>
                <p className="text-sm text-gray-700">
                  {getCardContent('analysis_methodology', currentScenario)}
                </p>
              </div>

              {/* 財務計算邏輯建議 */}
              <div className="p-4 bg-gray-50 rounded border">
                <h4 className="font-medium mb-2 text-gray-800 flex items-center">
                  🧮 6. 財務計算邏輯建議
                </h4>
                <p className="text-sm text-gray-700">
                  {getCardContent('calculation_logic', currentScenario)}
                </p>
              </div>
            </div>
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
