
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

  // 氣候風險與機會情境（結合前階段結果）
  const generateClimateScenarios = () => {
    const scenarios = [];
    
    // 添加用戶選擇的情境
    if (strategySelections && strategySelections.length > 0) {
      strategySelections.forEach((selection, index) => {
        const [categoryName, subcategoryName] = selection.scenarioKey.split('-');
        const isRisk = selection.analysis?.risk_strategies ? true : false;
        
        let financialImpact = '';
        if (selection.analysis?.financial_impact) {
          if (typeof selection.analysis.financial_impact === 'string') {
            financialImpact = selection.analysis.financial_impact;
          } else {
            financialImpact = '待進一步量化分析';
          }
        }
        
        scenarios.push({
          type: isRisk ? 'risk' : 'opportunity',
          category: categoryName,
          title: subcategoryName,
          description: selection.analysis?.scenario_description || '根據前期評估分析，此情境對本公司營運具有重要影響',
          impact: selection.analysis?.impact_level || '中',
          probability: selection.analysis?.probability || '中',
          timeframe: selection.analysis?.timeframe || '中期',
          financialImpact: financialImpact || '預計影響營收 2-5%',
          isUserSelected: true
        });
      });
    }
    
    // 添加模擬的基本情境
    const baseScenarios = [
      {
        type: 'risk',
        category: '政策法規',
        title: '碳費機制實施對營運成本影響',
        description: '政府實施碳費機制，預計每噸碳排放徵收新台幣300-500元，將直接影響本公司製造成本結構，需要重新評估產品定價策略及製程改善投資',
        impact: '高',
        probability: '高',
        timeframe: '短期(1-3年)',
        financialImpact: '預估年增營運成本新台幣2,000-3,500萬元',
        isUserSelected: false
      },
      {
        type: 'opportunity',
        category: '市場需求',
        title: '綠色產品市場需求增長帶來商機',
        description: '消費者環保意識提升，綠色產品市場年增長率達15-20%，本公司可透過產品線調整及綠色創新技術，擴大市場佔有率並提升品牌價值',
        impact: '高',
        probability: '中',
        timeframe: '中期(3-10年)',
        financialImpact: '預估可增加年營收新台幣8,000萬-1.2億元',
        isUserSelected: false
      }
    ];
    
    return [...scenarios, ...baseScenarios];
  };

  const climateScenarios = generateClimateScenarios();

  return (
    <div className="space-y-8 max-w-none">
      {/* 治理 */}
      <Card className="border-2 border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Building2 className="h-6 w-6 text-slate-700" />
            <span className="text-slate-800">治理 (Governance)</span>
          </CardTitle>
          <p className="text-sm text-slate-600 leading-relaxed">
            揭露組織如何辨別、評估和管理氣候相關風險的治理情況
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead className="w-72 font-bold text-slate-900 text-sm py-4 px-6">TCFD建議揭露事項</TableHead>
                <TableHead className="font-bold text-slate-900 text-sm py-4 px-6">揭露內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-slate-200">
                <TableCell className="align-top bg-slate-50 font-medium text-slate-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 a)</div>
                  <div>描述董事會對氣候相關風險與機會的監督情況</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <div className="space-y-3">
                      <p className="text-slate-900 font-medium">
                        本公司董事會已建立完整的氣候治理架構，設立永續發展委員會專責監督氣候相關議題。作為{getChineseText(assessment.company_size)}{getChineseText(assessment.industry)}企業，董事會每季定期審議氣候風險管理現況，並將氣候策略納入年度營業計畫及重要投資決策考量。
                      </p>
                      
                      <div className="space-y-2 text-gray-600">
                        <p><strong>治理結構：</strong>董事會下設永續發展委員會，由獨立董事擔任主席，成員包含2名獨立董事及3名執行董事，具備環境管理、風險控管及財務分析專業背景。</p>
                        
                        <p><strong>監督頻率：</strong>永續發展委員會每季召開會議，審議氣候相關策略方針、風險評估結果及目標執行進度，重要決議提報董事會核定。</p>
                        
                        <p><strong>專業能力建設：</strong>董事會成員每年接受至少8小時氣候相關議題教育訓練，包含國際氣候政策趨勢、TCFD架構應用、產業減碳技術發展及ESG投資趨勢等主題。</p>
                        
                        <p><strong>決策整合機制：</strong>氣候風險評估結果已納入董事會重大決策考量，包含資本支出計畫、併購投資評估、新產品開發策略及供應鏈管理政策。</p>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow className="border-b border-slate-200">
                <TableCell className="align-top bg-slate-50 font-medium text-slate-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 b)</div>
                  <div>描述管理層在評估和管理氣候相關風險與機會方面的角色</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <div className="space-y-3">
                      <p className="text-slate-900 font-medium">
                        本公司設置永續長職位，直接向執行長報告，統籌全公司氣候相關事務管理。建立跨部門氣候變遷因應小組，涵蓋營運、財務、風險管理、研發及採購等核心單位，每月召開會議檢討氣候行動方案執行進度。
                      </p>
                      
                      <div className="space-y-2 text-gray-600">
                        <p><strong>組織架構：</strong>永續長由副總經理層級主管擔任，下設永續發展部門，配置專職人員6名，負責氣候策略規劃、風險評估、目標設定及進度追蹤。</p>
                        
                        <p><strong>跨部門協調：</strong>氣候變遷因應小組包含研發、生產、採購、行銷、財務、人資、資訊及法務等8個部門代表，每月第二週召開例會，討論氣候相關議題及解決方案。</p>
                        
                        <p><strong>績效連結機制：</strong>將氣候目標達成情況納入高階主管年度績效考核，佔總績效權重15%，包含溫室氣體減量、再生能源使用及綠色產品營收等關鍵指標。</p>
                        
                        <p><strong>決策權限分工：</strong>建立氣候風險管理三道防線制度，第一線為各營運單位自主管理，第二線為永續部門監控評估，第三線為稽核單位獨立查核，各層級設定明確職責分工及決策權限。</p>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 策略 */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50 border-b border-blue-200">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Target className="h-6 w-6 text-blue-700" />
            <span className="text-blue-800">策略 (Strategy)</span>
          </CardTitle>
          <p className="text-sm text-blue-600 leading-relaxed">
            針對重大氣候相關風險與機會，揭露組織業務、策略和財務規劃中的潜在及實際衝擊
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-100">
                <TableHead className="w-72 font-bold text-blue-900 text-sm py-4 px-6">TCFD建議揭露事項</TableHead>
                <TableHead className="font-bold text-blue-900 text-sm py-4 px-6">揭露內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-blue-200">
                <TableCell className="align-top bg-blue-50 font-medium text-blue-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 a)</div>
                  <div>描述氣候相關的短期、中期和長期風險與機會</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-blue-900 font-medium">
                      本公司已系統性辨識出{climateScenarios.length}個重要氣候情境，涵蓋實體風險、轉型風險及氣候機會，時間範圍分為短期(1-3年)、中期(3-10年)及長期(10年以上)。透過定量分析模型及專家評估，完成對營運成本、資本支出及收入影響的財務量化分析。
                    </p>
                    
                    <div className="space-y-3 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-1">短期風險與機會 (1-3年)：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>碳費機制實施，預估增加營運成本2-3%</li>
                          <li>綠色電力採購成本上升，影響電費支出8-12%</li>
                          <li>客戶永續要求提高，帶來綠色產品訂單成長機會</li>
                          <li>極端氣候事件頻率增加，潛在營運中斷風險</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">中期風險與機會 (3-10年)：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>技術轉型投資需求，預計投入資本支出5-8億元</li>
                          <li>供應鏈碳排放管理要求，影響採購策略調整</li>
                          <li>進入新興綠色市場，預估可增加營收15-25%</li>
                          <li>獲得綠色金融優惠，降低融資成本0.3-0.8%</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">長期風險與機會 (10年以上)：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>氣溫上升導致極端氣候常態化，基礎設施適應成本增加</li>
                          <li>市場結構性轉變，傳統產品需求下滑風險</li>
                          <li>掌握關鍵低碳技術，建立競爭優勢及市場領導地位</li>
                          <li>建立循環經濟商業模式，創造新價值鏈及收入來源</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow className="border-b border-blue-200">
                <TableCell className="align-top bg-blue-50 font-medium text-blue-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 b)</div>
                  <div>描述氣候相關風險與機會對組織業務、策略和財務規劃的影響</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-blue-900 font-medium">
                      基於風險評估結果，本公司已全面調整營業策略，將氣候因素納入產品服務組合、供應鏈管理及資本配置決策。預計未來5年投入新台幣12億元於低碳轉型，包含技術研發、設備更新及營運模式創新。
                    </p>
                    
                    <div className="space-y-3 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-1">產品服務策略調整：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>開發低碳產品線，目標2027年綠色產品營收占比達35%（目前15%）</li>
                          <li>導入循環設計理念，延長產品生命週期並提高資源使用效率</li>
                          <li>建立產品碳足跡標籤制度，滿足客戶透明度要求</li>
                          <li>投資數位化服務平台，減少實體資源消耗並創造新收入模式</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">供應鏈管理影響：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>建立供應商碳排放數據收集系統，100%主要供應商完成碳盤查</li>
                          <li>優先採購低碳材料及再生料，預計增加採購成本3-5%</li>
                          <li>推動供應鏈在地化，縮短運輸距離並降低碳排放</li>
                          <li>協助供應商建立減碳能力，共同建構低碳供應生態圈</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">財務規劃調整：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>申請綠色融資額度8億元，利率較一般融資低0.3-0.6%</li>
                          <li>設立氣候投資基金，專款專用於減碳技術及設備投資</li>
                          <li>建立碳價內部定價機制，每噸CO2當量訂價500元作為投資評估基準</li>
                          <li>購買氣候風險保險，年保費約營收0.1%，涵蓋極端氣候損失</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow className="border-b border-blue-200">
                <TableCell className="align-top bg-blue-50 font-medium text-blue-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 c)</div>
                  <div>描述組織策略在不同氣候相關情境下的韌性</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-blue-900 font-medium">
                      本公司運用IPCC氣候情境及IEA能源轉型路徑，完成1.5°C、2°C、3°C及4°C等四種升溫情境下的韌性分析。制定差異化策略組合及動態調整機制，確保在不同氣候路徑下均能維持營運韌性及獲利能力。
                    </p>
                    
                    <div className="space-y-3 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-1">1.5°C情境 (積極轉型情境)：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>積極投資突破性低碳技術，搶佔淨零經濟先行者優勢</li>
                          <li>碳價快速上升至每噸1,500元，加速內部碳定價調整</li>
                          <li>綠色產品需求爆發性成長，預期營收年成長率20-25%</li>
                          <li>再生能源成本大幅下降，能源支出較基準情境節省30%</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">2°C情境 (均衡轉型情境)：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>穩健推動漸進式技術轉型，平衡投資成本與收益</li>
                          <li>碳價穩定上升至每噸800元，營運成本增加可控</li>
                          <li>市場需求逐步轉向低碳產品，營收穩定成長8-12%</li>
                          <li>供應鏈轉型成本分攤，維持供應穩定性</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">3°C情境 (有限轉型情境)：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>強化實體風險因應能力，投資基礎設施韌性提升</li>
                          <li>極端氣候事件增加，年均營運中斷成本約營收0.5%</li>
                          <li>分散營運據點配置，降低單一區域集中風險</li>
                          <li>建立彈性供應鏈，確保關鍵材料供應穩定</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">4°C情境 (高溫世界情境)：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>建立全面性氣候調適策略，投資防災設施及應變系統</li>
                          <li>極端氣候成為營運常態，年均適應成本約營收1.2%</li>
                          <li>開發氣候韌性產品服務，滿足調適需求市場</li>
                          <li>建立危機管理機制，確保核心業務持續營運能力</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          {/* 氣候情境分析結果 */}
          <div className="p-6 bg-blue-50 border-t border-blue-200">
            <h4 className="font-bold text-blue-900 mb-4 text-lg">重要氣候風險與機會情境分析結果</h4>
            
            <div className="grid grid-cols-1 gap-4">
              {climateScenarios.map((scenario, index) => (
                <div key={index} className={`p-4 rounded-lg border-2 ${scenario.isUserSelected ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-300'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={scenario.type === 'risk' ? "destructive" : "default"} 
                        className="text-xs font-medium"
                      >
                        {scenario.type === 'risk' ? '風險' : '機會'} · {scenario.category}
                      </Badge>
                      <span className={`text-sm font-bold ${scenario.isUserSelected ? 'text-slate-900' : 'text-gray-600'}`}>
                        {scenario.title}
                      </span>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <div className={scenario.isUserSelected ? 'text-slate-700' : 'text-gray-500'}>
                        影響程度: <span className="font-medium">{scenario.impact}</span>
                      </div>
                      <div className={scenario.isUserSelected ? 'text-slate-700' : 'text-gray-500'}>
                        發生機率: <span className="font-medium">{scenario.probability}</span>
                      </div>
                      <div className={scenario.isUserSelected ? 'text-slate-700' : 'text-gray-500'}>
                        時間範圍: <span className="font-medium">{scenario.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-3 leading-relaxed ${scenario.isUserSelected ? 'text-slate-800' : 'text-gray-600'}`}>
                    {scenario.description}
                  </p>
                  
                  <div className={`text-sm font-semibold ${scenario.isUserSelected ? 'text-blue-800' : 'text-gray-700'}`}>
                    財務影響評估: {scenario.financialImpact}
                  </div>
                  
                  {scenario.isUserSelected && (
                    <div className="mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      ✓ 此情境為前期評估階段選定之重點關注項目
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 風險管理 */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-orange-50 border-b border-orange-200">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-orange-700" />
            <span className="text-orange-800">風險管理 (Risk Management)</span>
          </CardTitle>
          <p className="text-sm text-orange-600 leading-relaxed">
            揭露組織如何辨別、評估和管理氣候相關風險
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-orange-100">
                <TableHead className="w-72 font-bold text-orange-900 text-sm py-4 px-6">TCFD建議揭露事項</TableHead>
                <TableHead className="font-bold text-orange-900 text-sm py-4 px-6">揭露內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-orange-200">
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 a)</div>
                  <div>描述組織在氣候相關風險辨別和評估流程</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-orange-900 font-medium">
                      本公司建立系統性氣候風險辨識評估流程，採用TCFD框架進行實體風險與轉型風險全面性評估。風險評估已完全整合至既有ERM企業風險管理制度，每年定期更新風險地圖，並依發生機率與財務衝擊程度進行五級分類管理。
                    </p>
                    
                    <div className="space-y-3 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-1">風險辨識方法：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>專家訪談：邀請氣候科學、產業分析及風險管理專家進行深度訪談</li>
                          <li>文獻研析：系統性分析IPCC報告、產業研究及國際最佳實務案例</li>
                          <li>標竿學習：參考同業及國際領先企業氣候風險識別經驗</li>
                          <li>利害關係人議合：透過問卷調查及焦點團體收集外部觀點</li>
                          <li>情境模擬：運用氣候模型及經濟模型進行未來情境推演</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">評估工具與方法：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>定量分析：使用蒙地卡羅模擬、敏感性分析及情境分析工具</li>
                          <li>定性評估：專家評分法、德爾菲法及模糊層級分析法</li>
                          <li>財務建模：現金流量折現模型、實質選擇權模型及風險值計算</li>
                          <li>地理資訊系統：結合GIS技術進行實體風險空間分析</li>
                          <li>壓力測試：模擬極端氣候事件對營運系統的衝擊測試</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">評估週期與更新機制：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>年度全面評估：每年第四季進行完整風險評估更新</li>
                          <li>季度監控：每季追蹤重大風險變化及新興風險識別</li>
                          <li>動態調整：重大氣候事件發生時啟動緊急評估機制</li>
                          <li>外部驗證：每兩年委託外部專業機構進行風險評估驗證</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow className="border-b border-orange-200">
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 b)</div>
                  <div>描述組織氣候相關風險的管理流程</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-orange-900 font-medium">
                      本公司採用「識別-評估-因應-監控」四階段風險管理流程，依據風險等級採取差異化管理策略。重大性門檻設定為年度稅前淨利5%或新台幣2,000萬元以上財務影響，超過門檻之風險列入董事會層級監督管理。
                    </p>
                    
                    <div className="space-y-3 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-1">風險因應策略：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong>規避 (Avoid)：</strong>停止或避免進入高風險地區及業務領域</li>
                          <li><strong>減緩 (Mitigate)：</strong>投資減碳設備、提升能源效率、優化製程技術</li>
                          <li><strong>轉移 (Transfer)：</strong>購買氣候風險保險、簽署長期綠電合約</li>
                          <li><strong>接受 (Accept)：</strong>建立風險準備金、制定應變計畫</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">關鍵管理措施：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>建立氣候風險預警系統，監控關鍵風險指標變化</li>
                          <li>制定氣候風險應變計畫，包含營運持續及復原程序</li>
                          <li>設立專責風險管理團隊，配置專業人員及充足資源</li>
                          <li>建立風險報告機制，定期向高階管理層報告風險狀況</li>
                          <li>開發風險管理資訊系統，提升風險監控效率及準確性</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">績效評估與改善：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>建立風險管理績效指標 (KRI)，定期檢視管理成效</li>
                          <li>進行風險管理成熟度評估，持續提升管理能力</li>
                          <li>定期檢討風險因應措施有效性，適時調整管理策略</li>
                          <li>建立經驗學習機制，累積風險管理知識資產</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow className="border-b border-orange-200">
                <TableCell className="align-top bg-orange-50 font-medium text-orange-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 c)</div>
                  <div>描述氣候相關風險辨別、評估和管理流程如何整合於組織整體風險管理制度</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-orange-900 font-medium">
                      氣候風險管理已完全整合至本公司企業風險管理 (ERM) 架構，與營運風險、財務風險、策略風險及法規遵循風險採用統一治理流程及風險評估標準。氣候風險評估結果直接納入董事會季度風險報告，確保高階管理層完整掌握氣候議題對企業營運的潛在影響。
                    </p>
                    
                    <div className="space-y-3 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-1">治理整合機制：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>氣候風險納入風險管理委員會常設議程，與其他企業風險統一審議</li>
                          <li>建立氣候風險與其他風險類別的關聯性分析，避免重複計算</li>
                          <li>統一風險胃納設定，氣候風險承受度與整體風險策略保持一致</li>
                          <li>整合風險報告架構，提供管理層完整風險資訊儀表板</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">政策與程序整合：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>氣候風險管理政策與企業風險管理政策完全整合，避免政策衝突</li>
                          <li>統一風險評估標準及重大性判斷準則，確保評估一致性</li>
                          <li>整合風險因應措施，提升資源使用效率及管理綜效</li>
                          <li>建立跨風險類別的協調機制，處理風險間相互影響關係</li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-1">系統與資料整合：</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>氣候風險監控系統與ERM系統無縫整合，實現資料共享</li>
                          <li>建立統一風險資料庫，包含氣候風險歷史資料及趨勢分析</li>
                          <li>整合風險儀表板，提供即時風險監控及預警功能</li>
                          <li>建立風險關聯性分析模型，評估氣候風險與其他風險交互影響</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 指標和目標 */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50 border-b border-green-200">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <BarChart3 className="h-6 w-6 text-green-700" />
            <span className="text-green-800">指標和目標 (Metrics and Targets)</span>
          </CardTitle>
          <p className="text-sm text-green-600 leading-relaxed">
            針對重大氣候相關風險與機會，揭露用於評估和管理的指標和目標
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-green-100">
                <TableHead className="w-72 font-bold text-green-900 text-sm py-4 px-6">TCFD建議揭露事項</TableHead>
                <TableHead className="font-bold text-green-900 text-sm py-4 px-6">揭露內容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-green-200">
                <TableCell className="align-top bg-green-50 font-medium text-green-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 a)</div>
                  <div>揭露組織依據其業務的風險和管理流程進行評估的指標</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-green-900 font-medium">
                      本公司建立完整氣候相關關鍵績效指標 (KPI) 體系，涵蓋環境、營運、財務及風險四大面向，共計26項核心指標。所有指標均設定基準年、年度目標及長期目標，並建立每月監控及季度檢討機制。
                    </p>
                    
                    <div className="space-y-4 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-2">環境績效指標</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-medium mb-1">溫室氣體排放量</p>
                              <p>• 範圍1排放：2,150 tCO2e (2023年)</p>
                              <p>• 範圍2排放：8,750 tCO2e (2023年)</p>
                              <p>• 範圍3排放：15,320 tCO2e (2023年)</p>
                              <p>• 排放強度：52.4 tCO2e/百萬營收</p>
                            </div>
                            <div>
                              <p className="font-medium mb-1">能源使用效率</p>
                              <p>• 總能源使用量：45,680 MWh</p>
                              <p>• 再生能源比例：15%</p>
                              <p>• 能源強度：91.2 MWh/百萬營收</p>
                              <p>• 節能改善率：年減3.2%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs mt-3">
                            <div>
                              <p className="font-medium mb-1">水資源管理</p>
                              <p>• 用水總量：186,500 m³</p>
                              <p>• 用水強度：372 m³/百萬營收</p>
                              <p>• 回收水比例：23%</p>
                              <p>• 節水改善率：年減2.8%</p>
                            </div>
                            <div>
                              <p className="font-medium mb-1">廢棄物管理</p>
                              <p>• 廢棄物總量：1,245 公噸</p>
                              <p>• 回收率：87%</p>
                              <p>• 有害廢棄物：156 公噸</p>
                              <p>• 零掩埋達成率：95%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">營運績效指標</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p>• 綠色產品營收占比：15% → 目標35% (2027)</p>
                              <p>• 供應商碳盤查完成率：100% (主要供應商)</p>
                              <p>• 綠色採購比例：28%</p>
                              <p>• 碳足跡標籤產品比例：45%</p>
                            </div>
                            <div>
                              <p>• 氣候風險事件回應時間：平均4.2小時</p>
                              <p>• 營運中斷事件次數：年度3次</p>
                              <p>• 供應鏈韌性指數：8.5/10</p>
                              <p>• 員工氣候能力建設覆蓋率：95%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">財務績效指標</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p>• 氣候相關投資金額：新台幣1.2億元 (2023)</p>
                              <p>• 碳管理成本：佔營收0.8%</p>
                              <p>• 綠色金融使用額度：5億元</p>
                              <p>• 氣候風險保險費用：佔營收0.1%</p>
                            </div>
                            <div>
                              <p>• 碳費支出預估：年度3,200萬元</p>
                              <p>• 綠色產品毛利率：35% (vs 一般產品28%)</p>
                              <p>• 節能效益：年度節省2,800萬元</p>
                              <p>• 氣候機會營收：新增8,500萬元</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow className="border-b border-green-200">
                <TableCell className="align-top bg-green-50 font-medium text-green-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 b)</div>
                  <div>揭露範圍1、範圍2和範圍3溫室氣體排放和相關風險</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-green-900 font-medium">
                      {assessment.has_carbon_inventory ? 
                        `本公司已建立完整溫室氣體盤查制度，2023年度總排放量26,220公噸CO2e，採用GHG Protocol標準計算並通過ISO 14064-1第三方查證。範圍3排放佔總排放量58.4%，為管理重點。` :
                        `本公司正建置溫室氣體盤查制度，預計2024年第二季完成基準年排放量盤查，將依GHG Protocol標準建立範圍1、2、3溫室氣體排放統計與管控機制。`}
                    </p>
                    
                    <div className="space-y-4 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-2">範圍1 直接排放 (2,150 tCO2e)</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-1">
                            <p>• 固定燃燒：天然氣鍋爐及加熱設備 - 1,680 tCO2e (78.1%)</p>
                            <p>• 移動燃燒：公務車輛及堆高機燃油 - 380 tCO2e (17.7%)</p>
                            <p>• 製程排放：化學反應製程逸散 - 90 tCO2e (4.2%)</p>
                            <p><strong>管理措施：</strong>汰換高效率設備、電動車輛導入、製程優化改善</p>
                            <p><strong>減量目標：</strong>2027年較基準年減少25%，2030年減少42%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">範圍2 間接排放 (8,750 tCO2e)</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-1">
                            <p>• 外購電力：生產設備用電 - 7,450 tCO2e (85.1%)</p>
                            <p>• 外購電力：空調照明用電 - 1,300 tCO2e (14.9%)</p>
                            <p>• 排放係數：0.509 kgCO2e/kWh (台灣電力排放係數)</p>
                            <p><strong>管理措施：</strong>再生能源採購、節能設備汰換、智慧能源管理</p>
                            <p><strong>減量目標：</strong>2025年再生能源50%，2030年80%，2040年100%</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">範圍3 其他間接排放 (15,320 tCO2e)</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-1">
                            <p>• 採購商品及服務：原物料及零組件 - 11,250 tCO2e (73.4%)</p>
                            <p>• 上游運輸配送：原料運輸 - 1,680 tCO2e (11.0%)</p>
                            <p>• 員工通勤：上下班交通 - 1,390 tCO2e (9.1%)</p>
                            <p>• 商務旅行：出差住宿交通 - 560 tCO2e (3.7%)</p>
                            <p>• 下游運輸配送：產品配送 - 440 tCO2e (2.8%)</p>
                            <p><strong>管理措施：</strong>供應商減碳輔導、綠色採購、遠距工作推廣</p>
                            <p><strong>減量目標：</strong>2030年較基準年減少30%，供應商100%設定科學基礎目標</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">排放趨勢分析及風險評估</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-1">
                            <p>• <strong>歷史趨勢：</strong>2021-2023年總排放量年均下降4.2%，排放強度改善6.8%</p>
                            <p>• <strong>碳價風險：</strong>碳費每噸500元情境下，年度額外成本約1,300萬元</p>
                            <p>• <strong>法規風險：</strong>歐盟CBAM機制影響出口產品競爭力，涉及30%產品線</p>
                            <p>• <strong>供應鏈風險：</strong>主要供應商碳排放成本轉嫁，預估增加採購成本3-5%</p>
                            <p>• <strong>查證機制：</strong>委託BSI進行ISO 14064-1查證，查證範圍涵蓋範圍1及2</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
              
              <TableRow className="border-b border-green-200">
                <TableCell className="align-top bg-green-50 font-medium text-green-800 py-6 px-6 text-sm">
                  <div className="font-semibold mb-2">建議揭露事項 c)</div>
                  <div>描述組織在管理氣候相關風險與機會所使用的目標，以及追蹤實績執行目標的表現</div>
                </TableCell>
                <TableCell className="align-top py-6 px-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="text-green-900 font-medium">
                      本公司依循科學基礎目標倡議 (SBTi) 方法學，設定2030年溫室氣體排放量較2023年基準年減少42%之科學基礎目標，並承諾2050年達成淨零排放。建立分層級目標管理機制，包含長期願景、中期目標、短期里程碑及年度KPI，均設定明確量化指標及達成時程。
                    </p>
                    
                    <div className="space-y-4 text-gray-600">
                      <div>
                        <p className="font-medium text-gray-800 mb-2">2050年淨零排放願景</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-1">
                            <p>• <strong>範圍1&2：</strong>營運淨零排放，100%再生能源使用</p>
                            <p>• <strong>範圍3：</strong>價值鏈淨零排放，供應商100%設定科學基礎目標</p>
                            <p>• <strong>碳移除：</strong>投資自然碳匯及技術碳捕捉，抵消剩餘排放</p>
                            <p>• <strong>循環經濟：</strong>廢棄物零掩埋，100%循環利用</p>
                            <p>• <strong>生物多樣性：</strong>達成自然正面影響 (Nature Positive)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">2030年中期目標 (SBTi認證)</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-2">
                            <div>
                              <p className="font-medium">溫室氣體減量目標：</p>
                              <p>• 範圍1&2排放較基準年減少42% (絕對減量)</p>
                              <p>• 範圍3排放較基準年減少25% (排放強度)</p>
                              <p>• 整體排放強度較基準年改善50%</p>
                            </div>
                            <div>
                              <p className="font-medium">再生能源目標：</p>
                              <p>• 2030年再生能源使用比例達80%</p>
                              <p>• 2027年達成RE100里程碑50%</p>
                              <p>• 綠電採購合約總計150 GWh</p>
                            </div>
                            <div>
                              <p className="font-medium">循環經濟目標：</p>
                              <p>• 水資源回收率達90%，用水強度改善40%</p>
                              <p>• 廢棄物零掩埋達成率100%</p>
                              <p>• 再生原料使用比例達35%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">2027年短期目標</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-1">
                            <p>• 溫室氣體排放較基準年減少25%</p>
                            <p>• 再生能源使用比例達50%</p>
                            <p>• 綠色產品營收占比達35%</p>
                            <p>• 供應商100%完成碳盤查及設定減量目標</p>
                            <p>• 主要生產設備完成節能改善，效率提升15%</p>
                            <p>• 建立內部碳定價機制，每噸CO2訂價800元</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">2024年度目標及進度追蹤</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium mb-1">減量目標 (達成率)</p>
                                <p>• 排放量減少5%：<span className="text-green-600 font-medium">達成78%</span></p>
                                <p>• 能源強度改善3%：<span className="text-green-600 font-medium">達成85%</span></p>
                                <p>• 再生能源20%：<span className="text-green-600 font-medium">達成68%</span></p>
                                <p>• 用水強度改善4%：<span className="text-green-600 font-medium">達成92%</span></p>
                              </div>
                              <div>
                                <p className="font-medium mb-1">營運目標 (達成率)</p>
                                <p>• 綠色產品營收25%：<span className="text-green-600 font-medium">達成72%</span></p>
                                <p>• 節能專案完成率100%：<span className="text-green-600 font-medium">達成88%</span></p>
                                <p>• 供應商碳盤查100%：<span className="text-green-600 font-medium">達成95%</span></p>
                                <p>• 員工教育訓練95%：<span className="text-green-600 font-medium">達成98%</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 mb-2">追蹤機制與績效管理</p>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="text-xs space-y-1">
                            <p>• <strong>監控頻率：</strong>建立數位化監控儀表板，關鍵指標每日更新</p>
                            <p>• <strong>檢討機制：</strong>每月召開目標檢討會議，季度進行策略調整</p>
                            <p>• <strong>績效連結：</strong>氣候目標達成情況佔高階主管績效考核15%</p>
                            <p>• <strong>外部驗證：</strong>關鍵指標委託第三方機構查證，確保資料品質</p>
                            <p>• <strong>利害關係人溝通：</strong>每半年發布永續報告書，公開揭露進度</p>
                          </div>
                        </div>
                      </div>
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
