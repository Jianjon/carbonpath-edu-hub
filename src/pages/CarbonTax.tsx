
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carbonTaxFormSchema, CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';

import Navigation from '../components/Navigation';
import ParameterForm from '../components/carbon-tax/ParameterForm';
import Results from '../components/carbon-tax/Results';
import ParameterSummary from '../components/carbon-tax/ParameterSummary';
import { Button } from '@/components/ui/button';
import CostBenefitAnalysis from '../components/carbon-tax/CostBenefitAnalysis';
import { ReductionModel } from '@/lib/carbon-tax/types';
import { rates } from '@/lib/carbon-tax/constants';
import { useCarbonTaxCalculations } from '@/hooks/useCarbonTaxCalculations';
import Stepper from '@/components/carbon-tax/Stepper';
import CarbonTaxReport from '../components/carbon-tax/CarbonTaxReport';
import InfoCard from '@/components/shared/InfoCard';
import { BookOpen } from 'lucide-react';

type Industry = 'none' | 'steel' | 'cement' | 'semiconductor' | 'electronics' | 'energy';

const CarbonTax = () => {
  const [step, setStep] = useState(1);
  const [selectedRate, setSelectedRate] = useState(rates[0].value);
  const [reductionModel, setReductionModel] = useState<ReductionModel>('none');
  const [leakageCoefficient, setLeakageCoefficient] = useState<number>(0);
  const [industry, setIndustry] = useState<Industry>('none');

  const form = useForm<CarbonTaxFormValues>({
    resolver: zodResolver(carbonTaxFormSchema),
    defaultValues: {
      annualEmissions: 50000,
      isHighLeakageRisk: false,
    },
  });

  const formValues = form.watch();

  const { feeProjection, baselineFeeProjection } = useCarbonTaxCalculations({
    formValues,
    selectedRate,
    reductionModel,
    leakageCoefficient,
  });

  const handleReset = () => {
    setStep(1);
    form.reset();
    setSelectedRate(rates[0].value);
    setReductionModel('none');
    setLeakageCoefficient(0);
    setIndustry('none');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navigation />
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              碳費模擬器
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              估算您的潛在碳費成本，並評估減量措施的財務效益
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Stepper currentStep={step} />
        </div>
        
        {step === 1 && (
            <div className="max-w-4xl mx-auto space-y-8">
                <InfoCard
                    icon={BookOpen}
                    title="碳費制度簡介與法規說明"
                    description={
                        <span>
                            台灣碳費制度依據《氣候變遷因應法》設立，旨在透過經濟誘因鼓勵企業減碳，並促進國家達成2050淨零轉型目標。
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><b>徵收對象：</b>初期主要針對年排放量超過 25,000 噸 CO₂e 的電力業及大型製造業。</li>
                                <li><b>基本費率：</b>預設費率為每噸 300 元新台幣，未來將視國內外情況滾動式調整。</li>
                                <li><b>優惠機制：</b>若企業能有效執行自主減量計畫或符合特定條件，可適用優惠費率以茲鼓勵。</li>
                                <li><b>碳洩漏風險：</b>為保護國內產業競爭力，對具備高碳洩漏風險的事業設有不同的收費係數，避免產業外移。</li>
                            </ul>
                        </span>
                    }
                    themeColor="blue"
                />
                <ParameterForm 
                  form={form} 
                  reductionModel={reductionModel} 
                  setReductionModel={setReductionModel}
                  industry={industry}
                  setIndustry={setIndustry}
                />
                <div className="text-center pt-4">
                    <Button size="lg" onClick={() => {
                      if (form.getValues("annualEmissions") > 0) {
                        setStep(2)
                      } else {
                        form.trigger("annualEmissions");
                      }
                    }} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-10">
                        查看計算結果
                    </Button>
                </div>
            </div>
        )}
        
        {step === 2 && (
            <div className="max-w-4xl mx-auto space-y-8">
                <ParameterSummary 
                    formValues={formValues} 
                    reductionModel={reductionModel} 
                    onEdit={() => setStep(1)} 
                    leakageCoefficient={leakageCoefficient}
                    setLeakageCoefficient={setLeakageCoefficient}
                    industry={industry}
                />
                <Results
                    rates={rates}
                    selectedRate={selectedRate}
                    setSelectedRate={setSelectedRate}
                    feeProjection={feeProjection}
                    leakageCoefficient={leakageCoefficient}
                    reductionModel={reductionModel}
                />
                <div className="text-center">
                    <Button size="lg" onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-10">
                        前往成本效益分析
                    </Button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="max-w-5xl mx-auto space-y-8">
                <CostBenefitAnalysis
                    feeProjection={feeProjection}
                    baselineFeeProjection={baselineFeeProjection}
                    reductionModel={reductionModel}
                    selectedRate={selectedRate}
                    leakageCoefficient={leakageCoefficient}
                />
                <CarbonTaxReport
                    formValues={formValues}
                    feeProjection={feeProjection}
                    baselineFeeProjection={baselineFeeProjection}
                    reductionModel={reductionModel}
                    selectedRate={selectedRate}
                    leakageCoefficient={leakageCoefficient}
                    industry={industry}
                    onReset={handleReset}
                />
                <div className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                        返回碳費計算
                    </Button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CarbonTax;
