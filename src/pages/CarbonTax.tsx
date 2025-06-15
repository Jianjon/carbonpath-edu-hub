
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { carbonTaxFormSchema, CarbonTaxFormValues } from '@/lib/schemas/carbonTaxSchema';

import Navigation from '../components/Navigation';
import Introduction from '../components/carbon-tax/Introduction';
import ParameterForm from '../components/carbon-tax/ParameterForm';
import Results from '../components/carbon-tax/Results';

const rates = [
    { value: 300, label: '預設費率 (300元/噸)', description: '適用於一般情況，或未達成自主減量目標的企業。' },
    { value: 100, label: '優惠費率 A (100元/噸)', description: '適用於已提出自主減量計畫，並達成指定階段性目標的企業。' },
    { value: 50, label: '優惠費率 B (50元/噸)', description: '適用於過渡期間，給予特定產業的緩衝費率，鼓勵及早規劃減碳。' },
];

const CarbonTax = () => {
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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Introduction />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ParameterForm form={form} />
          </div>
        
          <div className="space-y-8">
            <Results
              rates={rates}
              selectedRate={selectedRate}
              setSelectedRate={setSelectedRate}
              calculatedFee={calculatedFee}
              isHighLeakageRisk={!!formValues.isHighLeakageRisk}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonTax;
