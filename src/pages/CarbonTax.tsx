
import { useState, useMemo, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carbonTaxFormSchema, CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';

import Navigation from '../components/Navigation';
import Introduction from '../components/carbon-tax/Introduction';
import ParameterForm from '../components/carbon-tax/ParameterForm';
import Results from '../components/carbon-tax/Results';
import { Button } from '@/components/ui/button';

interface Rate {
  value: number;
  label: string;
  description: ReactNode;
}

const rates: Rate[] = [
    {
        value: 300,
        label: '預設費率 (300元/噸)',
        description: '適用於一般情況，或未達成自主減量目標的企業。'
    },
    {
        value: 100,
        label: '優惠費率 A (100元/噸)',
        description: (
            <div className="space-y-2 text-left">
                <p><b>🎯 適用條件：</b></p>
                <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                    <li>提出並通過「自主減量計畫」，經主管機關審查核定。</li>
                    <li>達到「行業別指定削減率」（根據所屬產業設定的減碳目標）。</li>
                </ul>
                <p className="pt-2"><b>📊 行業別指定削減率舉例：</b></p>
                <div className="text-sm border rounded-md p-3 bg-gray-50/80">
                    <p><b>鋼鐵業:</b> 25.2%</p>
                    <p><b>水泥業:</b> 22.3%</p>
                    <p><b>其他行業:</b> 42.0%</p>
                </div>
                <p className="pt-2"><b>📌 核心精神：</b></p>
                <p className="text-sm">您需證明「有效執行減碳行動」且結果達標，才能適用此優惠費率。</p>
            </div>
        )
    },
    {
        value: 50,
        label: '優惠費率 B (50元/噸)',
        description: (
            <div className="space-y-2 text-left">
                <p><b>🎯 適用條件：</b></p>
                <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                    <li>同樣需通過「自主減量計畫」，並經審查核定。</li>
                    <li>達到「技術標竿削減率」，此為更進一步的減碳標準。</li>
                </ul>
                <p className="pt-2"><b>🔧 所謂「技術標竿」常見包括：</b></p>
                <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                    <li>引進高效率製程設備</li>
                    <li>能源使用效率顯著優於同業</li>
                    <li>使用再生能源或低碳燃料</li>
                    <li>實施碳捕捉技術 (CCUS)</li>
                </ul>
                <p className="pt-2"><b>📌 核心精神：</b></p>
                <p className="text-sm">此費率鼓勵具備實質技術投資的企業，並需符合環境部公告之標準。</p>
            </div>
        )
    },
];

const CarbonTax = () => {
  const [step, setStep] = useState(1);
  const [selectedRate, setSelectedRate] = useState(rates[0].value);

  const form = useForm<CarbonTaxFormValues>({
    resolver: zodResolver(carbonTaxFormSchema),
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

  const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = ['簡介', '輸入參數', '查看結果'];
    return (
        <div className="flex items-center justify-center space-x-4 sm:space-x-8 mb-12">
            {steps.map((title, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                return (
                    <div key={title} className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold mb-2 transition-all ${
                            isActive ? 'bg-blue-600 border-blue-600 text-white' :
                            isCompleted ? 'bg-blue-100 border-blue-600 text-blue-600' :
                            'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                            {stepNumber}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${
                            isActive || isCompleted ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                            {title}
                        </span>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Stepper currentStep={step} />
        
        {step === 1 && (
            <div className="max-w-4xl mx-auto">
                <Introduction />
                <div className="text-center mt-8">
                    <Button size="lg" onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">開始試算</Button>
                </div>
            </div>
        )}
        
        {step === 2 && (
            <div className="max-w-2xl mx-auto">
                <ParameterForm form={form} />
                <div className="flex justify-between mt-8">
                     <Button variant="outline" onClick={() => setStep(1)}>返回上一步</Button>
                     <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700">查看結果</Button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <ParameterForm form={form} />
                    <div className="flex justify-end lg:justify-start">
                        <Button variant="outline" onClick={() => setStep(2)}>返回修改參數</Button>
                    </div>
                </div>
            
                <div className="lg:col-span-2 space-y-8">
                    <Results
                        rates={rates}
                        selectedRate={selectedRate}
                        setSelectedRate={setSelectedRate}
                        calculatedFee={calculatedFee}
                        isHighLeakageRisk={!!formValues.isHighLeakageRisk}
                    />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CarbonTax;
