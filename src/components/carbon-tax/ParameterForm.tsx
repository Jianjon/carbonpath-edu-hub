
import { UseFormReturn } from 'react-hook-form';
import { Calculator } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';

interface ParameterFormProps {
  form: UseFormReturn<CarbonTaxFormValues>;
}

const ParameterForm = ({ form }: ParameterFormProps) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
          <Calculator className="mr-3 h-7 w-7 text-green-600" />
          輸入模擬參數
        </CardTitle>
        <CardDescription>請輸入您的年排放量，並選擇是否適用高碳洩漏風險係數。</CardDescription>
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
