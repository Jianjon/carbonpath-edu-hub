
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { FeeProjectionItem, ReductionModel } from '@/lib/carbon-tax/types';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InvestmentGuide from './InvestmentGuide';

interface CostBenefitAnalysisProps {
  feeProjection: FeeProjectionItem[];
  baselineFeeProjection: FeeProjectionItem[];
  reductionModel: ReductionModel;
  selectedRate: number;
  leakageCoefficient: number;
}

const formatCurrency = (value: number) => `NT$ ${Math.round(value).toLocaleString()}`;

const CostBenefitAnalysis = ({ feeProjection, baselineFeeProjection, reductionModel, selectedRate, leakageCoefficient }: CostBenefitAnalysisProps) => {
  if (reductionModel === 'none') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <DollarSign className="mr-3 h-6 w-6 text-green-600" />
            減碳節費效益分析
          </CardTitle>
          <CardDescription>
            請先返回第一步，選擇一個減量情境，才能進行成本效益分析。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">請選擇減量情境</h3>
            <p className="text-gray-500 mt-2">
              此分析將比較「採取減量措施」與「不採取任何措施」下的碳費差異，以評估減碳所帶來的潛在節省金額。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analysisData = feeProjection.map((item, index) => {
    const baselineItem = baselineFeeProjection[index];
    
    // The baseline fee is now correctly calculated in the hook.
    const baselineFee = baselineItem.fee;
    // The scenario fee is also pre-calculated.
    const scenarioFee = item.fee; 

    const annualSavings = baselineFee - scenarioFee;
    const annualEmissionsReduced = baselineItem.emissions - item.emissions;
    const costPerTonReduced = annualEmissionsReduced > 0 ? annualSavings / annualEmissionsReduced : 0;

    return {
        year: item.year,
        baselineFee,
        scenarioFee,
        annualSavings,
        annualEmissionsReduced,
        costPerTonReduced,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <DollarSign className="mr-3 h-6 w-6 text-green-600" />
          減碳節費效益分析
        </CardTitle>
        <CardDescription>
          此分析比較「維持現狀」(假設費率300元/噸)與「採取減量措施」(採用您選擇的費率 {selectedRate}元/噸)兩種情境下的年度碳費。其差額即為您因減碳而省下的費用，可作為評估減碳投資效益的參考。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>逐年效益分析</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>年度</TableHead>
                                <TableHead className="text-right whitespace-nowrap">情境A: 維持現狀碳費</TableHead>
                                <TableHead className="text-right whitespace-nowrap">情境B: 減量後碳費 ({selectedRate}元/噸)</TableHead>
                                <TableHead className="text-right whitespace-nowrap">年度減量 (噸)</TableHead>
                                <TableHead className="text-right whitespace-nowrap">每噸減碳效益 (元/噸)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analysisData.map((data) => (
                                <TableRow key={data.year}>
                                    <TableCell className="font-medium">{data.year}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.baselineFee)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(data.scenarioFee)}</TableCell>
                                    <TableCell className="text-right">{data.annualEmissionsReduced.toLocaleString()}</TableCell>
                                    <TableCell className={cn("text-right font-semibold text-green-700")}>
                                        {formatCurrency(data.costPerTonReduced)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <InvestmentGuide />

      </CardContent>
    </Card>
  );
};

export default CostBenefitAnalysis;
