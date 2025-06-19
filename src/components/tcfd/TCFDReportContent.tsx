
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // 生成策略內容
  const generateStrategyContent = () => {
    const riskCount = strategySelections.filter(s => s.analysis?.risk_strategies).length;
    const oppCount = strategySelections.filter(s => s.analysis?.opportunity_strategies).length;

    return `
針對重大災害的指引：

組織辨識在各種情境下列資訊：
- 描述企業中、長期面對的氣候相關風險與機會，考量組織資產或業務設施的使用壽命，以及中、長期策略的氣候相關風險與機會
- 具體氣候相關風險與機會對企業當前營業生涯人財務影響的各種時間長度（短期、中期和長期）
- 氣候相關風險與機會對企業當前營業生涯人財務影響的流程

適當情況下，組織應考量採部門知和區域氣候風險與機會；在描述氣候相關風險議題時，組織應考慮參考相關國際指引。

本公司已辨識出${strategySelections.length}個重要氣候相關情境，包含${riskCount}項風險情境及${oppCount}項機會情境。

主要策略應對措施包括：
${strategySelections.map((selection, index) => {
  const [categoryName, subcategoryName] = selection.scenarioKey.split('-');
  const isRisk = selection.analysis?.risk_strategies ? true : false;
  const strategyMapping: Record<string, string> = {
    'mitigate': '減緩策略',
    'transfer': '轉移策略',
    'accept': '接受策略',
    'control': '控制策略',
    'evaluate_explore': '評估探索',
    'capability_building': '能力建設',
    'business_transformation': '商業轉換',
    'cooperation_participation': '合作參與',
    'aggressive_investment': '積極投入'
  };
  const strategyName = strategyMapping[selection.strategy] || selection.strategy;
  
  return `
${index + 1}. ${subcategoryName}（${isRisk ? '風險' : '機會'}）
   選定策略：${strategyName}
   情境描述：${selection.analysis?.scenario_description || ''}
   `
}).join('')}

這些策略的財務影響分析已納入本公司的中長期營運規劃中，並定期檢視執行成效。
    `;
  };

  // 生成風險管理內容
  const generateRiskManagementContent = () => {
    return `
針對重大災害的指引：

組織描述其辨別和評估氣候相關風險的管理流程；組織如何設定氣候相關風險相對於其他風險的重要性。

組織應述通辭氣候相關風險的管理流程，包括如何做出減輕氣候相關風險的決定。此外，組織應描述對氣候相關風險進行重大性判斷的流程，包括組織如何認定重大。

如適當，在描述氣候相關風險的管理流程時，組織應回應相關國際指引中所包含的風險。

本公司建立了完整的氣候風險管理機制：

風險辨識流程：
- 定期進行氣候風險評估，採用情境分析方法
- 結合內外部專家意見，評估風險發生機率及衝擊程度
- 建立風險優先順序矩陣，聚焦重大風險項目

風險評估方法：
- 採用定量與定性相結合的評估方式
- 考量短期（1-3年）、中期（3-10年）、長期（10年以上）的時間維度
- 評估對財務、營運、策略的多面向影響

風險管理整合：
本公司將氣候風險管理整合至整體企業風險管理架構中，確保氣候相關風險能夠適當納入公司整體風險管理流程。定期向管理階層及董事會報告風險管理現況及策略執行成果。
    `;
  };

  // 生成指標和目標內容
  const generateMetricsTargetsContent = () => {
    return `
針對重大災害的指引：

組織應詳其符合策略和風險管理流程所使用的指標。

組織應述應度其指標1、範圍2和範圍3溫室氣體排放和相關風險。溫室氣體排放應依循溫室氣體排放或溫室氣體議定書（GHG Protocol）規定的方法計算，以便於不同組織和和國際間的比較。如適用，組織應考量提供相關的背景客戶的額外溫室氣體排放指標。

另提供歷史上溫室氣體排放和相關指標以進行趨勢分析，另外，如具其計算或估算氣候指標的方法並不易辨別，組織應予以描述。

關鍵績效指標：

本公司依循國際標準建立氣候相關關鍵績效指標系統：

溫室氣體排放指標：
- 範圍1溫室氣體排放：直接排放源（如燃料使用）
- 範圍2溫室氣體排放：間接排放源（購買電力）
- 範圍3溫室氣體排放：其他間接排放（供應鏈、產品使用等）
${assessment.has_carbon_inventory ? '本公司已建立完整的溫室氣體盤查制度。' : '本公司正積極建立溫室氣體盤查制度。'}

氣候風險管理指標：
- 氣候風險評估覆蓋率
- 氣候調適措施實施進度
- 氣候相關投資金額與比例

目標設定：
基於前述風險與機會分析，本公司設定以下氣候相關目標：

短期目標（1-3年）：
- 完成全面性溫室氣體盤查
- 建立氣候風險監控機制
- 導入再生能源使用比例達到指定水準

中長期目標（3-10年）：
- 實現溫室氣體排放減量目標
- 完成重大氣候風險調適措施
- 開發低碳產品或服務組合

另外，如具其計算目標和計算的方法並不易辨別，組織應予以描述。

監控與報告：
本公司建立定期監控機制，每年檢視目標達成進度，並適時調整策略方向。所有氣候相關指標均納入年度永續報告書中，確保資訊透明度。
    `;
  };

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
            針對重大災害的、揭露組織業務、策略和財務規劃中，因氣候相關風險與機會帶來的潛在及實際衝擊
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-slate-700 leading-relaxed">
              {generateStrategyContent()}
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
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-slate-700 leading-relaxed">
              {generateRiskManagementContent()}
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
            針對重大災害的、揭露用於評估和管理氣候相關風險與機會的指標和目標。
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-slate-700 leading-relaxed">
              {generateMetricsTargetsContent()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDReportContent;
