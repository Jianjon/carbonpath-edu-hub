
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Target, ShieldCheck, BarChart3 } from 'lucide-react';

interface TCFDReportContentProps {
  assessment: any;
  strategySelections: any[];
}

const TCFDReportContent = ({ assessment, strategySelections }: TCFDReportContentProps) => {
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

  // 生成治理內容
  const generateGovernanceContent = () => {
    return `
針對重大災害的指引：

組織描述如何設定氣候相關風險的管理流程；組織如何設定氣候相關風險相對於其他風險的重要性。

組織考量董事會下列責訊：
- 針對已辨別的氣候相關風險評估在營運模式和策略的流程
- 所使用的風險術語是業者引用既有風險分類架構

本公司作為${getChineseText(assessment.company_size)}${getChineseText(assessment.industry)}企業，已建立氣候風險治理架構，董事會層級定期檢視氣候相關議題，並設置專責單位負責TCFD相關事務的推動與執行。

針對氣候相關風險與機會的監督，本公司建立了系統性的風險管理程序，定期評估並向董事會報告氣候相關風險的管理現況。
    `;
  };

  // 生成策略表格內容
  const generateStrategyTableContent = () => {
    const riskCount = strategySelections.filter(s => s.analysis?.risk_strategies).length;
    const oppCount = strategySelections.filter(s => s.analysis?.opportunity_strategies).length;

    return {
      itemA: {
        title: "針對重大資訊，揭露組織業務、策略和財務規劃中，因氣候相關風險與機會帶來的潛在及實際衝擊。",
        content: [
          "- 描述短、中、長期的氣候相關風險與機會，考量組織資產或設備使用壽命，以及短、中、長期策略的氣候相關風險與機會。",
          "- 具體氣候相關風險描述可能對組織當期財務表生重大財務影響的各種時間長度（短期、中期和長期）。",
          "- 描述氣候風險與機會可能對組織當期財務表的流程。",
          `適當情況下，組織考量各種的明知風險氣候風險與機會；在描述氣候風險相關議題時，組織應考參考 Table 1和 Table 2（第9及10頁）。`
        ]
      },
      itemB: {
        title: "氣候相關風險與機會",
        subTitle: "在建議的資訊揭露（a）基礎上，組織應進一步揭露所產的氣候相關風險描述如何影響其業務、策略及財務規劃的影響：",
        content: [
          "- 產品與服務",
          "- 供應鏈和／或價值鏈",
          "- 調適和減緩活動", 
          "- 研發投資",
          "- 業務配置（包括業務轉型和搬遷所在地）",
          `組織描述氣候風險與機會描述可作為其財務規劃流程的一個低度，使用些些相關區間以及如何評其至風險與機會的優先順序，組織的資訊規劃反映其影響其國情報期價值的各種因素，從此且日後依賴的情況。組織應考量在其資訊規劃中納入對下列清單的財務規劃的影響：`,
          "- 營業成本和營業收入",
          "- 資本支出及資本配置",
          "- 收購及資產分別",
          "- 資本的取得",
          "若組織的策略及財務規劃中有使用到氣候情境，應揭露該情境亦以描述。"
        ]
      },
      itemC: {
        title: "針對重大資產的指引",
        content: [
          `組織應進組織標準對氣候相關風險與機會的動性，如，因應2°C或更嚴格情境所進行的低碳經濟轉型，以及實體風險所不斷增加的組織對情境。`,
          "組織應考量對下述項次：",
          "- 組織的策略可高可能受到氣候相關風險與機會的影響",
          "- 如何改變組織策略以因應潛在的風險與機會",
          "- 納入考量的氣候相關情境和相關時間框架",
          "請參見第元0情境更多有關情性分析中適用情境部分析的資訊。"
        ]
      }
    };
  };

  // 生成風險管理表格內容
  const generateRiskManagementTableContent = () => {
    return {
      itemA: {
        title: "針對重大資產的指引",
        content: [
          "組織描述組織如何辨別和評估氣候相關風險的管理流程；組織如何設定氣候相關風險相對於其他風險的重要性是重要的。",
          "組織應述通進氣候相關風險是否整合至重要的風險愛受為規劃（如排放管制）及其他相關因素。",
          "組織應考量對下列資訊：",
          "- 針對已辨別的氣候相關風險評估住宅規模和配置的流程",
          "- 所使用的風險術語建定業者引用既有風險分類架構"
        ]
      },
      itemB: {
        title: "針對重大資產的指引",
        content: [
          "組織應述組織各氣候相關風險的管理流程，包括如何做出減緩、轉移、接受或控制這些風險的決定。此外，組織應述通氣候相關風險進行重大性判斷的流程，包括組織如何認定重大。",
          "如適當，在描述氣候相關風險的管理流程時，組織應回應 Table 1和 Table 2（第9及10頁）中所包含的風險。"
        ]
      },
      itemC: {
        title: "針對重大資產的指引",
        content: [
          "組織應述統籌、辨別和管理氣候相關風險的流程如何整合於組織整體的風險管理制度。"
        ]
      }
    };
  };

  const strategyTableData = generateStrategyTableContent();
  const riskManagementTableData = generateRiskManagementTableContent();

  return (
    <div className="space-y-6">
      {/* 治理 */}
      <Card>
        <CardHeader className="bg-slate-50">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-slate-600" />
            <span>治理</span>
          </CardTitle>
          <p className="text-sm text-slate-600">
            揭露組織如何辨別、評估和管理氣候相關風險的治理情況
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-slate-700 leading-relaxed">
              {generateGovernanceContent()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 策略 */}
      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>策略</span>
          </CardTitle>
          <p className="text-sm text-blue-600">
            針對重大災害，揭露組織業務、策略和財務規劃中，因氣候相關風險與機會帶來的潛在及實際衝擊。
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40 bg-blue-100 font-medium text-blue-900">建議揭露事項</TableHead>
                  <TableHead className="bg-blue-100 font-medium text-blue-900">針對重大資產的指引</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項a) 描述氣候相關的短期、中期和長期與機會。
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm text-slate-700 space-y-2">
                      <p className="font-medium">{strategyTableData.itemA.title}</p>
                      <div className="space-y-1">
                        {strategyTableData.itemA.content.map((item, index) => (
                          <p key={index}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項b) 描述海平面上升業務、策略和財務規劃的氣候相關風險與機會。
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm text-slate-700 space-y-2">
                      <p className="font-medium">{strategyTableData.itemB.title}</p>
                      <p className="text-sm">{strategyTableData.itemB.subTitle}</p>
                      <div className="space-y-1">
                        {strategyTableData.itemB.content.map((item, index) => (
                          <p key={index}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項c) 描述氣候在實踐下的戰略，並考量不同氣候相關情境（包括2°C或更嚴格的情境）。
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm text-slate-700 space-y-2">
                      <p className="font-medium">{strategyTableData.itemC.title}</p>
                      <div className="space-y-1">
                        {strategyTableData.itemC.content.map((item, index) => (
                          <p key={index}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* 實際情境分析內容 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">本公司氣候風險與機會分析結果</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>本公司已辨識出{strategySelections.length}個重要氣候相關情境，涵蓋實體風險、轉型風險及氣候機會。</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {strategySelections.map((selection, index) => {
                    const [categoryName, subcategoryName] = selection.scenarioKey.split('-');
                    const isRisk = selection.analysis?.risk_strategies ? true : false;
                    return (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={isRisk ? "destructive" : "default"} className="text-xs">
                            {categoryName}
                          </Badge>
                          <span className="text-xs font-medium">{subcategoryName}</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {selection.analysis?.scenario_description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 風險管理 */}
      <Card>
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-orange-600" />
            <span>風險管理</span>
          </CardTitle>
          <p className="text-sm text-orange-600">
            揭露組織如何辨別、評估和管理氣候相關風險。
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 bg-orange-100 font-medium text-orange-900">建議揭露事項</TableHead>
                <TableHead className="bg-orange-100 font-medium text-orange-900">針對重大資產的指引</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項a) 描述組織在氣候相關風險辨別和評估流程。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm text-slate-700 space-y-2">
                    <div className="space-y-1">
                      {riskManagementTableData.itemA.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項b) 描述組織氣候相關風險的管理流程。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm text-slate-700 space-y-2">
                    <div className="space-y-1">
                      {riskManagementTableData.itemB.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項c) 描述氣候相關風險辨別、評估和管理流程如何整合於組織整體風險管理制度。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm text-slate-700 space-y-2">
                    <div className="space-y-1">
                      {riskManagementTableData.itemC.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* 實際風險管理實施狀況 */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-900 mb-3">本公司風險管理實施現況</h4>
            <div className="text-sm text-orange-800 space-y-3">
              <div>
                <h5 className="font-medium mb-1">風險辨識與評估：</h5>
                <p>本公司建立系統性氣候風險評估機制，定期檢視{strategySelections.length}個關鍵風險情境，並整合至整體企業風險管理架構。</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">風險管理策略：</h5>
                <p>針對辨識之氣候風險，本公司採用減緩、轉移、接受、控制等多元管理策略，並定期評估執行成效。</p>
              </div>
              <div>
                <h5 className="font-medium mb-1">整合性管理：</h5>
                <p>氣候風險管理已完全整合至本公司整體風險管理制度，確保氣候相關議題能獲得適當關注與資源配置。</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 指標和目標 */}
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span>指標和目標</span>
          </CardTitle>
          <p className="text-sm text-green-600">
            針對重大災害，揭露用於評估和管理氣候相關風險與機會的指標和目標。
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-900 mb-2">關鍵績效指標</h4>
                <div className="bg-green-50 p-4 rounded border border-green-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">溫室氣體排放指標：</h5>
                      <ul className="space-y-1 text-green-700">
                        <li>• 範圍1溫室氣體排放：直接排放源</li>
                        <li>• 範圍2溫室氣體排放：間接排放源（購買電力）</li>
                        <li>• 範圍3溫室氣體排放：其他間接排放</li>
                      </ul>
                      <p className="text-xs text-green-600 mt-2">
                        {assessment.has_carbon_inventory ? '✓ 本公司已建立完整溫室氣體盤查制度' : '○ 本公司正積極建立溫室氣體盤查制度'}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">氣候風險管理指標：</h5>
                      <ul className="space-y-1 text-green-700">
                        <li>• 氣候風險評估覆蓋率：100%</li>
                        <li>• 重大風險情境數量：{strategySelections.length}個</li>
                        <li>• 氣候調適措施實施進度：規劃中</li>
                        <li>• 氣候相關投資比例：評估中</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-green-900 mb-2">目標設定</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <h5 className="font-medium text-green-800 mb-1">短期目標（1-3年）：</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 完成全面性溫室氣體盤查建置</li>
                      <li>• 建立氣候風險監控預警機制</li>
                      <li>• 導入再生能源使用比例達指定水準</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <h5 className="font-medium text-green-800 mb-1">中長期目標（3-10年）：</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 實現溫室氣體排放減量目標</li>
                      <li>• 完成重大氣候風險調適措施</li>
                      <li>• 開發低碳產品或服務組合</li>
                      <li>• 強化氣候韌性營運模式</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 p-4 rounded border border-green-300">
                <h5 className="font-medium text-green-900 mb-2">監控與報告機制：</h5>
                <p className="text-sm text-green-800">
                  本公司建立定期監控機制，每年檢視目標達成進度，並適時調整策略方向。
                  所有氣候相關指標均納入年度永續報告書中，確保資訊透明度與利害關係人溝通。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDReportContent;
