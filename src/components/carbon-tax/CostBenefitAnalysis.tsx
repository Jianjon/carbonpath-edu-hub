import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, ShieldCheck, ShieldAlert } from 'lucide-react';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { FeeProjectionItem, ReductionModel } from '@/lib/carbon-tax/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CostBenefitAnalysisProps {
  feeProjection: FeeProjectionItem[];
  baselineFeeProjection: FeeProjectionItem[];
  reductionModel: ReductionModel;
  formValues: CarbonTaxFormValues;
}

const formatCurrency = (value: number) => `NT$ ${Math.round(value).toLocaleString()}`;

const CostBenefitAnalysis = ({ feeProjection, baselineFeeProjection, reductionModel, formValues }: CostBenefitAnalysisProps) => {
  const [investmentCost, setInvestmentCost] = useState<number | ''>('');

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

  const numericInvestmentCost = Number(investmentCost) || 0;

  const totalBaselineFee = baselineFeeProjection.reduce((acc, item) => acc + item.fee, 0);
  const totalProjectedFee = feeProjection.reduce((acc, item) => acc + item.fee, 0);

  const baselineTotalEmissions = baselineFeeProjection.reduce((acc, item) => acc + item.emissions, 0);
  const projectedTotalEmissions = feeProjection.reduce((acc, item) => acc + item.emissions, 0);
  const totalEmissionsReduced = baselineTotalEmissions - projectedTotalEmissions;

  const totalInvestScenarioCost = totalProjectedFee + numericInvestmentCost;
  const netFinancialImpact = totalBaselineFee - totalInvestScenarioCost;
  const costPerTonReduced = totalEmissionsReduced > 0 && numericInvestmentCost > 0 ? numericInvestmentCost / totalEmissionsReduced : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <DollarSign className="mr-3 h-6 w-6 text-green-600" />
          碳費 vs 減碳投資成本效益分析
        </CardTitle>
        <CardDescription>
          此階段將幫助您評估減碳投資的經濟效益。請輸入您的預計投資成本，系統將比較「支付碳費」與「投資減碳」兩種情境的五年總成本。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label htmlFor="investment-cost" className="text-base font-semibold">預估五年總減碳投資成本</Label>
          <p className="text-sm text-gray-500 mb-2">輸入您為了達成所選減量情境，預計投入的總資本支出與營運成本。</p>
          <Input
            id="investment-cost"
            type="number"
            placeholder="例如：5000000"
            value={investmentCost}
            onChange={(e) => setInvestmentCost(e.target.value === '' ? '' : Number(e.target.value))}
            className="max-w-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="mr-2 h-5 w-5 text-orange-500" />
                情境A: 純繳碳費
              </CardTitle>
              <CardDescription>不採取任何減量措施，僅支付碳費的成本。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 rounded-lg bg-white border">
                <p className="text-sm text-gray-600">五年預估總碳費</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalBaselineFee)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingDown className="mr-2 h-5 w-5 text-green-600" />
                情境B: 投資減碳
              </CardTitle>
              <CardDescription>執行您選擇的減量計畫，並支付剩餘碳費。</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="text-center p-4 rounded-lg bg-white border space-y-2">
                <div>
                    <p className="text-sm text-gray-600">五年總投資成本</p>
                    <p className="text-xl font-semibold text-gray-800">{formatCurrency(numericInvestmentCost)}</p>
                </div>
                 <div className="text-4xl font-light text-gray-300">+</div>
                <div>
                    <p className="text-sm text-gray-600">五年預估總碳費</p>
                    <p className="text-xl font-semibold text-gray-800">{formatCurrency(totalProjectedFee)}</p>
                </div>
                 <hr className="my-2"/>
                <div>
                    <p className="text-sm text-gray-600">總支出</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(totalInvestScenarioCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">效益分析總結</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn("flex items-center justify-between p-4 rounded-lg", netFinancialImpact >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                <div className="flex items-center">
                    {netFinancialImpact >= 0 ? <ShieldCheck className="h-8 w-8 mr-4 text-green-600" /> : <ShieldAlert className="h-8 w-8 mr-4 text-red-600" />}
                    <div>
                        <p className="font-semibold text-base">{netFinancialImpact >= 0 ? "投資具備財務效益" : "投資的財務成本較高"}</p>
                        <p className="text-sm text-gray-600">相較純繳碳費，您的五年淨財務影響為：</p>
                    </div>
                </div>
                <p className={cn("text-2xl font-bold", netFinancialImpact >= 0 ? "text-green-700" : "text-red-700")}>
                  {netFinancialImpact >= 0 ? `省下 ${formatCurrency(netFinancialImpact)}` : `多支出 ${formatCurrency(Math.abs(netFinancialImpact))}`}
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">預估五年總減量</p>
                    <p className="text-xl font-bold">{totalEmissionsReduced.toLocaleString()} 噸 CO₂e</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600">平均每噸減碳成本</p>
                    <p className="text-xl font-bold">{costPerTonReduced > 0 ? formatCurrency(costPerTonReduced) : 'N/A'}</p>
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
