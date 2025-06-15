
import { useState } from 'react';
import { Puzzle } from 'lucide-react';
import Navigation from '../components/Navigation';
import ActionStepper from '../components/carbon-actions/ActionStepper';
import IndustrySelection from '../components/carbon-actions/IndustrySelection';
import ActionCards from '../components/carbon-actions/ActionCards';
import ActionSimulator from '../components/carbon-actions/ActionSimulator';
import SummaryReport from '../components/carbon-actions/SummaryReport';

// Define types for better state management
export type Industry = '餐飲業' | '零售業' | '製造業';
export interface Action {
  id: string;
  name: string;
  type: '能源' | '循環' | '製程';
  reduction: number; // tons
  investment: number; // NT$
  roi: number; // %
  difficulty: '低' | '中' | '高';
}

const CarbonActions = () => {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [annualEmissions, setAnnualEmissions] = useState<number | null>(null);
  const [selectedActions, setSelectedActions] = useState<Action[]>([]);

  const handleIndustrySelect = (industry: Industry, emissions: number) => {
    setSelectedIndustry(industry);
    setAnnualEmissions(emissions);
    setSelectedActions([]); // Reset actions when industry changes
    setStep(2);
  };
  
  const handleActionsSelect = (actions: Action[]) => {
    setSelectedActions(actions);
    setStep(3);
  };
  
  const handleReset = () => {
    setStep(1);
    setSelectedIndustry(null);
    setAnnualEmissions(null);
    setSelectedActions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex justify-center items-center gap-2">
              <Puzzle className="h-8 w-8 text-white mr-2" /> 減碳行動
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto font-medium">
              🧩 分為四大功能區，協助企業規劃具體可行減碳方案與效益模擬
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <ActionStepper currentStep={step} />

        <div className="mt-8">
          {step === 1 && <IndustrySelection onNext={handleIndustrySelect} />}
          {step === 2 && selectedIndustry && (
            <ActionCards
              industry={selectedIndustry}
              onNext={handleActionsSelect}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && selectedActions.length > 0 && annualEmissions && (
             <ActionSimulator 
                actions={selectedActions}
                totalEmissions={annualEmissions}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
             />
          )}
          {step === 4 && selectedActions.length > 0 && annualEmissions && (
            <SummaryReport 
              actions={selectedActions} 
              totalEmissions={annualEmissions} 
              onReset={handleReset} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default CarbonActions;
