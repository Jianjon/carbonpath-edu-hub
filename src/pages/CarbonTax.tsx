
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, Sliders, BarChart3, Sparkles, Leaf, Coins, TrendingDown, Loader2 } from 'lucide-react';

import Navigation from '../components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { BotMessage } from '@/components/BotMessage';

const formSchema = z.object({
  annualEmissions: z.coerce.number().min(0, "年排放量不能為負數").default(30000),
  feeRateOption: z.string().default('300'),
  customFeeRate: z.coerce.number().optional(),
  reductionPercentage: z.array(z.number()).default([10]),
  hasOffset: z.enum(["yes", "no"]).default("no"),
  offsetAmount: z.coerce.number().min(0, "抵繳量不能為負數").optional(),
}).refine(data => {
    if (data.feeRateOption === 'custom') {
        return data.customFeeRate !== undefined && data.customFeeRate > 0;
    }
    return true;
}, {
    message: "請輸入有效的自訂費率",
    path: ["customFeeRate"],
});

const CarbonTax = () => {
  const [gptExplanation, setGptExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      annualEmissions: 30000,
      feeRateOption: '300',
      reductionPercentage: [10],
      hasOffset: 'no',
      offsetAmount: 0,
    },
  });

  const formValues = form.watch();

  const calculatedResults = useMemo(() => {
    const { annualEmissions, feeRateOption, customFeeRate, reductionPercentage, hasOffset, offsetAmount } = formValues;
    
    const feeRate = feeRateOption === 'custom' ? (customFeeRate || 0) : parseInt(feeRateOption, 10);
    const reduction = (reductionPercentage?.[0] || 0) / 100;
    const offset = hasOffset === 'yes' ? (offsetAmount || 0) : 0;

    const feeWithoutReduction = (annualEmissions || 0) * feeRate;
    
    const emissionsAfterReduction = (annualEmissions || 0) * (1 - reduction);
    const finalEmissions = Math.max(0, emissionsAfterReduction - offset);
    const feeAfterReduction = finalEmissions * feeRate;

    const savings = feeWithoutReduction - feeAfterReduction;

    return { feeWithoutReduction, feeAfterReduction, savings };
  }, [formValues]);

  const handleGenerateExplanation = async () => {
    setIsGenerating(true);
    setGptExplanation('');
    const validation = await form.trigger();
    if (!validation) {
        setIsGenerating(false);
        return;
    }

    try {
        const { data, error } = await supabase.functions.invoke('carbon-tax-explainer', {
            body: { ...form.getValues(), savings: calculatedResults.savings },
        });

        if (error) throw error;
        setGptExplanation(data.explanation);
    } catch (error) {
        console.error('Error generating explanation:', error);
        setGptExplanation('無法產生 AI 建議，請稍後再試。');
    } finally {
        setIsGenerating(false);
    }
  };

  const chartData = [
    { name: '未減碳', '碳費成本': calculatedResults.feeWithoutReduction },
    { name: '減碳後', '碳費成本': calculatedResults.feeAfterReduction },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-8 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
              <BookOpen className="mr-3 h-7 w-7 text-blue-600" />
              碳費制度簡介
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 space-y-2">
            <p>台灣碳費制度由《氣候變遷因應法》規範，初期主要針對「年排放量超過 25,000 噸 CO₂e」的電力業及大型製造業。碳費的設立旨在以經濟誘因，鼓勵企業投資節能設備、採用低碳技術，或購買碳權來抵銷自身排放，進而達成國家整體的減碳目標。</p>
            <p>目前預估費率約為每噸 300 元新台幣，未來將視國內外情勢滾動式調整。企業若能積極減碳，不僅能降低營運成本，更能提升在綠色供應鏈中的競爭力。</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <Sliders className="mr-3 h-7 w-7 text-green-600" />
                  輸入模擬參數
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField control={form.control} name="annualEmissions" render={({ field }) => (
                      <FormItem>
                        <FormLabel>年排放量 (噸 CO₂e)</FormLabel>
                        <FormControl><Input type="number" placeholder="例如：30000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="feeRateOption" render={({ field }) => (
                      <FormItem>
                        <FormLabel>碳費費率 (元/噸)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="選擇費率" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="300">300元 (基準情境)</SelectItem>
                            <SelectItem value="600">600元 (中度情境)</SelectItem>
                            <SelectItem value="1000">1000元 (嚴格情境)</SelectItem>
                            <SelectItem value="custom">自訂費率</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.watch('feeRateOption') === 'custom' && (
                          <FormField control={form.control} name="customFeeRate" render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormControl><Input type="number" placeholder="請輸入自訂費率" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="reductionPercentage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>採用節能措施可減碳 ({field.value?.[0] || 0}%)</FormLabel>
                        <FormControl>
                          <Slider min={0} max={50} step={1} defaultValue={field.value} onValueChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="hasOffset" render={({ field }) => (
                      <FormItem>
                        <FormLabel>是否有碳權抵繳？</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">無</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">有</FormLabel></FormItem>
                          </RadioGroup>
                        </FormControl>
                        {form.watch('hasOffset') === 'yes' && (
                          <FormField control={form.control} name="offsetAmount" render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormLabel className="text-sm text-gray-600">抵繳量 (噸 CO₂e)</FormLabel>
                              <FormControl><Input type="number" placeholder="輸入碳權數量" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </FormItem>
                    )} />
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <BarChart3 className="mr-3 h-7 w-7 text-purple-600" />
                  即時運算結果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700 flex items-center justify-center"><Leaf className="mr-1 h-4 w-4" />未減碳碳費</p>
                    <p className="text-xl font-bold text-red-900">NT$ {calculatedResults.feeWithoutReduction.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center justify-center"><TrendingDown className="mr-1 h-4 w-4" />減碳後碳費</p>
                    <p className="text-xl font-bold text-green-900">NT$ {calculatedResults.feeAfterReduction.toLocaleString()}</p>
                  </div>
                   <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 flex items-center justify-center"><Coins className="mr-1 h-4 w-4" />每年可節省</p>
                    <p className="text-xl font-bold text-blue-900">NT$ {calculatedResults.savings.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">成本比較圖</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `NT$${Number(value).toLocaleString()}`} />
                        <Tooltip formatter={(value) => `NT$${Number(value).toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="碳費成本" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
                  <Sparkles className="mr-3 h-7 w-7 text-yellow-500" />
                  GPT 協助解說
                </CardTitle>
                <CardDescription>點擊按鈕，讓 AI 為您分析模擬結果並提供建議。</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleGenerateExplanation} disabled={isGenerating} className="w-full mb-4">
                  {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />產生中...</> : '產生 AI 建議'}
                </Button>
                {gptExplanation && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <BotMessage content={gptExplanation} />
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
