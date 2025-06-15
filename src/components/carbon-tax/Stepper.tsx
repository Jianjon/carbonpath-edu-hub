
interface StepperProps {
    currentStep: number;
    steps?: string[];
    themeColor?: 'blue' | 'green' | 'orange';
}
  
const Stepper = ({ currentStep, steps: stepsProp, themeColor = 'blue' }: StepperProps) => {
    const steps = stepsProp || ['參數與情境設定', '碳費計算', '碳費VS減碳成本'];

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

    const currentTheme = themeStyles[themeColor] || themeStyles.blue;

    return (
        <div className="flex items-center justify-center space-x-4 sm:space-x-8 mb-12">
            {steps.map((title, index) => {
                const stepNumber = index + 1;
                const isActive = currentStep === stepNumber;
                const isCompleted = currentStep > stepNumber;
                return (
                    <div key={title} className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold mb-2 transition-all ${
                            isActive ? currentTheme.active :
                            isCompleted ? currentTheme.completed :
                            'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                            {stepNumber}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${
                            isActive || isCompleted ? currentTheme.text : 'text-gray-500'
                        }`}>
                            {title}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
  
export default Stepper;
