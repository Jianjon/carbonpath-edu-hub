
import { LucideIcon } from 'lucide-react';
import { Building2, Search, Brain, TrendingUp, FileText } from 'lucide-react';

export interface TCFDStepConfig {
  title: string;
  icon: LucideIcon;
}

interface TCFDStepperProps {
  currentStep: number;
  steps: TCFDStepConfig[];
}

const TCFDStepper = ({ currentStep, steps }: TCFDStepperProps) => {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-12 mb-8 py-8 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
      <div className="flex items-center gap-4 sm:gap-8">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const Icon = step.icon;
          
          return (
            <div key={step.title} className="flex flex-col items-center text-center">
              {/* 圖標容器 - 統一設計風格 */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 mb-3 transition-all duration-300 shadow-sm ${
                isActive 
                  ? 'bg-slate-700 border-slate-700 text-white shadow-lg scale-110' 
                  : isCompleted 
                  ? 'bg-slate-100 border-slate-600 text-slate-600' 
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                <Icon className="w-7 h-7" />
              </div>
              
              {/* 步驟標題 - 統一字體風格 */}
              <span className={`text-sm font-medium transition-colors max-w-20 leading-tight ${
                isActive 
                  ? 'text-slate-700 font-semibold' 
                  : isCompleted 
                  ? 'text-slate-600' 
                  : 'text-slate-400'
              }`}>
                {step.title}
              </span>
              
              {/* 進度點 - 統一設計 */}
              <div className={`w-2 h-2 rounded-full mt-2 transition-all ${
                isActive || isCompleted ? 'bg-slate-600' : 'bg-slate-300'
              }`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TCFDStepper;
