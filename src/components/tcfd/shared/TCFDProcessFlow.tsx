
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
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      title: '風險評估',
      description: '選擇相關情境',
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      title: 'AI 分析',
      description: 'LLM 智能評估',
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      title: '策略規劃',
      description: '財務影響分析',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 5,
      title: '報告生成',
      description: '產出 TCFD 報告',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="w-full py-12 bg-gradient-to-r from-blue-50 via-green-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            🎯 TCFD 評估流程
          </h3>
          <p className="text-gray-600 text-lg">
            五個步驟完成專業氣候風險財務揭露評估
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col lg:flex-row items-center">
              {/* 流程圓圈 */}
              <div className="relative group">
                <div className={`w-32 h-32 ${step.bgColor} rounded-full flex flex-col items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl border-4 border-white`}>
                  <step.icon className={`w-8 h-8 ${step.color} mb-2`} />
                  <div className="text-center">
                    <div className={`text-sm font-bold ${step.color}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-600 px-2">
                      {step.description}
                    </div>
                  </div>
                  
                  {/* 步驟編號標籤 */}
                  <div className={`absolute -top-2 -right-2 w-8 h-8 ${step.color.replace('text-', 'bg-').replace('-600', '-500')} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md`}>
                    {step.id}
                  </div>
                </div>
              </div>
              
              {/* 箭頭連接線 */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex items-center mx-4">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              {/* 手機版向下箭頭 */}
              {index < steps.length - 1 && (
                <div className="lg:hidden my-4">
                  <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 底部說明 */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md border">
            <span className="text-sm text-gray-600">
              💡 <span className="font-semibold">預計完成時間：</span>15-30 分鐘
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCFDProcessFlow;
