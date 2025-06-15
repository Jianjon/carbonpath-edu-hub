
import { LucideIcon } from 'lucide-react';

export interface StepConfig {
  title: string;
  icon?: LucideIcon;
}

interface StepperProps {
    currentStep: number;
    steps: StepConfig[];
    themeColor?: 'blue' | 'green' | 'orange';
}
  
const Stepper = ({ currentStep, steps, themeColor = 'green' }: StepperProps) => {
    const themeStyles = {
        blue: {
            active: 'bg-blue-600 border-blue-600 text-white',
            completed: 'bg-blue-100 border-blue-600 text-blue-600',
            text: 'text-blue-600',
        },
        green: {
            active: 'bg-green-600 border-green-600 text-white',
            completed: 'bg-green-100 border-green-600 text-green-600',
            text: 'text-green-600',
        },
        orange: {
            active: 'bg-orange-600 border-orange-600 text-white',
            completed: 'bg-orange-100 border-orange-600 text-orange-600',
            text: 'text-orange-600',
        }
    };

    const currentTheme = themeStyles[themeColor] || themeStyles.green;

    return (
        <div className="flex items-start justify-center gap-4 sm:gap-8 mb-12">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                const Icon = step.icon;
                return (
                    <div key={step.title} className="flex flex-col items-center text-center w-24">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 mb-2 transition-all ${
                            isActive ? currentTheme.active :
                            isCompleted ? currentTheme.completed :
                            'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                            {Icon ? <Icon className="w-6 h-6" /> : <span className="font-bold">{stepNumber}</span>}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${
                            isActive || isCompleted ? currentTheme.text : 'text-gray-500'
                        }`}>
                            {step.title}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
  
export default Stepper;
