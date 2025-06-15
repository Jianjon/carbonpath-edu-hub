import { Link } from 'react-router-dom';
import { Leaf, Calculator, Puzzle, MessageSquare, ArrowRight, BookOpen, Users, Award } from 'lucide-react';
import Navigation from '../components/Navigation';

const Index = () => {
  const modules = [
    {
      title: '減碳路徑',
      description: '學習系統性減碳策略，從基礎概念到實務應用',
      icon: Leaf,
      path: '/carbon-path',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: '碳費模擬',
      description: '計算與分析碳費成本，協助企業財務規劃',
      icon: Calculator,
      path: '/carbon-tax',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: '減碳行動',
      description: '探索符合您產業規模的減碳方法，從四大面向建立永續策略',
      icon: Puzzle,
      path: '/carbon-credits',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: '減碳Chatbot',
      description: 'AI智能助手提供即時減碳諮詢與建議',
      icon: MessageSquare,
      path: '/chatbot',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: '專業教學',
      description: '結合理論與實務的專業課程內容'
    },
    {
      icon: Users,
      title: '顧問服務',
      description: '提供企業減碳策略諮詢與規劃'
    },
    {
      icon: Award,
      title: '認證課程',
      description: '完整的永續發展認證培訓體系'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              CarbonPath 教育平台
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              專業的永續發展與減碳教學平台
            </p>
            <p className="text-lg mb-12 text-green-200 max-w-3xl mx-auto">
              提供企業與個人完整的減碳知識體系，從基礎理論到實務應用，
              協助您建立可持續的綠色發展策略
            </p>
          </div>
        </div>
      </div>

      {/* Main Modules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            四大核心模組
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            完整的減碳教學體系，從理論學習到實務應用
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link
                key={index}
                to={module.path}
                className="group block p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-300"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${module.bgColor}`}>
                    <Icon className={`h-8 w-8 ${module.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center text-green-600 font-medium">
                      <span>開始學習</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              為什麼選擇我們
            </h2>
            <p className="text-lg text-gray-600">
              專業、實用、易學的永續教育解決方案
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold">CarbonPath 教育平台</span>
            </div>
            <p className="text-gray-400">
              © 2024 CarbonPath 教育平台. 致力於推動永續發展教育
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
