
import { Pencil } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { ReductionModel } from '@/pages/CarbonTax';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ParameterSummaryProps {
  formValues: CarbonTaxFormValues;
  reductionModel: ReductionModel;
  onEdit: () => void;
  leakageCoefficient: number;
  setLeakageCoefficient: (value: number) => void;
}

const reductionModelLabels: Record<ReductionModel, string> = {
  none: '無特定減量計畫',
  sbti: 'SBTi 1.5°C 路徑 (年減4.2%)',
  taiwan: '台灣淨零路徑 (年減約2.8%)',
  steel: '鋼鐵業指定削減路徑 (年減約5.7%)',
  cement: '水泥業指定削減路徑 (年減約5.0%)',
};

const ParameterSummary = ({ formValues, reductionModel, onEdit, leakageCoefficient, setLeakageCoefficient }: ParameterSummaryProps) => {
  const { annualEmissions } = formValues;

  const leakageOptions = [
    { value: 0, label: "關閉 (非高洩漏風險產業)" },
    { value: 0.2, label: "啟用，風險係數 0.2" },
    { value: 0.4, label: "啟用，風險係數 0.4" },
    { value: 0.6, label: "啟用，風險係數 0.6" },
  ];

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
        <div className="space-y-2 pt-2">
          <Label htmlFor="leakage-select" className="text-gray-600">高碳洩漏風險模式</Label>
          <Select
            value={String(leakageCoefficient)}
            onValueChange={(value) => setLeakageCoefficient(Number(value))}
          >
            <SelectTrigger id="leakage-select" className="w-full">
              <SelectValue placeholder="選擇風險係數..." />
            </SelectTrigger>
            <SelectContent>
              {leakageOptions.map(option => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParameterSummary;
