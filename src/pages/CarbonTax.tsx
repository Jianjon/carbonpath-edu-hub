
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carbonTaxFormSchema, CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';

import Navigation from '../components/Navigation';
import Introduction from '../components/carbon-tax/Introduction';
import ParameterForm from '../components/carbon-tax/ParameterForm';
import Results from '../components/carbon-tax/Results';
import ParameterSummary from '../components/carbon-tax/ParameterSummary';
import { Button } from '@/components/ui/button';
import CostBenefitAnalysis from '../components/carbon-tax/CostBenefitAnalysis';
import { ReductionModel } from '@/lib/carbon-tax/types';
import { rates } from '@/lib/carbon-tax/constants';
import { useCarbonTaxCalculations } from '@/hooks/useCarbonTaxCalculations';
import Stepper from '@/components/carbon-tax/Stepper';

const CarbonTax = () => {
  const [step, setStep] = useState(1);
  const [selectedRate, setSelectedRate] = useState(rates[0].value);
  const [reductionModel, setReductionModel] = useState<ReductionModel>('none');
  const [leakageCoefficient, setLeakageCoefficient] = useState<number>(0);

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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Stepper currentStep={step} />
        
        {step === 1 && (
            <div className="max-w-4xl mx-auto space-y-8">
                <Introduction />
                <ParameterForm 
                  form={form} 
                  reductionModel={reductionModel} 
                  setReductionModel={setReductionModel} 
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-8">
                    <ParameterSummary 
                        formValues={formValues} 
                        reductionModel={reductionModel} 
                        onEdit={() => setStep(1)} 
                        leakageCoefficient={leakageCoefficient}
                        setLeakageCoefficient={setLeakageCoefficient}
                    />
                </div>
            
                <div className="lg:col-span-2 space-y-8">
                    <Results
                        rates={rates}
                        selectedRate={selectedRate}
                        setSelectedRate={setSelectedRate}
                        feeProjection={feeProjection}
                        leakageCoefficient={leakageCoefficient}
                        reductionModel={reductionModel}
                    />
                    <div className="text-center pt-4">
                        <Button size="lg" onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto px-10">
                            前往成本效益分析
                        </Button>
                    </div>
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
