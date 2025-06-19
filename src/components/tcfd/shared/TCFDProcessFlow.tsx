
import { Building2, Search, Brain, TrendingUp, FileText, ArrowRight } from 'lucide-react';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const TCFDProcessFlow = () => {
  const steps: ProcessStep[] = [
    {
      id: 1,
      title: '基本條件',
      description: '輸入企業資訊',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      title: '風險評估',
      description: '選擇相關情境',
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      title: 'AI 分析',
      description: 'LLM 智能評估',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      title: '策略規劃',
      description: '財務影響分析',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 5,
      title: '報告生成',
      description: '產出 TCFD 報告',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 mb-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          TCFD 評估流程
        </h3>
        <p className="text-gray-600">
          五個步驟完成專業氣候風險財務揭露評估
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col lg:flex-row items-center">
            {/* 步驟圓圈 */}
            <div className="relative">
              <div className={`w-24 h-24 ${step.bgColor} rounded-full flex flex-col items-center justify-center shadow-md border-2 border-white`}>
                <step.icon className={`w-6 h-6 ${step.color} mb-1`} />
                <div className="text-center">
                  <div className={`text-xs font-medium ${step.color}`}>
                    {step.title}
                  </div>
                </div>
                
                {/* 步驟編號 */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 ${step.color.replace('text-', 'bg-').replace('-600', '-500')} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                  {step.id}
                </div>
              </div>
              
              {/* 步驟描述 */}
              <div className="text-center mt-2">
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
            </div>
            
            {/* 箭頭連接線 */}
            {index < steps.length - 1 && (
              <div className="hidden lg:flex items-center mx-4">
                <ArrowRight className="w-5 h-5 text-gray-300" />
              </div>
            )}
            
            {/* 手機版向下箭頭 */}
            {index < steps.length - 1 && (
              <div className="lg:hidden mt-2">
                <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 底部提示 */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600">
          <span className="mr-2">⏱️</span>
          預計完成時間：15-30 分鐘
        </div>
      </div>
    </div>
  );
};

export default TCFDProcessFlow;
