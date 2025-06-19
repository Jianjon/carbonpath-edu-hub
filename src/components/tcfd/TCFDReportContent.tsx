
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

  // 根據產業生成具體的氣候風險機會情境
  const generateClimateScenarios = () => {
    const baseScenarios = [
      {
        type: 'risk',
        category: '技術',
        title: '綠色技術轉型需求大量資本投資',
        description: '技術轉型的整合技術與設備需求大量資本投資情境高對中型科技業企業營運產生重要風險影響，此情境要求企業重新評估現有營運模式，投入相當產業波導行債務進度，預計影響企業的營收格…',
        impact: '高',
        probability: '中',
        timeframe: '短期',
        financialImpact: '新台幣 3,000-5,000 萬元'
      },
      {
        type: 'opportunity',
        category: '市場',
        title: '消費者偏好轉向低碳產品，優勢產品需求下滑',
        description: '市場轉型的消費者偏好轉向低碳產品，優勢產品需求下滑情境對中型科技業企業產生重要風險影響，此情境要求企業重新評估產品策略，投入相當產業波導行債務進度，預計影響…',
        impact: '中',
        probability: '高',
        timeframe: '中期',
        financialImpact: '新台幣 2,000-3,500 萬元'
      },
      {
        type: 'risk',
        category: '能源來源',
        title: '客戶要求供應商提供低碳產品服務（如RE100）',
        description: '能源來源轉型的客戶要求供應商提供低碳產品服務（如RE100）情境對中型科技業企業產生重要發展機會，此情境要求企業重新評估供應鏈模式，投入相當產業波導行債務進度，預計…',
        impact: '中',
        probability: '高',
        timeframe: '長期',
        financialImpact: '新台幣 1,500-2,800 萬元'
      }
    ];
    return baseScenarios;
  };

  const climateScenarios = generateClimateScenarios();

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
                <TableHead className="bg-slate-100 font-medium text-slate-900">揭露內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="align-top bg-slate-50 font-medium text-slate-800">
                  建議揭露事項a) 描述董事會對氣候相關風險與機會的監督情況
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <div className="space-y-2">
                      <p className="text-slate-900">
                        本公司董事會已設立永續發展委員會，專責監督氣候相關議題，每季定期向董事會報告氣候風險管理現況及目標達成進度。作為{getChineseText(assessment.company_size)}{getChineseText(assessment.industry)}企業，本公司已將氣候議題納入年度營業計畫及重要投資決策考量。
                      </p>
                      <p className="text-gray-500 text-xs">
                        董事會下設永續發展委員會每季召開會議，審議氣候相關策略方針，並監督年度氣候目標執行進度。委員會成員包含獨立董事2名、執行董事3名，具備環境管理及風險控管專業背景。
                      </p>
                      <p className="text-gray-500 text-xs">
                        董事會每年至少接受4小時氣候相關議題教育訓練，包含國際氣候政策趨勢、TCFD架構應用及產業減碳技術發展。2023年董事會總計投入16小時進行氣候治理相關討論。
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-slate-50 font-medium text-slate-800">
                  建議揭露事項b) 描述管理層在評估和管理氣候相關風險與機會方面的角色
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <div className="space-y-2">
                      <p className="text-slate-900">
                        本公司設置永續長職位，直接向執行長報告，負責統籌氣候相關事務。已建立跨部門氣候變遷因應小組，涵蓋營運、財務、風險管理等單位，每月召開會議檢討氣候行動方案執行進度。
                      </p>
                      <p className="text-gray-500 text-xs">
                        永續長由副總經理層級主管擔任，統籌氣候策略規劃、風險評估及目標設定。跨部門小組包含研發、採購、製造、行銷及財務等8個部門代表，每月第二週召開例會。
                      </p>
                      <p className="text-gray-500 text-xs">
                        建立氣候風險管理三道防線：第一線為各營運單位自主管理，第二線為永續部門監控評估，第三線為內稽單位獨立查核。各層級均設定明確職責分工及決策權限。
                      </p>
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
            針對重大災害，揭露組織業務、策略和財務規劃中，因氣候相關風險與機會帶來的潛在及實際衝擊
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40 bg-blue-100 font-medium text-blue-900">建議揭露事項</TableHead>
                  <TableHead className="bg-blue-100 font-medium text-blue-900">揭露內容</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項a) 描述氣候相關的短期、中期和長期風險與機會
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm space-y-3">
                      <p className="text-blue-900">
                        本公司已辨識{(strategySelections?.length || 0) + 3}個重要氣候情境，時間範圍涵蓋短期(1-3年)、中期(3-10年)及長期(10年以上)。透過系統性評估，已完成對營運成本、資本支出及收入影響的財務量化分析。
                      </p>
                      <div className="space-y-2 text-gray-500 text-xs">
                        <p>短期風險(1-3年)：碳定價機制實施、綠色電力採購成本上升、客戶永續要求提高</p>
                        <p>中期風險(3-10年)：技術轉型投資需求、供應鏈碳排放管理、法規遵循成本增加</p>
                        <p>長期風險(10年以上)：極端氣候事件頻率增加、市場結構性轉變、低碳技術競爭</p>
                        <p>短期機會：開發低碳產品服務、提升能源使用效率、建立綠色品牌形象</p>
                        <p>中期機會：進入新興綠色市場、優化供應鏈成本結構、獲得綠色金融優惠</p>
                        <p>長期機會：掌握關鍵低碳技術、建立循環經濟商業模式、領導產業轉型</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項b) 描述氣候相關風險與機會對組織業務、策略和財務規劃的影響
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm space-y-3">
                      <p className="text-blue-900">
                        基於風險評估結果，本公司已調整產品服務組合，增加低碳解決方案比重，並於供應鏈導入碳足跡管理。預計未來三年投入新台幣5,000萬元於減碳技術研發，並評估設備汰換及廠區節能改善投資需求。
                      </p>
                      <div className="space-y-2 text-gray-500 text-xs">
                        <p>產品服務影響：開發節能型產品線，預計佔總營收比重由目前15%提升至2027年35%</p>
                        <p>供應鏈管理：建立供應商碳排放數據收集系統，優先採購低碳材料，預計增加採購成本3-5%</p>
                        <p>營運成本：再生能源採購預計增加電力成本8%，但長期可降低碳費支出預計每年節省600萬元</p>
                        <p>資本支出：未來5年規劃投入1.2億元進行設備升級及數位化轉型</p>
                        <p>財務規劃：申請綠色融資額度3億元，利率較一般融資低0.2-0.5%</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="align-top bg-blue-50 font-medium text-blue-800">
                    建議揭露事項c) 描述組織策略在不同氣候相關情境下的韌性
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="text-sm space-y-3">
                      <p className="text-blue-900">
                        本公司已完成2°C升溫情境下的韌性分析，制定多元化調適策略。透過情境分析確認營運模式在不同氣候路徑下的適應能力，並建立動態策略調整機制以確保長期營運韌性。
                      </p>
                      <div className="space-y-2 text-gray-500 text-xs">
                        <p>1.5°C情境：積極投資突破性低碳技術，搶佔先行者優勢，預期營收成長15-20%</p>
                        <p>2°C情境：穩健推動漸進式轉型，平衡成本與收益，維持獲利穩定成長</p>
                        <p>3°C情境：強化實體風險因應能力，分散營運據點，確保業務持續性</p>
                        <p>4°C情境：建立危機應變機制，投資調適設施，維護核心競爭力</p>
                        <p>情境敏感性分析：碳價每噸增加100元，預計影響年度獲利1.2%；極端氣候事件機率倍增，預計增加營運成本0.8%</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* 氣候風險與機會分析結果 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">本公司氣候風險與機會分析結果</h4>
              <div className="text-sm text-blue-800 mb-4">
                <p className="font-medium">本公司已辨識出{climateScenarios.length}個重要氣候相關情境，涵蓋實體風險、轉型風險及氣候機會。</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {climateScenarios.map((scenario, index) => (
                  <div key={index} className="bg-white p-4 rounded border border-blue-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={scenario.type === 'risk' ? "destructive" : "default"} className="text-xs">
                          {scenario.category}
                        </Badge>
                        <span className="text-sm font-medium text-blue-900">{scenario.title}</span>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <div>影響程度: {scenario.impact}</div>
                        <div>發生機率: {scenario.probability}</div>
                        <div>時間範圍: {scenario.timeframe}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{scenario.description}</p>
                    <div className="text-xs text-blue-700 font-medium">
                      預估財務影響: {scenario.financialImpact}
                    </div>
                  </div>
                ))}
                
                {/* 顯示用戶選擇的策略 */}
                {strategySelections && strategySelections.map((selection, index) => {
                  const [categoryName, subcategoryName] = selection.scenarioKey.split('-');
                  const isRisk = selection.analysis?.risk_strategies ? true : false;
                  
                  // 安全地獲取財務影響，避免渲染對象
                  let financialImpact = '';
                  if (selection.analysis?.financial_impact) {
                    if (typeof selection.analysis.financial_impact === 'string') {
                      financialImpact = selection.analysis.financial_impact;
                    } else if (typeof selection.analysis.financial_impact === 'object') {
                      // 這裡我們需要從對象中提取字符串值
                      financialImpact = '待進一步量化分析';
                    }
                  }
                  
                  return (
                    <div key={`user-${index}`} className="bg-white p-4 rounded border border-blue-300">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={isRisk ? "destructive" : "default"} className="text-xs">
                            {categoryName}
                          </Badge>
                          <span className="text-sm font-medium text-slate-900">{subcategoryName}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-900 mb-2">
                        {selection.analysis?.scenario_description || '情境描述'}
                      </p>
                      {financialImpact && (
                        <div className="text-xs text-slate-900 font-medium">
                          預估財務影響: {financialImpact}
                        </div>
                      )}
                    </div>
                  );
                })}
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
            揭露組織如何辨別、評估和管理氣候相關風險
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 bg-orange-100 font-medium text-orange-900">建議揭露事項</TableHead>
                <TableHead className="bg-orange-100 font-medium text-orange-900">揭露內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項a) 描述組織在氣候相關風險辨別和評估流程
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="text-orange-900">
                      本公司建立系統性氣候風險辨識流程，採用TCFD架構進行實體風險與轉型風險評估。風險評估整合至既有ERM企業風險管理制度，每年定期更新風險地圖，並依機率與衝擊程度進行分級管理。
                    </p>
                    <div className="space-y-2 text-gray-500 text-xs">
                      <p>風險辨識方法：結合專家訪談、文獻研析、標竿學習及利害關係人議合，建立風險清單</p>
                      <p>評估工具：使用定量模型分析財務衝擊，定性評估納入策略影響、營運衝擊及聲譽風險</p>
                      <p>評估頻率：每半年進行風險評估更新，重大風險事件發生時啟動緊急評估機制</p>
                      <p>評估範圍：涵蓋直接營運、供應鏈、客戶需求及法規環境等四大面向</p>
                      <p>風險分級：採用5×5風險矩陣，依發生機率及衝擊程度區分為極高、高、中、低、極低五個等級</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項b) 描述組織氣候相關風險的管理流程
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="text-orange-900">
                      本公司採用四象限風險管理策略：(1)高影響高機率風險採減緩措施 (2)高影響低機率風險採轉移策略 (3)低影響高機率風險採控制措施 (4)低影響低機率風險採接受策略。重大性門檻設定為年營收1%或新台幣500萬元以上影響。
                    </p>
                    <div className="space-y-2 text-gray-500 text-xs">
                      <p>減緩策略：投資減碳設備、開發低碳技術、優化製程效率，降低直接排放風險</p>
                      <p>轉移策略：購買氣候風險保險、簽署長期綠電合約、建立策略聯盟分散風險</p>
                      <p>控制策略：建立預警系統、制定標準作業程序、定期監控關鍵指標</p>
                      <p>接受策略：建立風險準備金、制定應變計畫、持續監控風險變化</p>
                      <p>重大性判斷：財務衝擊超過年營收1%、影響核心業務運作、法規要求必須因應的風險列為重大風險</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800">
                  建議揭露事項c) 描述氣候相關風險辨別、評估和管理流程如何整合於組織整體風險管理制度
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="text-orange-900">
                      氣候風險管理已完全整合至本公司風險管理委員會運作機制，與作業風險、財務風險、法規風險等採相同治理流程。氣候風險評估結果直接納入董事會風險報告，確保高階管理層充分掌握氣候議題對企業營運的潛在影響。
                    </p>
                    <div className="space-y-2 text-gray-500 text-xs">
                      <p>治理整合：氣候風險納入風險管理委員會季度會議議程，與其他企業風險一併討論</p>
                      <p>政策整合：氣候風險管理政策與企業風險管理政策保持一致，避免政策衝突</p>
                      <p>系統整合：氣候風險監控系統與ERM系統資料共享，提升管理效率</p>
                      <p>報告整合：氣候風險指標納入月度風險報告，提供管理層即時資訊</p>
                      <p>流程整合：氣候風險管理流程與ISO 31000風險管理標準一致，確保管理品質</p>
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
            針對重大災害，揭露用於評估和管理氣候相關風險與機會的指標和目標
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 bg-green-100 font-medium text-green-900">建議揭露事項</TableHead>
                <TableHead className="bg-green-100 font-medium text-green-900">揭露內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="align-top bg-green-50 font-medium text-green-800">
                  建議揭露事項a) 揭露組織依據其業務的風險和管理流程進行評估的指標
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="text-green-900">
                      本公司建立多維度氣候指標監控體系，包含溫室氣體排放量(範圍1、2、3)、能源使用效率、水資源利用率、廢棄物回收率等環境指標，以及綠色產品營收占比、氣候調適投資金額等機會指標。
                    </p>
                    <div className="space-y-2 text-gray-500 text-xs">
                      <p>環境指標：溫室氣體排放強度(tCO2e/百萬營收)、再生能源使用比例、用水強度、廢棄物回收率</p>
                      <p>營運指標：單位產品碳足跡、供應商碳管理評級、綠色採購比例、節能改善專案數量</p>
                      <p>財務指標：氣候相關投資金額、碳管理成本、綠色產品營收、氣候風險保險費用</p>
                      <p>風險指標：氣候風險事件發生次數、營運中斷時間、供應鏈中斷風險評級</p>
                      <p>機會指標：新市場開發進度、創新技術專利申請、客戶滿意度提升、品牌價值增長</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-green-50 font-medium text-green-800">
                  建議揭露事項b) 揭露範圍1、範圍2和範圍3溫室氣體排放和相關風險
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="text-green-900">
                      {assessment.has_carbon_inventory ? 
                        `本公司已完成溫室氣體盤查，2023年度範圍1排放量2,150公噸CO2e、範圍2排放量8,750公噸CO2e、範圍3排放量15,320公噸CO2e，總計26,220公噸CO2e。採用GHG Protocol標準進行計算，並通過第三方查證。` :
                        `本公司正建置溫室氣體盤查制度，預計於2024年完成基準年排放量盤查，後續將依GHG Protocol標準進行範圍1、2、3溫室氣體排放量統計與監控。`}
                    </p>
                    <div className="space-y-2 text-gray-500 text-xs">
                      <p>範圍1排放：公務車輛燃油使用1,200公噸CO2e、緊急發電機柴油使用950公噸CO2e</p>
                      <p>範圍2排放：外購電力使用8,750公噸CO2e，其中再生能源占比15%</p>
                      <p>範圍3排放：採購商品及服務12,500公噸CO2e、員工通勤1,800公噸CO2e、商務旅行1,020公噸CO2e</p>
                      <p>排放強度：每百萬營收排放量52.4公噸CO2e，較前年下降8.3%</p>
                      <p>查證機制：委託國際知名查證機構進行第三方查證，查證範圍涵蓋範圍1及範圍2排放</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="align-top bg-green-50 font-medium text-green-800">
                  建議揭露事項c) 描述組織在管理氣候相關風險與機會所使用的目標，以及追蹤實績執行目標的表現
                </TableCell>
                <TableCell className="align-top">
                  <div className="text-sm space-y-3">
                    <p className="text-green-900">
                      本公司設定2030年溫室氣體排放量較2023年基準年減少42%之科學基礎目標，並承諾2050年達成淨零排放。短期目標包括2025年再生能源使用比例達50%、2027年完成主要設備節能改善專案。各項目標均建立季度追蹤機制，並與員工績效考核連結。
                    </p>
                    <div className="space-y-2 text-gray-500 text-xs">
                      <p>長期目標(2050年)：達成營運淨零排放、100%再生能源使用、廢棄物零掩埋</p>
                      <p>中期目標(2030年)：溫室氣體排放減少42%(SBTi認證)、再生能源使用比例80%、水資源回收率90%</p>
                      <p>短期目標(2025年)：排放強度下降20%、再生能源比例50%、供應商100%完成碳盤查</p>
                      <p>年度目標(2024年)：排放量較前年減少5%、節能改善專案完成率100%、綠色產品營收占比25%</p>
                      <p>追蹤機制：建立數位化監控系統，每月更新目標達成率，季度檢討並調整行動方案</p>
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
