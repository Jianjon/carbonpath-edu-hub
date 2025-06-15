import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, RotateCcw, Copy } from 'lucide-react';
import type { EmissionData, ReductionModel, PathwayData } from '../types/carbon';
import { useToast } from '@/hooks/use-toast';

interface ReportExportProps {
  emissionData: EmissionData;
  selectedModel: ReductionModel;
  pathwayData: PathwayData[];
  onReset: () => void;
}

const ReportExport: React.FC<ReportExportProps> = ({ 
  emissionData, 
  selectedModel, 
  pathwayData, 
  onReset 
}) => {
  const { toast } = useToast();

  const generateReport = () => {
    const totalEmissions = emissionData.scope1 + emissionData.scope2;
    const finalEmissions = pathwayData[pathwayData.length - 1].emissions;
    const totalReduction = ((totalEmissions - finalEmissions) / totalEmissions * 100).toFixed(1);
    
    // 根據模型類型生成不同的策略描述
    let modelStrategyDescription = '';
    if (selectedModel.id === 'custom-target') {
      const longTermRateForDisplay = emissionData.adjustedLongTermAnnualRate
        ? (emissionData.adjustedLongTermAnnualRate * 100).toFixed(2)
        : emissionData.longTermTarget?.annualReductionRate?.toFixed(2);

      modelStrategyDescription = `採用自訂兩階段減碳目標：
- 近期目標（${emissionData.baseYear}-${emissionData.nearTermTarget?.year}年）：累積減排 ${emissionData.nearTermTarget?.reductionPercentage?.toFixed(1)}%，年均減排率 ${emissionData.nearTermTarget?.annualReductionRate}%
- 長期目標（${emissionData.nearTermTarget?.year}-${emissionData.longTermTarget?.year}年）：累積減排 ${emissionData.longTermTarget?.reductionPercentage}%，調整後年均減排率 ${longTermRateForDisplay}%`;
    } else if (selectedModel.id === 'taiwan-target') {
      modelStrategyDescription = `依循台灣國家減碳目標路徑：
- 2030年減排24%（相對基準年）
- 2040年減排60%（相對基準年）
- ${emissionData.targetYear}年達成淨零排放目標`;
    } else {
      modelStrategyDescription = `符合科學基礎目標倡議（SBTi）1.5°C路徑：
- 年均減排率：${selectedModel.annualReductionRate}%
- 2030年前減排目標：${selectedModel.targetReduction}%`;
    }
    
    return `
# ${emissionData.baseYear}年淨零路徑規劃報告

## 基準排放數據
本企業於${emissionData.baseYear}年溫室氣體排放基準數據如下：
- 範疇一排放量：${emissionData.scope1.toLocaleString()} tCO2e
- 範疇二排放量：${emissionData.scope2.toLocaleString()} tCO2e
- 總排放量：${totalEmissions.toLocaleString()} tCO2e

## 減碳目標與策略
${modelStrategyDescription}

**規劃參數：**
- 基準年：${emissionData.baseYear}年
- 淨零目標年：${emissionData.targetYear}年
- 残留排放比例：${emissionData.residualEmissionPercentage}%
- 預計總減排量：${totalReduction}%
- 減碳模型：${selectedModel.name}

## 減碳路徑規劃
根據所選模型，制定分階段減碳目標：

${pathwayData.map(item => 
  `**${item.year}年**：目標排放量 ${item.emissions.toLocaleString()} tCO2e，累計減排 ${item.reduction}%`
).join('\n')}

## 實施建議
為達成上述減碳目標，建議企業採取以下措施：

1. **能源效率提升**：透過設備更新、製程優化等方式提升能源使用效率
2. **再生能源導入**：逐步增加再生能源使用比例，降低範疇二排放
3. **綠色供應鏈**：與供應商合作推動減碳，建立綠色採購標準
4. **碳管理制度**：建立完善的碳盤查與管理制度，定期監控減碳成效
5. **技術創新投資**：投資低碳技術研發，尋求突破性減碳解決方案

## 監控與驗證
建議建立年度碳盤查機制，定期檢視減碳成效，必要時調整減碳策略，確保如期達成淨零目標。

---
*本報告由 CarbonPath 教育平台 生成，僅供參考。實際減碳策略應考慮企業具體情況制定。*
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
    link.download = `淨零路徑規劃報告_${emissionData.baseYear}-${emissionData.targetYear}.md`;
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>淨零路徑規劃報告</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={reportContent}
              readOnly
              className="min-h-[400px] font-mono text-sm"
            />
            
            <div className="flex space-x-4">
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                複製報告
              </Button>
              <Button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                下載報告
              </Button>
              <Button onClick={onReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                重新規劃
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 摘要卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((emissionData.scope1 + emissionData.scope2 - pathwayData[pathwayData.length - 1].emissions) / (emissionData.scope1 + emissionData.scope2) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">總減排比例</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {emissionData.targetYear - emissionData.baseYear}
              </div>
              <div className="text-sm text-gray-600">規劃年數</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {((emissionData.scope1 + emissionData.scope2 - pathwayData[pathwayData.length - 1].emissions)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">總減排量 (tCO2e)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportExport;
