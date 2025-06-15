
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { ReductionModel } from '@/pages/CarbonTax';

interface FeeProjection {
    year: number;
    emissions: number;
    fee: number;
}

interface CostBenefitAnalysisProps {
  feeProjection: FeeProjection[];
  reductionModel: ReductionModel;
  formValues: CarbonTaxFormValues;
}

const CostBenefitAnalysis = ({ feeProjection, reductionModel, formValues }: CostBenefitAnalysisProps) => {
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
      <CardContent className="space-y-6">
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700">即將推出</h3>
          <p className="text-gray-500 mt-2">
            我們正在建構此功能，未來您將可以在這裡輸入減碳專案的投資金額與預期減量成效，以進行更詳細的成本效益分析。
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostBenefitAnalysis;
