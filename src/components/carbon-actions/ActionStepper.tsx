
import { Target, ClipboardCheck, BarChartBig, Brain } from 'lucide-react';

interface StepperProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: '選擇產業', icon: Target },
  { number: 2, title: '推薦行動', icon: ClipboardCheck },
  { number: 3, title: '效益模擬', icon: BarChartBig },
  { number: 4, title: '總結建議', icon: Brain },
];

const ActionStepper = ({ currentStep }: StepperProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-x-auto">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const Icon = step.icon;

        return (
          <div key={step.number} className="flex items-center" style={{ minWidth: index < steps.length - 1 ? '22%' : 'auto' }}>
            <div className={`flex items-center gap-2`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  isActive
                    ? 'bg-green-600 border-green-600 text-white'
                    : isCompleted
                    ? 'bg-green-100 border-green-600 text-green-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`text-sm md:text-base font-medium whitespace-nowrap ${
                  isActive || isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActionStepper;
