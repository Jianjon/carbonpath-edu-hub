
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

  // 生成治理表格內容
  const generateGovernanceTableContent = () => {
    return {
      itemA: {
        title: "針對所有產業的指引",
        content: [
          "在描述董事會對氣候相關議題的監督時，組織應考量納入下列問題：",
          "- 組織是否規劃於董事會下設委員會（如稽核委員會）報告氣候相關議題的流程和頻率",
          "- 董事會和／或委員會下設委員會在監督和指導專用的重要行動計畫、風險管理政策、年度預算和商業計畫以及制定組織的營業目標、監控實施和績效情況，以及監督重要資本支出、收購和資產處置是否考量氣候候相關議題",
          "- 董事會如何監控和監督進展候相關議題是目標績效的實現"
        ],
        realContent: `本公司董事會已設立永續發展委員會，專責監督氣候相關議題，每季定期向董事會報告氣候風險管理現況及目標達成進度。作為${getChineseText(assessment.company_size)}${getChineseText(assessment.industry)}企業，本公司已將氣候議題納入年度營業計畫及重要投資決策考量。`
      },
      itemB: {
        title: "針對所有產業的指引",
        content: [
          "當組織管理層在風險和管理層氣候相關議題方面的角色時，組織應考量包含下列資訊：",
          "- 組織是否已分派氣候相關職責在高管理職位或委員會，如風險、該管理職位或委員會是否向董事會或董事會下設委員會進行報告，並且具體職責是否包含各部門和／或管理氣候相關議題",
          "- 對相關組織結構的描述",
          "- 管理層監督氣候氣候相關議題的流程",
          "- 管理層如何（透過特定職位和／或委員會）監控氣候相關議題"
        ],
        realContent: `本公司設置永續長職位，直接向執行長報告，負責統籌氣候相關事務。已建立跨部門氣候變遷因應小組，涵蓋營運、財務、風險管理等單位，每月召開會議檢討氣候行動方案執行進度。`
      }
    };
  };

  // 生成策略表格內容
  const generateStrategyTableContent = () => {
    return {
      itemA: {
        title: "針對所有產業的指引",
        content: [
          "- 描述短、中、長期的氣候相關風險與機會，考量組織資產或設備使用壽命，以及短、中、長期策略的氣候相關風險與機會。",
          "- 具體氣候相關風險描述可能對組織當期財務報表產生重大財務影響的各種時間長度（短期、中期和長期）。",
          "- 描述氣候風險與機會可能對組織當期財務報表的流程。",
          "適當情況下，組織考量各種類型的風險氣候風險與機會；在描述氣候風險相關議題時，組織應考慮參考 Table 1和 Table 2（第9及10頁）。"
        ],
        realContent: `本公司已辨識${strategySelections.length}個重要氣候情境，時間範圍涵蓋短期(1-3年)、中期(3-10年)及長期(10年以上)。透過系統性評估，已完成對營運成本、資本支出及收入影響的財務量化分析。`
      },
      itemB: {
        title: "氣候相關風險與機會",
        subTitle: "在建議的資訊揭露（a）基礎上，組織應進一步揭露所辨識的氣候相關風險描述如何影響其業務、策略及財務規劃的影響：",
        content: [
          "- 產品與服務",
          "- 供應鏈和／或價值鏈", 
          "- 調適和減緩活動",
          "- 研發投資",
          "- 業務配置（包括業務轉型和搬遷所在地）",
          "組織描述氣候風險與機會描述可作為其財務規劃流程的一個輸入，使用這些相關區間以及如何將其風險與機會的優先順序，組織的財務規劃反映其影響其當前和未來價值的各種因素，從此且日後依賴的情況。組織應考量在其財務規劃中納入對下列清單的財務規劃的影響：",
          "- 營業成本和營業收入",
          "- 資本支出及資本配置", 
          "- 收購及資產分別",
          "- 資本的取得",
          "若組織的策略及財務規劃中有使用到氣候情境，應揭露該情境亦以描述。"
        ],
        realContent: `基於風險評估結果，本公司已調整產品服務組合，增加低碳解決方案比重，並於供應鏈導入碳足跡管理。預計未來三年投入新台幣5,000萬元於減碳技術研發，並評估設備汰換及廠區節能改善投資需求。`
      },
      itemC: {
        title: "針對重大資產的指引",
        content: [
          "組織應進一步描述組織對氣候相關風險與機會的韌性，如，因應2°C或更嚴格情境所進行的低碳經濟轉型，以及實體風險所不斷增加的組織對情境。",
          "組織應考量對下述項次：",
          "- 組織的策略可能可能受到氣候相關風險與機會的影響",
          "- 如何改變組織策略以因應潛在的風險與機會", 
          "- 納入考量的氣候相關情境和相關時間框架",
          "請參見第30頁情境分析中適用情境分析的資訊。"
        ],
        realContent: `本公司已完成2°C升溫情境下的韌性分析，制定多元化調適策略。透過情境分析確認營運模式在不同氣候路徑下的適應能力，並建立動態策略調整機制以確保長期營運韌性。`
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
          "組織應描述氣候相關風險是否整合至重要的風險愛受為規劃（如排放管制）及其他相關因素。",
          "組織應考量對下列資訊：",
          "- 針對已辨別的氣候相關風險評估住宅規模和配置的流程",
          "- 所使用的風險術語建定業者引用既有風險分類架構"
        ],
        realContent: `本公司建立系統性氣候風險辨識流程，採用TCFD架構進行實體風險與轉型風險評估。風險評估整合至既有ERM企業風險管理制度，每年定期更新風險地圖，並依機率與衝擊程度進行分級管理。`
      },
      itemB: {
        title: "針對重大資產的指引", 
        content: [
          "組織應描述組織各氣候相關風險的管理流程，包括如何做出減緩、轉移、接受或控制這些風險的決定。此外，組織應描述氣候相關風險進行重大性判斷的流程，包括組織如何認定重大。",
          "如適當，在描述氣候相關風險的管理流程時，組織應回應 Table 1和 Table 2（第9及10頁）中所包含的風險。"
        ],
        realContent: `本公司採用四象限風險管理策略：(1)高影響高機率風險採減緩措施 (2)高影響低機率風險採轉移策略 (3)低影響高機率風險採控制措施 (4)低影響低機率風險採接受策略。重大性門檻設定為年營收1%或新台幣500萬元以上影響。`
      },
      itemC: {
        title: "針對重大資產的指引",
        content: [
          "組織應描述統籌、辨別和管理氣候相關風險的流程如何整合於組織整體的風險管理制度。"
        ],
        realContent: `氣候風險管理已完全整合至本公司風險管理委員會運作機制，與作業風險、財務風險、法規風險等採相同治理流程。氣候風險評估結果直接納入董事會風險報告，確保高階管理層充分掌握氣候議題對企業營運的潛在影響。`
      }
    };
  };

  // 生成指標和目標表格內容
  const generateMetricsTableContent = () => {
    return {
      itemA: {
        title: "針對所有產業的指引",
        content: [
          "揭露組織依據其業務的風險和管理流程進行評估的指標。",
          "根據 Table 1和 Table 2（第9及10頁）組織應提供觀和管理氣候相關風險與機會所使用的關鍵傳統，若相關且適用，組織應考量納入乃與水、能源、土地使用權等對相關管理有關的氣候相關風險指標。",
          "若相關，組織應提供其郊區傳統以及氣候相關機會指標，例如低碳經濟設計的產品和服務的收入。",
          "應提供內部史況指標以進行關聯分析，另外，如果其他計算或預算氣候候的方法不易釐別，組織應予以描述。"
        ],
        realContent: `本公司建立多維度氣候指標監控體系，包含溫室氣體排放量(範圍1、2、3)、能源使用效率、水資源利用率、廢棄物回收率等環境指標，以及綠色產品營收占比、氣候調適投資金額等機會指標。`
      },
      itemB: {
        title: "針對所有產業的指引",
        content: [
          "組織應揭露的範圍1、範圍2和範圍3溫室氣體排放和相關風險。",
          "溫室氣體排放的意義和計算，範圍2和範圍3溫室氣體盤查定義參考（GHG Protocol）規定的方法計算，以便於不同組織和偵測間全球標準化比較。",
          "若該當，組織應考量提供相關的持定產業量及的溫室氣體排放與量（如適用）。",
          "溫室氣體排放的計算和溫室氣體指標以進行關聯分析，另外，如果其他計算或預算氣候候的方法不易易釐，組織應予以描述。"
        ],
        realContent: `${assessment.has_carbon_inventory ? 
          `本公司已完成溫室氣體盤查，2023年度範圍1排放量2,150公噸CO2e、範圍2排放量8,750公噸CO2e、範圍3排放量15,320公噸CO2e，總計26,220公噸CO2e。採用GHG Protocol標準進行計算，並通過第三方查證。` :
          `本公司正建置溫室氣體盤查制度，預計於2024年完成基準年排放量盤查，後續將依GHG Protocol標準進行範圍1、2、3溫室氣體排放量統計與監控。`}`
      },
      itemC: {
        title: "針對所有產業的指引",
        content: [
          "組織應描述其在相關要求或市場驅動其他目標的關鍵傳統對目標，例如與溫室氣體排放、用水量、能源使用等等相關的目標，其他包括可以更近或改善或財務目標、財務損失各項度，室定產專項目標的商品和服務的收入目標，以及追蹤實績執行目標的表現。",
          "在描述目標時，組織應考量納入下列資訊：",
          "- 完整定期和對目標或依淺度為基準的目標",
          "- 目標適用的時間範圍",
          "- 衡量運送情況的基準年份",
          "- 評估目標建議情況的重要標準或指標",
          "另外，如果其他計算和對目標和指標的方法不易易釐別，組織應予以描述。"
        ],
        realContent: `本公司設定2030年溫室氣體排放量較2023年基準年減少42%之科學基礎目標，並承諾2050年達成淨零排放。短期目標包括2025年再生能源使用比例達50%、2027年完成主要設備節能改善專案。各項目標均建立季度追蹤機制，並與員工績效考核連結。`
      }
    };
  };

  const governanceTableData = generateGovernanceTableContent();
  const strategyTableData = generateStrategyTableContent();
  const riskManagementTableData = generateRiskManagementTableContent();
  const metricsTableData = generateMetricsTableContent();

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 bg-slate-100 font-medium text-slate-900">建議揭露事項</TableHead>
                <TableHead className="bg-slate-100 font-medium text-slate-900">針對所有產業的指引</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="align-top bg-slate-50 font-medium text-slate-800">
                  建議揭露事項a) 描述董事會對氣候相關風險與機會的監督情況
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-slate-900">{governanceTableData.itemA.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {governanceTableData.itemA.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-900">{governanceTableData.itemA.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-slate-50 font-medium text-slate-800">
                  建議揭露事項b) 描述管理層在評估和管理氣候相關風險與機會方面的角色。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-slate-900">{governanceTableData.itemB.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {governanceTableData.itemB.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="text-sm font-medium text-slate-900">{governanceTableData.itemB.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
                    <div className="text-sm space-y-3">
                      <p className="font-medium text-blue-900">{strategyTableData.itemA.title}</p>
                      <div className="space-y-1 text-gray-500">
                        {strategyTableData.itemA.content.map((item, index) => (
                          <p key={index}>{item}</p>
                        ))}
                      </div>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">{strategyTableData.itemA.realContent}</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項b) 描述氣候相關風險與機會對組織業務、策略和財務規劃的影響。
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm space-y-3">
                      <p className="font-medium text-blue-900">{strategyTableData.itemB.title}</p>
                      <p className="text-sm text-blue-800">{strategyTableData.itemB.subTitle}</p>
                      <div className="space-y-1 text-gray-500">
                        {strategyTableData.itemB.content.map((item, index) => (
                          <p key={index}>{item}</p>
                        ))}
                      </div>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">{strategyTableData.itemB.realContent}</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項c) 描述氣候在實踐下的戰略，並考量不同氣候相關情境（包括2°C或更嚴格的情境）。
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm space-y-3">
                      <p className="font-medium text-blue-900">{strategyTableData.itemC.title}</p>
                      <div className="space-y-1 text-gray-500">
                        {strategyTableData.itemC.content.map((item, index) => (
                          <p key={index}>{item}</p>
                        ))}
                      </div>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">{strategyTableData.itemC.realContent}</p>
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
                <p className="font-medium">本公司已辨識出{strategySelections.length}個重要氣候相關情境，涵蓋實體風險、轉型風險及氣候機會。</p>
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
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-orange-900">{riskManagementTableData.itemA.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {riskManagementTableData.itemA.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-orange-50 rounded border border-orange-200">
                      <p className="text-sm font-medium text-orange-900">{riskManagementTableData.itemA.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項b) 描述組織氣候相關風險的管理流程。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-orange-900">{riskManagementTableData.itemB.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {riskManagementTableData.itemB.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-orange-50 rounded border border-orange-200">
                      <p className="text-sm font-medium text-orange-900">{riskManagementTableData.itemB.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項c) 描述氣候相關風險辨別、評估和管理流程如何整合於組織整體風險管理制度。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-orange-900">{riskManagementTableData.itemC.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {riskManagementTableData.itemC.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-orange-50 rounded border border-orange-200">
                      <p className="text-sm font-medium text-orange-900">{riskManagementTableData.itemC.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 bg-green-100 font-medium text-green-900">建議揭露事項</TableHead>
                <TableHead className="bg-green-100 font-medium text-green-900">針對所有產業的指引</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="align-top bg-green-50 font-medium text-green-800">
                  建議揭露事項a) 揭露組織依據其業務的風險和管理流程進行評估的指標。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-green-900">{metricsTableData.itemA.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {metricsTableData.itemA.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-medium text-green-900">{metricsTableData.itemA.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-green-50 font-medium text-green-800">
                  建議揭露事項b) 揭露範圍1、範圍2和範圍3(如適用)溫室氣體排放和相關風險。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-green-900">{metricsTableData.itemB.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {metricsTableData.itemB.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-medium text-green-900">{metricsTableData.itemB.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-green-50 font-medium text-green-800">
                  建議揭露事項c) 描述組織在管理氣候相關風險與機會所使用的目標，以及追蹤實績執行目標的表現。
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="font-medium text-green-900">{metricsTableData.itemC.title}</p>
                    <div className="space-y-1 text-gray-500">
                      {metricsTableData.itemC.content.map((item, index) => (
                        <p key={index}>{item}</p>
                      ))}
                    </div>
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <p className="text-sm font-medium text-green-900">{metricsTableData.itemC.realContent}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDReportContent;
