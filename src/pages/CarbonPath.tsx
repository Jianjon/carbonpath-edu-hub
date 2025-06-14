
import { BookOpen, Target, TrendingUp, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';

const CarbonPath = () => {
  const learningPaths = [
    {
      title: '基礎認知',
      description: '了解碳排放基本概念與計算方法',
      modules: ['溫室氣體概論', '碳足跡計算', '排放源識別', '基礎盤查'],
      duration: '4週',
      level: '初級'
    },
    {
      title: '策略規劃',
      description: '學習制定企業減碳策略與目標設定',
      modules: ['減碳目標設定', '策略規劃', '行動方案', '時程規劃'],
      duration: '6週',
      level: '中級'
    },
    {
      title: '實務應用',
      description: '掌握減碳措施的具體實施與效果評估',
      modules: ['技術選擇', '成本效益分析', '執行管理', '成效追蹤'],
      duration: '8週',
      level: '高級'
    }
  ];

  const keyTopics = [
    { icon: Target, title: '目標設定', description: 'SBTi科學基礎目標設定方法' },
    { icon: TrendingUp, title: '減碳技術', description: '各產業減碳技術解決方案' },
    { icon: CheckCircle, title: '驗證機制', description: '第三方驗證與認證程序' },
    { icon: BookOpen, title: '法規遵循', description: '國內外碳管理法規要求' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              減碳路徑學習
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              系統性學習減碳策略，從基礎概念到實務應用，建立專業減碳能力
            </p>
          </div>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">學習路徑</h2>
          <p className="text-lg text-gray-600">循序漸進的課程設計，適合不同程度的學習者</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {learningPaths.map((path, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    path.level === '初級' ? 'bg-green-100 text-green-800' :
                    path.level === '中級' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {path.level}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{path.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  預計學習時間：{path.duration}
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                {path.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{module}</span>
                  </div>
                ))}
              </div>

              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
                開始學習
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Key Topics */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心主題</h2>
            <p className="text-lg text-gray-600">深入探討減碳策略的關鍵議題</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyTopics.map((topic, index) => {
              const Icon = topic.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonPath;
