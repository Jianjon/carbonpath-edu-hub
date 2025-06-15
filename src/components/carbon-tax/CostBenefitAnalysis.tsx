
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShieldCheck, ShieldAlert } from 'lucide-react';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { FeeProjectionItem, ReductionModel } from '@/lib/carbon-tax/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CostBenefitAnalysisProps {
  feeProjection: FeeProjectionItem[];
  baselineFeeProjection: FeeProjectionItem[];
  reductionModel: ReductionModel;
  formValues: CarbonTaxFormValues;
}

const formatCurrency = (value: number) => `NT$ ${Math.round(value).toLocaleString()}`;

const CostBenefitAnalysis = ({ feeProjection, baselineFeeProjection, reductionModel }: CostBenefitAnalysisProps) => {
  const [annualInvestmentCost, setAnnualInvestmentCost] = useState<number | ''>('');

  if (reductionModel === 'none') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <DollarSign className="mr-3 h-6 w-6 text-green-600" />
            碳費 vs 減碳投資成本效益分析
          </CardTitle>
          <CardDescription>
            請先返回第一步，選擇一個減量情境，才能進行成本效益分析。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">請選擇減量情境</h3>
            <p className="text-gray-500 mt-2">
              成本效益分析是比較「投資減碳」與「純繳碳費」的差異。您需要先設定一個減量目標，我們才能為您計算。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const numericAnnualInvestment = Number(annualInvestmentCost) || 0;

  const analysisData = feeProjection.map((item, index) => {
    const baselineItem = baselineFeeProjection[index];
    const costScenarioA = baselineItem.fee;
    const costScenarioB = item.fee + numericAnnualInvestment;
    const annualFinancialImpact = costScenarioA - costScenarioB;
    const annualEmissionsReduced = baselineItem.emissions - item.emissions;
    const costPerTonReduced = annualEmissionsReduced > 0 && numericAnnualInvestment > 0
        ? numericAnnualInvestment / annualEmissionsReduced
        : 0;

    return {
        year: item.year,
        costScenarioA,
        costScenarioB,
        annualFinancialImpact,
        annualEmissionsReduced,
        costPerTonReduced,
    };
  });

  const totalNetImpact = analysisData.reduce((acc, item) => acc + item.annualFinancialImpact, 0);
  const totalEmissionsReduced = analysisData.reduce((acc, item) => acc + item.annualEmissionsReduced, 0);
  const totalInvestment = numericAnnualInvestment * feeProjection.length;
  const averageCostPerTonReduced = totalEmissionsReduced > 0 && totalInvestment > 0 ? totalInvestment / totalEmissionsReduced : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <DollarSign className="mr-3 h-6 w-6 text-green-600" />
          碳費 vs 減碳投資成本效益分析
        </CardTitle>
        <CardDescription>
          此階段將幫助您評估減碳投資的經濟效益。請輸入您的預計年度投資成本，系統將逐年比較「支付碳費」與「投資減碳」兩種情境的成本。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label htmlFor="investment-cost" className="text-base font-semibold">預估年度減碳投資成本</Label>
          <p className="text-sm text-gray-500 mb-2">輸入您為了達成所選減量情境，預計每年投入的總資本支出與營運成本。</p>
          <Input
            id="investment-cost"
            type="number"
            placeholder="例如：1000000"
            value={annualInvestmentCost}
            onChange={(e) => setAnnualInvestmentCost(e.target.value === '' ? '' : Number(e.target.value))}
            className="max-w-sm"
          />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>逐年成本效益分析</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>年度</TableHead>
                                <TableHead className="text-right whitespace-nowrap">情境A:純繳碳費</TableHead>
                                <TableHead className="text-right whitespace-nowrap">情境B:投資+碳費</TableHead>
                                <TableHead className="text-right whitespace-nowrap">年度淨效益</TableHead>
                                <TableHead className="text-right whitespace-nowrap">年度減量(噸)</TableHead>
                                <TableHead className="text-right whitespace-nowrap">每噸減碳成本</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analysisData.map((data) => (
                                <TableRow key={data.year}>
                                    <TableCell className="font-medium">{data.year}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.costScenarioA)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.costScenarioB)}</TableCell>
                                    <TableCell className={cn("text-right font-semibold", data.annualFinancialImpact >= 0 ? "text-green-700" : "text-red-700")}>
                                        {data.annualFinancialImpact >= 0 ? `省 ${formatCurrency(data.annualFinancialImpact)}` : `多花 ${formatCurrency(Math.abs(data.annualFinancialImpact))}`}
                                    </TableCell>
                                    <TableCell className="text-right">{data.annualEmissionsReduced.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{data.costPerTonReduced > 0 ? formatCurrency(data.costPerTonReduced) : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">效益分析總結 (五年合計)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn("flex items-center justify-between p-4 rounded-lg", totalNetImpact >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                <div className="flex items-center">
                    {totalNetImpact >= 0 ? <ShieldCheck className="h-8 w-8 mr-4 text-green-600" /> : <ShieldAlert className="h-8 w-8 mr-4 text-red-600" />}
                    <div>
                        <p className="font-semibold text-base">{totalNetImpact >= 0 ? "投資具備財務效益" : "投資的財務成本較高"}</p>
                        <p className="text-sm text-gray-600">相較純繳碳費，您的五年淨財務影響為：</p>
                    </div>
                </div>
                <p className={cn("text-2xl font-bold", totalNetImpact >= 0 ? "text-green-700" : "text-red-700")}>
                  {totalNetImpact >= 0 ? `省下 ${formatCurrency(totalNetImpact)}` : `多支出 ${formatCurrency(Math.abs(totalNetImpact))}`}
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">預估五年總減量</p>
                    <p className="text-xl font-bold">{totalEmissionsReduced.toLocaleString()} 噸 CO₂e</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">平均每噸減碳成本</p>
                    <p className="text-xl font-bold">{averageCostPerTonReduced > 0 ? formatCurrency(averageCostPerTonReduced) : 'N/A'}</p>
                    <p className="text-xs text-gray-500">(總投資 / 總減量)</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default CostBenefitAnalysis;
