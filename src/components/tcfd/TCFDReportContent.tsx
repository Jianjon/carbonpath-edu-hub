
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment } from '@/types/tcfd';
import { Building2, Target, TrendingUp, BarChart3, AlertTriangle, CheckCircle, DollarSign, Calculator } from 'lucide-react';

interface SelectedStrategyData {
  scenarioKey: string;
  riskOpportunityId: string;
  strategy: string;
  scenarioDescription: string;
  categoryType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  notes: string;
}

interface TCFDReportContentProps {
  assessment: TCFDAssessment;
  strategySelections: SelectedStrategyData[];
  userModifications?: Record<string, string>;
}

const TCFDReportContent = ({ assessment, strategySelections, userModifications }: TCFDReportContentProps) => {
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

  const industryName = getChineseText(assessment.industry);
  const companySize = getChineseText(assessment.company_size);

  // 策略類型映射
  const strategyMapping: Record<string, string> = {
    'mitigate': '減緩策略',
    'transfer': '轉移策略',
    'accept': '接受策略',
    'control': '控制策略',
    'explore': '探索策略',
    'build': '建設策略',
    'transform': '轉換策略',
    'collaborate': '合作策略',
    'invest': '投入策略'
  };

  const riskSelections = strategySelections.filter(s => s.categoryType === 'risk');
  const opportunitySelections = strategySelections.filter(s => s.categoryType === 'opportunity');

  // 生成財務影響分析內容
  const generateFinancialAnalysisContent = (selection: SelectedStrategyData) => {
    const strategyName = strategyMapping[selection.strategy] || selection.strategy;
    const isRisk = selection.categoryType === 'risk';
    
    return (
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h6 className="font-medium text-blue-800 mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-2" />
          財務影響分析
        </h6>
        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-blue-700">損益表影響：</span>
            <span className="text-red-600">
              {isRisk ? '可能增加營運成本或影響營收' : '預期創造新營收機會'}
              （建議計算：年度影響金額 ÷ 總營收 × 100%）
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">現金流影響：</span>
            <span className="text-red-600">
              {isRisk ? '需要準備應變資金' : '可能產生正向現金流'}
              （建議評估：每季現金需求變動 ± X 萬元）
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">資產負債表影響：</span>
            <span className="text-red-600">
              可能影響資產價值或負債結構
              （建議檢視：相關資產減損風險評估）
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-700">策略執行成本：</span>
            <span className="text-red-600">
              實施{strategyName}預估需投入資源
              （建議估算：人力成本 + 系統成本 + 外部諮詢費用）
            </span>
          </div>
        </div>
        {userModifications?.[selection.scenarioKey] && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <span className="font-medium text-blue-700 text-sm">企業補充說明：</span>
            <p className="text-sm text-blue-800 mt-1">{userModifications[selection.scenarioKey]}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 模擬說明區塊 - 增強版 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span>模擬評估說明</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-800 mb-3">企業背景與評估條件</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">企業規模：</span>
                <span className="text-red-600 font-medium">{companySize}企業</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">所屬產業：</span>
                <span className="text-red-600 font-medium">{industryName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">碳盤查狀況：</span>
                <span className="text-red-600 font-medium">
                  {assessment.has_carbon_inventory ? '已完成' : '尚未完成'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">國際營運：</span>
                <span className="text-red-600 font-medium">
                  {assessment.has_international_operations === true ? '是' : 
                   assessment.has_international_operations === false ? '否' : '未提供'}
                </span>
              </div>
              {assessment.annual_revenue_range && (
                <div>
                  <span className="font-medium text-gray-700">營業額範圍：</span>
                  <span className="text-red-600 font-medium">{assessment.annual_revenue_range}</span>
                </div>
              )}
              {assessment.main_emission_source && (
                <div>
                  <span className="font-medium text-gray-700">主要排放源：</span>
                  <span className="text-red-600 font-medium">{assessment.main_emission_source}</span>
                </div>
              )}
            </div>
            
            {assessment.business_description && (
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <span className="font-medium text-gray-700">營運簡述：</span>
                <p className="text-red-600 mt-1 text-sm leading-relaxed">
                  {assessment.business_description}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-800 mb-3">模擬評估結果概要</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>
                  風險情境：<span className="text-red-600 font-medium">{riskSelections.length}</span> 項
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  機會情境：<span className="text-red-600 font-medium">{opportunitySelections.length}</span> 項
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  策略組合：<span className="text-red-600 font-medium">{strategySelections.length}</span> 個
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h5 className="font-medium text-gray-800 mb-2 text-sm">評估範圍與方法說明</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• 本評估採用 TCFD 建議框架，涵蓋治理、策略، 風險管理及指標目標四大面向</li>
                <li>• <span className="text-red-600 font-medium">風險機會識別基於{industryName}特性</span>，結合氣候科學情境進行分析</li>
                <li>• <span className="text-red-600 font-medium">策略建議考量{companySize}企業資源條件</span>，提供階段性實施建議</li>
                <li>• 財務影響分析提供計算方法指引，協助企業進行量化評估</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-yellow-700 bg-yellow-100 p-3 rounded border border-yellow-300">
            <strong>重要說明：</strong>本報告內容為基於輸入條件的模擬評估結果。
            <span className="text-red-600 font-medium">紅色標註文字</span>為根據您的企業背景與選擇條件所產生的客製化內容，
            黑色文字為依據 TCFD 框架提供的標準分析架構。實際應用時請結合企業真實營運資料與財務數據進行調整與驗證。
          </div>
        </CardContent>
      </Card>

      {/* TCFD 四大揭露面向 */}
      <div className="grid gap-8">
        {/* 治理 (Governance) */}
        <Card>
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Building2 className="h-6 w-6" />
              <span>治理面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">董事會監督機制</h4>
              <p className="text-gray-700 leading-relaxed">
                董事會應建立氣候相關風險與機會的監督機制，確保氣候議題納入企業策略決策流程。
                <span className="text-red-600"> 建議{companySize}企業設立氣候變遷專責委員會或指派專責董事</span>，
                定期檢視氣候風險評估結果與因應策略執行成效。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">管理階層職責分工</h4>
              <p className="text-gray-700 leading-relaxed">
                管理階層應負責氣候相關風險與機會的日常管理，建立跨部門協調機制。
                <span className="text-red-600"> 針對{industryName}特性，建議設立永續發展部門或指派專責人員</span>，
                負責氣候風險識別、評估與管理工作的執行。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 策略 (Strategy) */}
        <Card>
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Target className="h-6 w-6" />
              <span>策略面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">風險與機會識別分析</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                企業應系統性識別與評估氣候相關風險與機會對營運的潛在影響。
                <span className="text-red-600"> 本次評估識別出 {strategySelections.length} 個關鍵情境</span>，
                涵蓋實體風險、轉型風險與氣候機會等面向。
              </p>

              {/* 風險情境 */}
              {riskSelections.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-red-600 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    識別之氣候風險情境與財務分析
                  </h5>
                  <div className="space-y-4">
                    {riskSelections.map((selection, index) => (
                      <div key={selection.scenarioKey} className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-medium text-red-800">
                            風險情境 {index + 1}：<span className="text-red-600">{selection.categoryName}</span>
                          </h6>
                          <Badge variant="destructive" className="text-xs">
                            {strategyMapping[selection.strategy] || selection.strategy}
                          </Badge>
                        </div>
                        <p className="text-sm text-red-700 leading-relaxed mb-3">
                          <span className="text-red-600 font-medium">{selection.subcategoryName}</span> - {selection.scenarioDescription}
                        </p>
                        {selection.notes && (
                          <div className="mb-3 p-2 bg-red-100 rounded border border-red-300">
                            <span className="text-xs text-red-600 font-medium">策略備註：</span>
                            <p className="text-xs text-red-700">{selection.notes}</p>
                          </div>
                        )}
                        {generateFinancialAnalysisContent(selection)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 機會情境 */}
              {opportunitySelections.length > 0 && (
                <div>
                  <h5 className="font-medium text-green-600 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    識別之氣候機會情境與財務分析
                  </h5>
                  <div className="space-y-4">
                    {opportunitySelections.map((selection, index) => (
                      <div key={selection.scenarioKey} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-medium text-green-800">
                            機會情境 {index + 1}：<span className="text-red-600">{selection.categoryName}</span>
                          </h6>
                          <Badge className="text-xs bg-green-600">
                            {strategyMapping[selection.strategy] || selection.strategy}
                          </Badge>
                        </div>
                        <p className="text-sm text-green-700 leading-relaxed mb-3">
                          <span className="text-red-600 font-medium">{selection.subcategoryName}</span> - {selection.scenarioDescription}
                        </p>
                        {selection.notes && (
                          <div className="mb-3 p-2 bg-green-100 rounded border border-green-300">
                            <span className="text-xs text-green-600 font-medium">策略備註：</span>
                            <p className="text-xs text-green-700">{selection.notes}</p>
                          </div>
                        )}
                        {generateFinancialAnalysisContent(selection)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">策略韌性評估</h4>
              <p className="text-gray-700 leading-relaxed">
                企業應評估現有策略在不同氣候情境下的韌性，並制定調適與減緩策略。
                <span className="text-red-600"> 基於{industryName}特性與{companySize}企業資源配置</span>，
                建議優先處理高影響度的氣候風險，並積極把握相關機會。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 風險管理 (Risk Management) */}
        <Card>
          <CardHeader className="bg-orange-50 border-b border-orange-100">
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <TrendingUp className="h-6 w-6" />
              <span>風險管理面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">風險識別與評估流程</h4>
              <p className="text-gray-700 leading-relaxed">
                企業應建立系統性的氣候風險識別與評估流程，定期更新風險清單與影響評估。
                <span className="text-red-600"> 本次評估採用 TCFD 建議架構，針對{industryName}進行客製化分析</span>，
                識別出關鍵風險項目並制定相應管理策略。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">風險管理整合機制</h4>
              <p className="text-gray-700 leading-relaxed">
                氣候風險管理應整合至企業整體風險管理框架中，確保決策流程的一致性。
                <span className="text-red-600"> 建議{companySize}企業建立氣候風險管理政策</span>，
                明確角色職責與管理流程，定期監控與檢討管理成效。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 指標與目標 (Metrics and Targets) */}
        <Card>
          <CardHeader className="bg-purple-50 border-b border-purple-100">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <BarChart3 className="h-6 w-6" />
              <span>指標與目標面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">氣候相關關鍵指標</h4>
              <p className="text-gray-700 leading-relaxed">
                企業應建立氣候相關關鍵績效指標，用於監控風險管理成效與目標達成情況。
                <span className="text-red-600"> 建議{industryName}企業追蹤溫室氣體排放量、能源使用效率等核心指標</span>，
                並設定具體的短中長期改善目標。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">目標設定與監控機制</h4>
              <p className="text-gray-700 leading-relaxed">
                氣候相關目標應與企業策略目標保持一致，並建立定期檢討機制。
                <span className="text-red-600"> 考量{companySize}企業資源限制，建議採階段性目標設定方式</span>，
                逐步提升氣候韌性與減碳成效。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 總結建議 */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800">
            <Calculator className="h-5 w-5" />
            <span>總結與實施建議</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            本 TCFD 評估報告基於企業提供的基本資訊，運用標準化評估框架進行氣候風險與機會分析。
            <span className="text-red-600"> 針對{companySize}{industryName}企業特性，建議優先關注 {strategySelections.length} 個關鍵情境</span>，
            並制定相應的管理策略與行動計畫。
          </p>
          <div className="bg-white p-4 rounded border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3">後續實施建議</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>治理架構：</strong>建立氣候變遷委員會，定義角色職責與決策流程</li>
              <li>• <strong>風險管理：</strong>完善氣候風險識別、評估與監控機制</li>
              <li>• <strong>財務量化：</strong><span className="text-red-600">運用報告中提供的計算方法進行財務影響量化分析</span></li>
              <li>• <strong>目標設定：</strong>設定短中長期氣候相關目標與關鍵績效指標</li>
              <li>• <strong>定期檢討：</strong>建立年度評估機制，持續更新風險評估與策略調整</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed">
            企業應將本評估結果作為 TCFD 揭露的基礎架構，結合實際營運數據進行深化分析，
            確保氣候韌性策略的有效性與可執行性。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDReportContent;
