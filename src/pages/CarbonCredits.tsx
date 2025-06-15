
import { useState } from 'react';
import { Puzzle, Wallet } from 'lucide-react';
import Navigation from '../components/Navigation';
import CriteriaSelection from '../components/carbon-actions/CriteriaSelection';
import ActionExplorer from '../components/carbon-actions/ActionExplorer';

// Define types for better state management
export type Industry = '餐飲業' | '零售業' | '製造業' | '營建業' | '運輸業' | '科技業' | '金融業' | '醫療保健' | '教育服務' | '旅宿業';
export type ActionAngle = '能源管理' | '循環經濟' | '永續採購' | '淨零管理';
export type BudgetLevel = '低' | '中' | '高';

export interface Action {
  id: string;
  name: string;
  description: string;
  investment: '高' | '中' | '低';
}

const budgetPoints: Record<BudgetLevel, number> = {
  '低': 5,
  '中': 10,
  '高': 15,
};

const CarbonActions = () => {
  const [step, setStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<BudgetLevel | null>(null);

  const handleCriteriaSelect = (industry: Industry, budget: BudgetLevel) => {
    setSelectedIndustry(industry);
    setSelectedBudget(budget);
    setStep(2);
  };
  
  const handleReset = () => {
    setStep(1);
    setSelectedIndustry(null);
    setSelectedBudget(null);
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
              探索符合您產業與規模的減碳方案，從四大面向建立您的永續策略。
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mt-8">
          {step === 1 && <CriteriaSelection onNext={handleCriteriaSelect} />}
          {step === 2 && selectedIndustry && selectedBudget && (
            <ActionExplorer
              industry={selectedIndustry}
              totalBudgetPoints={budgetPoints[selectedBudget]}
              onBack={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default CarbonActions;
