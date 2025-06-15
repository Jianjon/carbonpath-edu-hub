
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, Calculator, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  annualEmissions: z.coerce.number().min(0, "年排放量不能為負數").default(50000),
  isHighLeakageRisk: z.boolean().default(false),
});

const rates = [
    { value: 300, label: '預設費率 (300元/噸)', description: '適用於一般情況，或未達成自主減量目標的企業。' },
    { value: 100, label: '優惠費率 A (100元/噸)', description: '適用於已提出自主減量計畫，並達成指定階段性目標的企業。' },
    { value: 50, label: '優惠費率 B (50元/噸)', description: '適用於過渡期間，給予特定產業的緩衝費率，鼓勵及早規劃減碳。' },
];

const CarbonTax = () => {
  const [selectedRate, setSelectedRate] = useState(rates[0].value);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualEmissions: 50000,
      isHighLeakageRisk: false,
    },
  });

  const formValues = form.watch();

  const calculatedFee = useMemo(() => {
    const { annualEmissions, isHighLeakageRisk } = formValues;
    const emissions = annualEmissions || 0;
    const rate = selectedRate;
    const threshold = 25000;

    if (isHighLeakageRisk) {
        return (emissions * 0.2) * rate;
    }

    if (emissions > threshold) {
        return (emissions - threshold) * rate;
    }

    return 0;
  }, [formValues, selectedRate]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-8 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
              <BookOpen className="mr-3 h-7 w-7 text-blue-600" />
              碳費制度簡介與法規說明
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 space-y-3">
            <p>台灣碳費制度依據《氣候變遷因應法》設立，旨在透過經濟誘因鼓勵企業減碳，並促進國家達成2050淨零轉型目標。</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
                <li><b>徵收對象：</b>初期主要針對年排放量超過 25,000 噸 CO₂e 的電力業及大型製造業。</li>
                <li><b>基本費率：</b>預設費率為每噸 300 元新台幣，未來將視國內外情況滾動式調整。</li>
                <li><b>優惠機制：</b>若企業能有效執行自主減量計畫或符合特定條件，可適用優惠費率以茲鼓勵。</li>
                <li><b>碳洩漏風險：</b>為保護國內產業競爭力，對具備高碳洩漏風險的事業設有不同的收費係數，避免產業外移。</li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
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
          </div>
        
          <div className="space-y-8">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>碳費試算與三種情境比較</CardTitle>
                <CardDescription>點擊下方按鈕切換不同費率情境，查看對應的碳費成本。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-2">
                    {rates.map((rate) => (
                        <Button key={rate.value} onClick={() => setSelectedRate(rate.value)} variant={selectedRate === rate.value ? 'default' : 'secondary'} className="h-auto py-2 flex flex-col">
                            <span className="font-semibold">{rate.label.split(' ')[0]}</span>
                            <span className="text-xs">{rate.label.split(' ')[1]}</span>
                        </Button>
                    ))}
                </div>
                
                <div className="text-center bg-gray-50 p-6 rounded-lg border">
                  <p className="text-lg text-gray-600">預估應繳碳費</p>
                  <p className="text-4xl font-bold text-indigo-600 mt-2">
                    NT$ {calculatedFee.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    於 {rates.find(r => r.value === selectedRate)?.label} 情境下
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-center text-gray-700">費率適用條件說明</h4>
                  {rates.map((rate) => (
                      <div key={rate.value} className={cn("flex items-start gap-3 p-3 rounded-md", { "bg-blue-50 border border-blue-200": selectedRate === rate.value, "bg-gray-50": selectedRate !== rate.value })}>
                          <Info className={cn("h-5 w-5 mt-0.5", { "text-blue-700": selectedRate === rate.value, "text-gray-500": selectedRate !== rate.value })} />
                          <div>
                              <h5 className="font-semibold">{rate.label}</h5>
                              <p className="text-sm text-gray-600">{rate.description}</p>
                          </div>
                      </div>
                  ))}
                </div>
                
                {formValues.isHighLeakageRisk && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <h5 className="font-semibold">高碳洩漏風險模式已啟用</h5>
                        <p className="text-sm">此模式下，碳費公式為「(年排放量 × 係數0.2) × 費率」。這是為維持產業競爭力所設計的過渡期優惠，25,000噸的起徵門檻在此模式下不適用。</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonTax;

