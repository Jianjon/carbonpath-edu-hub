
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, RotateCcw, Copy } from 'lucide-react';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { FeeProjectionItem, ReductionModel } from '@/lib/carbon-tax/types';
import { useToast } from '@/components/ui/use-toast';

interface CarbonTaxReportProps {
  formValues: CarbonTaxFormValues;
  feeProjection: FeeProjectionItem[];
  baselineFeeProjection: FeeProjectionItem[];
  reductionModel: ReductionModel;
  selectedRate: number;
  leakageCoefficient: number;
  onReset: () => void;
}

const reductionModelMap: Record<ReductionModel, string> = {
    none: '無特定減量計畫',
    sbti: 'SBTi 1.5°C 路徑',
    taiwan: '台灣淨零路徑 (2050)',
    steel: '鋼鐵業特定路徑',
    cement: '水泥業特定路徑',
};

const formatCurrency = (value: number) => `NT$ ${Math.round(value).toLocaleString()}`;

const CarbonTaxReport: React.FC<CarbonTaxReportProps> = ({ 
  formValues,
  feeProjection,
  baselineFeeProjection,
  reductionModel,
  selectedRate,
  leakageCoefficient,
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

    return `
# 碳費模擬分析報告

## 1. 輸入參數摘要

- **起始年排放量**: ${annualEmissions?.toLocaleString() || 'N/A'} 噸 CO2e
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
