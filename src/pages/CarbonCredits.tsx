
import { useState } from 'react';
import { Puzzle } from 'lucide-react';
import Navigation from '../components/Navigation';
import CriteriaSelection from '../components/carbon-actions/CriteriaSelection';
import ActionExplorer from '../components/carbon-actions/ActionExplorer';
import ActionSummary from '../components/carbon-actions/ActionSummary';
import Stepper from '../components/carbon-tax/Stepper';
import InfoCard from '../components/shared/InfoCard';

// Define types for better state management
export type Industry = '餐飲業' | '零售業' | '製造業' | '營建業' | '運輸業' | '科技業' | '金融業' | '醫療保健' | '教育服務' | '旅宿業';
export type ActionAngle = '能源管理' | '循環經濟' | '永續採購' | '淨零管理';
export type BudgetLevel = '低' | '中' | '高';
export type Difficulty = '簡易' | '中等' | '複雜';
export type TimeEstimate = '數天' | '數週' | '數月' | '數年';
export type Manpower = '少數員工即可' | '需專案小組' | '需外聘顧問';

export interface Action {
  id: string;
  name: string;
  description: string;
  investment: '高' | '中' | '低';
  difficulty: Difficulty;
  time: TimeEstimate;
  manpower: Manpower;
  steps: string[];
  tracking: string[];
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
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>([]);
  
  const carbonActionsSteps = ['選擇產業與預算', '探索減碳行動', '檢視行動計畫'];

  const handleCriteriaSelect = (industry: Industry, budget: BudgetLevel) => {
    setSelectedIndustry(industry);
    setSelectedBudget(budget);
    setStep(2);
  };

  const handleActionsSelected = (actionIds: string[]) => {
    setSelectedActionIds(actionIds);
    setStep(3);
  };
  
  const handleBackToActionExplorer = () => {
    setStep(2);
  };
  
  const handleReset = () => {
    setStep(1);
    setSelectedIndustry(null);
    setSelectedBudget(null);
    setSelectedActionIds([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex justify-center items-center gap-2">
              <Puzzle className="h-10 w-10" />
              減碳行動
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              探索符合您產業與規模的減碳方案，從四大面向建立您的永續策略。
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
            <InfoCard
                icon={Puzzle}
                title="減碳行動功能說明"
                description="此模組旨在協助您根據產業特性、預算規模與執行資源，探索並選擇最適合的減碳行動方案。透過系統性的四大面向分類，您可以建立一份具體、可行的行動計畫，並將其匯出作為內部溝通與執行的依據。"
                themeColor="green"
                className="mb-8"
            />
        )}
        
        <Stepper currentStep={step} steps={carbonActionsSteps} themeColor="green" />

        <div className="mt-8">
          {step === 1 && <CriteriaSelection onNext={handleCriteriaSelect} />}
          {step === 2 && selectedIndustry && selectedBudget && (
            <ActionExplorer
              industry={selectedIndustry}
              totalBudgetPoints={budgetPoints[selectedBudget]}
              onBack={handleReset}
              onComplete={handleActionsSelected}
            />
          )}
          {step === 3 && selectedIndustry && (
            <ActionSummary
              industry={selectedIndustry}
              selectedActionIds={selectedActionIds}
              onBack={handleBackToActionExplorer}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default CarbonActions;
