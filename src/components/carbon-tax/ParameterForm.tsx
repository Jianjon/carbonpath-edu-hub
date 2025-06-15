
import { UseFormReturn } from 'react-hook-form';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { ReductionModel } from '@/pages/CarbonTax';

interface ParameterFormProps {
  form: UseFormReturn<CarbonTaxFormValues>;
  reductionModel: ReductionModel;
  setReductionModel: (model: ReductionModel) => void;
}

const ParameterForm = ({ form, reductionModel, setReductionModel }: ParameterFormProps) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <Calculator className="mr-3 h-6 w-6 text-green-600" />
          輸入模擬參數
        </CardTitle>
        <CardDescription>輸入年排放量，並選擇減量情境以預測未來五年費用。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            <FormField control={form.control} name="annualEmissions" render={({ field }) => (
              <FormItem>
                <FormLabel>年排放量 (噸 CO₂e)</FormLabel>
                <FormControl><Input type="number" placeholder="例如：50000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormItem>
              <FormLabel>減量情境選擇</FormLabel>
              <RadioGroup
                value={reductionModel}
                onValueChange={(value) => setReductionModel(value as ReductionModel)}
                className="space-y-2 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">無特定減量計畫</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sbti" id="sbti" />
                  <Label htmlFor="sbti">SBTi 1.5°C 路徑 (年減4.2%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="taiwan" id="taiwan" />
                  <Label htmlFor="taiwan">台灣淨零路徑 (年減約2.8%)</Label>
                </div>
              </RadioGroup>
            </FormItem>

            <FormField control={form.control} name="isHighLeakageRisk" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <FormLabel>是否為高碳洩漏風險事業？</FormLabel>
                    <CardDescription>若適用，碳費計算將採用 0.2 優惠係數。</CardDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
             )} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ParameterForm;
