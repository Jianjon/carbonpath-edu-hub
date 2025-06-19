
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment } from '@/types/tcfd';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import { FileText, Download, Loader2 } from 'lucide-react';
import TCFDReportContent from './TCFDReportContent';

interface TCFDStage5Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

interface SelectedStrategyData {
  scenarioKey: string;
  strategy: string;
  analysis: any;
  notes: string;
}

interface Stage4Results {
  assessment: TCFDAssessment;
  strategySelections: SelectedStrategyData[];
  userModifications: Record<string, string>;
  completedAt: string;
}

const TCFDStage5 = ({ assessment, onComplete }: TCFDStage5Props) => {
  const { generateReport, loading } = useTCFDAssessment(assessment.id);
  const [stage4Results, setStage4Results] = useState<Stage4Results | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  useEffect(() => {
    console.log('第五階段正在載入資料...');
    
    // 優先從 sessionStorage 讀取第四階段的結果
    const storedStage4Results = sessionStorage.getItem('tcfd-stage4-results');
    if (storedStage4Results) {
      try {
        const results: Stage4Results = JSON.parse(storedStage4Results);
        setStage4Results(results);
        console.log('第五階段成功載入第四階段結果:', results);
        return;
      } catch (error) {
        console.error('解析第四階段結果失敗:', error);
      }
    }

    // 如果沒有第四階段結果，嘗試載入第三階段結果作為備用
    const storedStage3Results = sessionStorage.getItem('tcfd-stage3-results');
    if (storedStage3Results) {
      try {
        const stage3Results = JSON.parse(storedStage3Results);
        // 轉換為第四階段格式
        const convertedResults: Stage4Results = {
          assessment: stage3Results.assessment,
          strategySelections: stage3Results.strategySelections,
          userModifications: {},
          completedAt: new Date().toISOString()
        };
        setStage4Results(convertedResults);
        console.log('第五階段載入第三階段結果（備用）:', convertedResults);
      } catch (error) {
        console.error('解析第三階段結果失敗:', error);
      }
    }
  }, []);

  const handleGenerateReport = async () => {
    if (!stage4Results) {
      console.error('沒有前階段的資料');
      return;
    }

    setIsGeneratingReport(true);
    try {
      const reportData = {
        assessment_id: assessment.id,
        governance_content: '已完成治理架構建立',
        strategy_content: `已分析${stage4Results.strategySelections.length}個風險機會情境`,
        risk_management_content: '已建立風險管理流程',
        metrics_targets_content: '已設定相關指標目標',
        disclosure_matrix: stage4Results.strategySelections,
        report_format_content: 'TCFD完整報告',
        json_output: {
          assessment: assessment,
          strategies: stage4Results.strategySelections,
          userModifications: stage4Results.userModifications
        }
      };

      await generateReport(reportData);
      setReportGenerated(true);
      console.log('報告生成成功');
    } catch (error) {
      console.error('生成報告失敗:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 如果還沒載入到資料，顯示載入畫面
  if (!stage4Results) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
              <FileText className="h-8 w-8 text-green-600" />
              <span>第五階段：TCFD 報告生成</span>
            </CardTitle>
            <p className="text-gray-600 text-center">
              系統整合您的所有輸入與分析，生成完整的 TCFD 揭露報告
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">載入分析資料...</h3>
            <p className="text-gray-600">
              正在從前四個階段載入分析結果...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <FileText className="h-8 w-8 text-green-600" />
            <span>第五階段：TCFD 報告生成</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            基於前四階段分析結果，生成完整的 TCFD 四大面向揭露報告
          </p>
          <div className="flex justify-center mt-2">
            <Badge variant="outline" className="text-gray-700">
              {getChineseText(assessment.company_size)} · {getChineseText(assessment.industry)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* 報告摘要 */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-800">TCFD 報告摘要</h3>
              <p className="text-sm text-green-700">
                完成 {stage4Results.strategySelections.length} 個風險機會情境分析，涵蓋四大揭露面向
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">
                {stage4Results.strategySelections.length}
              </div>
              <div className="text-xs text-green-600">情境分析</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TCFD 報告內容 */}
      <TCFDReportContent 
        assessment={assessment}
        strategySelections={stage4Results.strategySelections}
      />

      {/* 報告操作區 */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="font-medium text-slate-800 mb-2">報告功能</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>TCFD 四大類別完整揭露</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>風險與機會分析矩陣</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>策略財務影響評估</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>結構化資料輸出</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport || reportGenerated}
                variant={reportGenerated ? "secondary" : "default"}
                className="px-6"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    生成報告中...
                  </>
                ) : reportGenerated ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    報告已生成
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    生成最終報告
                  </>
                )}
              </Button>
              
              {reportGenerated && (
                <Button onClick={onComplete} variant="outline">
                  完成評估
                </Button>
              )}
            </div>

            {reportGenerated && (
              <div className="text-sm text-green-600 mt-4">
                ✓ TCFD 報告已成功生成並儲存至資料庫
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage5;
