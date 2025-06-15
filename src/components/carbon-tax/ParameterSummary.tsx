
import { Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { ReductionModel } from '@/pages/CarbonTax';

interface ParameterSummaryProps {
  formValues: CarbonTaxFormValues;
  reductionModel: ReductionModel;
  onEdit: () => void;
}

const reductionModelLabels: Record<ReductionModel, string> = {
  none: '無特定減量計畫',
  sbti: 'SBTi 1.5°C 路徑 (年減4.2%)',
  taiwan: '台灣淨零路徑 (年減約2.8%)',
};

const ParameterSummary = ({ formValues, reductionModel, onEdit }: ParameterSummaryProps) => {
  const { annualEmissions, isHighLeakageRisk } = formValues;

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>參數摘要</CardTitle>
          <CardDescription>您輸入的模擬參數。</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          修改
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">年排放量</span>
          <span className="font-medium">{annualEmissions?.toLocaleString() ?? 0} 噸 CO₂e</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">減量情境</span>
          <span className="font-medium">{reductionModelLabels[reductionModel]}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-gray-600">高碳洩漏風險</span>
          <span className={`font-medium px-2 py-1 rounded-full text-xs ${isHighLeakageRisk ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
            {isHighLeakageRisk ? '是' : '否'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParameterSummary;
