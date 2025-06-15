import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, RotateCcw, Copy } from 'lucide-react';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { FeeProjectionItem, ReductionModel } from '@/lib/carbon-tax/types';
import { useToast } from '@/components/ui/use-toast';

type Industry = 'none' | 'steel' | 'cement' | 'semiconductor' | 'electronics' | 'energy';

interface CarbonTaxReportProps {
  formValues: CarbonTaxFormValues;
  feeProjection: FeeProjectionItem[];
  baselineFeeProjection: FeeProjectionItem[];
  reductionModel: ReductionModel;
  selectedRate: number;
  leakageCoefficient: number;
  industry: Industry;
  onReset: () => void;
}

const reductionModelMap: Record<ReductionModel, string> = {
    none: '無特定減量計畫',
    sbti: 'SBTi 1.5°C 路徑',
    taiwan: '台灣淨零路徑 (2050)',
    steel: '鋼鐵業特定路徑',
    cement: '水泥業特定路徑',
};

const industryMap: Record<Industry, string> = {
    none: '未指定',
    steel: '鋼鐵業',
    cement: '水泥業',
    semiconductor: '半導體業',
    electronics: '電子業',
    energy: '能源業',
};

const getIndustryRecommendations = (industry: Industry): string => {
    switch (industry) {
        case 'steel':
            return `
- **製程改善**: 評估導入電爐 (EAF) 技術取代傳統高爐-轉爐 (BF-BOF) 路徑，以大幅降低製程排放。
- **能源效率**: 全面檢視廠房能源使用效率，特別是加熱爐、馬達系統等高耗能設備。
- **循環經濟**: 提升廢鋼回收利用率，減少對原生鐵礦石的依賴。
- **前瞻技術**: 關注並規劃導入碳捕捉、再利用與封存 (CCUS) 及氫能冶金等前瞻技術的時程與投資。`;
        case 'cement':
            return `
- **替代原料與燃料**: 增加替代性原料（如爐碴、飛灰）與生質燃料的使用比例，降低熟料(clinker)係數。
- **能源效率**: 投資高效預熱機、分解爐與冷卻機等設備，降低單位產量的能耗。
- **製程創新**: 探索新型水泥配方，例如低碳水泥，以減少製程中的石灰石分解排放。
- **碳捕捉**: 水泥業為 CCUS 技術的重點應用領域，應及早進行技術評估與場地勘查。`;
        case 'semiconductor':
            return `
- **製程氣體減量**: 優先替換或加裝尾氣處理設備，削減全氟化物 (PFCs) 等高全球暖化潛勢 (GWP) 氣體的排放。
- **採購再生能源**: 積極簽訂綠電採購協議 (CPPA) 或建置自用太陽能，因應龐大的電力需求。
- **廠務系統節能**: 針對無塵室、空調、純水系統等關鍵廠務設施進行系統性節能改造。
- **供應鏈合作**: 與設備及化學品供應商合作，要求提供低碳足跡的產品與解決方案。`;
        case 'electronics':
            return `
- **再生能源採購**: 作為用電大戶，應將採購100%再生能源作為長期目標，並制定分階段達成計畫。
- **供應鏈管理**: 建立供應商碳排放管理機制，將碳績效納入供應商評選標準，尤其針對上游高耗能零組件。
- **產品能效提升**: 設計更節能的終端產品，降低產品在使用階段的碳排放。
- **循環經濟**: 推動產品回收、維修與再利用計畫，延長產品生命週期並減少廢棄物。`;
        case 'energy':
            return `
- **再生能源轉型**: 加速從化石燃料發電轉向太陽能、風能、地熱等再生能源。
- **電網現代化**: 投資智慧電網技術，提升電力調度彈性與效率，以容納更多間歇性再生能源。
- **儲能系統建置**: 大規模部署儲能解決方案（如電池、抽蓄水力），解決再生能源的間歇性問題。
- **氫能與前瞻技術**: 投入綠氫的生產與應用研究，並探索其他零碳能源選項。`;
        default:
            return `
- **能源效率提升**: 進行能源審計，找出主要的能源消耗點（如照明、空調、生產設備），並進行節能改善。
- **再生能源導入**: 評估在廠房屋頂或空地建置太陽能發電系統，或向再生能源售電業採購綠電。
- **建立碳盤查能力**: 若尚未完成，應盡快進行溫室氣體盤查，了解自身的排放來源與熱點。
- **設定內部減碳目標**: 根據盤查結果，設定實際可行的內部減量目標，並追蹤進度。`;
    }
};

const formatCurrency = (value: number) => `NT$ ${Math.round(value).toLocaleString()}`;

