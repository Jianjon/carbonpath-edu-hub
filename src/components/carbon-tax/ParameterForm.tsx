import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Calculator, Factory } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';
import { ReductionModel } from '@/lib/carbon-tax/types';
import ReductionScenarioChart from './ReductionScenarioChart';
import ReductionScenarioTable from './ReductionScenarioTable';
import { steelAnnualReduction, cementAnnualReduction } from '@/lib/carbon-tax/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Industry = 'none' | 'steel' | 'cement' | 'semiconductor' | 'electronics' | 'energy';

interface ParameterFormProps {
  form: UseFormReturn<CarbonTaxFormValues>;
  reductionModel: ReductionModel;
  setReductionModel: (model: ReductionModel) => void;
  industry: Industry;
  setIndustry: (industry: Industry) => void;
}

const industryOptions: { value: Industry; label: string }[] = [
    { value: 'none', label: '請選擇您的產業別...' },
    { value: 'steel', label: '鋼鐵業' },
    { value: 'cement', label: '水泥業' },
    { value: 'semiconductor', label: '半導體業' },
    { value: 'electronics', label: '電子業' },
    { value: 'energy', label: '能源業' },
];

const ParameterForm = ({ form, reductionModel, setReductionModel, industry, setIndustry }: ParameterFormProps) => {
  const annualEmissions = form.watch('annualEmissions');

  const projectionData = useMemo(() => {
    if (!annualEmissions || annualEmissions <= 0) return [];
    
    const data = [];
    const startYear = new Date().getFullYear();
    const endYear = 2050;
    
    let sbtiEmissions = annualEmissions;
    let taiwanEmissions = annualEmissions;
    let steelEmissions = annualEmissions;
    let cementEmissions = annualEmissions;

    for (let year = startYear; year <= endYear; year++) {
        if (year > startYear) {
            sbtiEmissions *= (1 - 0.042);
            taiwanEmissions *= (1 - 0.028);
            steelEmissions *= (1 - steelAnnualReduction);
            cementEmissions *= (1 - cementAnnualReduction);
        }

        data.push({
            year,
            none: Math.round(annualEmissions),
            sbti: Math.round(sbtiEmissions),
            taiwan: Math.round(taiwanEmissions),
            steel: Math.round(steelEmissions),
            cement: Math.round(cementEmissions),
        });
    }
    return data;
  }, [annualEmissions]);

  const tableData = useMemo(() => {
      if (reductionModel === 'none' || !projectionData.length) return [];
      
      return projectionData.map((curr, i) => {
          const prevEmissions = i > 0 ? projectionData[i-1][reductionModel] : projectionData[0][reductionModel];
          const currentEmissions = curr[reductionModel];
          return {
              year: curr.year,
              emissions: currentEmissions,
              annualReduction: i > 0 ? prevEmissions - currentEmissions : 0
          }
      });
  }, [projectionData, reductionModel]);

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-bold text-gray-800">
          <Calculator className="mr-3 h-6 w-6 text-green-600" />
          輸入模擬參數
        </CardTitle>
        <CardDescription>輸入年排放量、產業別與減量情境，以預測未來費用。</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8">
            <FormField control={form.control} name="annualEmissions" render={({ field }) => (
              <FormItem>
                <FormLabel>年排放量 (噸 CO₂e)</FormLabel>
                <FormControl><Input type="number" placeholder="例如：50000" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormItem>
              <FormLabel className="flex items-center">
                <Factory className="mr-2 h-4 w-4 text-gray-600" />
                產業類別
              </FormLabel>
              <Select value={industry} onValueChange={(value) => setIndustry(value as Industry)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇您的產業別" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} disabled={option.value === 'none'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="steel" id="steel" />
                  <Label htmlFor="steel">鋼鐵業指定削減路徑 (年減約5.7%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cement" id="cement" />
                  <Label htmlFor="cement">水泥業指定削減路徑 (年減約5.0%)</Label>
                </div>
              </RadioGroup>
            </FormItem>

            { annualEmissions > 0 && (
                <div className="space-y-6 pt-4 border-t">
                    <ReductionScenarioChart data={projectionData} reductionModel={reductionModel} />
                    {reductionModel !== 'none' && <ReductionScenarioTable data={tableData} />}
                </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ParameterForm;