const CarbonTaxReport: React.FC<CarbonTaxReportProps> = ({ 
  formValues,
  feeProjection,
  baselineFeeProjection,
  reductionModel,
  selectedRate,
  leakageCoefficient,
  industry,
  onReset
}) => {
  const { toast } = useToast();

  const generateReport = () => {
    const { annualEmissions } = formValues;

    const totalScenarioFee = feeProjection.reduce((sum, item) => sum + item.fee, 0);
    const totalBaselineFee = baselineFeeProjection.reduce((sum, item) => sum + item.fee, 0);
    const totalSavings = totalBaselineFee - totalScenarioFee;
    const firstYear = feeProjection[0]?.year || new Date().getFullYear();
    const lastYear = feeProjection[feeProjection.length - 1]?.year || 2030;

    const feeProjectionTable = feeProjection.map(item => 
        `| ${item.year} | ${item.emissions.toLocaleString()} 噸 | ${formatCurrency(item.fee)} |`
    ).join('\n');

    const savingsAnalysisTable = feeProjection.map((item, index) => {
        const baselineFee = baselineFeeProjection[index].fee;
        const scenarioFee = item.fee;
        const savings = baselineFee - scenarioFee;
        return `| ${item.year} | ${formatCurrency(baselineFee)} | ${formatCurrency(scenarioFee)} | **${formatCurrency(savings)}** |`;
    }).join('\n');

    const industryRecommendations = getIndustryRecommendations(industry);

    return `
# 碳費模擬分析報告

## 1. 輸入參數摘要

- **起始年排放量**: ${annualEmissions?.toLocaleString() || 'N/A'} 噸 CO2e
- **產業別**: ${industryMap[industry]}
- **減量情境**: ${reductionModelMap[reductionModel]}
- **模擬費率**: ${selectedRate} 元/噸
- **高碳洩漏風險**: ${leakageCoefficient > 0 ? `是 (風險係數: ${leakageCoefficient})` : '否'}

## 2. 碳費預測 (${firstYear} - ${lastYear})

在「${reductionModelMap[reductionModel]}」情境與「${selectedRate}元/噸」費率下，預估的年度排放量與碳費如下：

| 年度 | 預估排放量 | 預估碳費 |
| :--- | :--- | :--- |
${feeProjectionTable}

**期間預估碳費總計: ${formatCurrency(totalScenarioFee)}**

## 3. 減碳節費效益分析

此分析比較「情境A: 維持現狀 (費率300元/噸，不減量)」與「情境B: 採取減量措施」的碳費差異。

| 年度 | 情境A碳費 (維持現狀) | 情境B碳費 (減量後) | 年度預估節省 |
| :--- | :--- | :--- | :--- |
${savingsAnalysisTable}

**期間預估節省總額: ${formatCurrency(totalSavings)}**

## 4. 綜合建議

- **財務效益**: 根據模擬，從 ${firstYear} 至 ${lastYear}，採取「${reductionModelMap[reductionModel]}」減量路徑預計可為您省下 **${formatCurrency(totalSavings)}** 的碳費成本。這筆金額可視為您投資減碳的直接財務回報。
- **策略規劃**: 建議將此預估節省金額作為內部推動減碳專案的預算參考，例如投資能源效率改善、製程優化或再生能源採購。
- **風險管理**: 即便採取減量措施，企業仍需負擔 ${formatCurrency(totalScenarioFee)} 的碳費。這凸顯了持續深化減碳工作的重要性，以應對未來可能更高的碳價。
- **後續步驟**: 建議使用本平台的「淨零路徑規劃」工具，進一步制定詳細的、符合SBTi或國家目標的科學減碳計畫。

## 5. 產業別減碳策略建議

根據您選擇的「${industryMap[industry]}」，我們提供以下初步的減碳策略方向：
${industryRecommendations}

---
*本報告由 CarbonPath 模擬器生成，數據與建議僅供初步評估參考。實際碳費金額與減量效益需依據主管機關最終公告之法規與企業實際情況而定。*
    `.trim();
  };

  const reportContent = generateReport();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
      toast({
        title: "複製成功",
        description: "報告內容已複製到剪貼簿",
      });
    } catch (err) {
      toast({
        title: "複製失敗",
        description: "請手動選擇文字進行複製",
        variant: "destructive",
      });
    }
  };

  const downloadReport = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `碳費模擬分析報告.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "下載成功",
      description: "報告已下載到您的裝置",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>產出分析報告</CardTitle>
        <CardDescription>
          將本次模擬的參數、費用預測與效益分析結果匯出成一份完整的報告，以便存檔或分享。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={reportContent}
            readOnly
            className="min-h-[400px] bg-gray-50 font-mono text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyToClipboard} variant="outline">
              <Copy className="mr-2" />
              複製報告
            </Button>
            <Button onClick={downloadReport}>
              <Download className="mr-2" />
              下載報告 (.md)
            </Button>
            <Button onClick={onReset} variant="destructive">
              <RotateCcw className="mr-2" />
              全部重設
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarbonTaxReport;
