
import { Coins, TrendingUp, Shield, Globe } from 'lucide-react';
import Navigation from '../components/Navigation';

const CarbonCredits = () => {
  const creditTypes = [
    {
      title: '再生能源憑證',
      description: '太陽能、風力等再生能源發電憑證',
      price: 'NT$ 5-15/MWh',
      verification: 'I-REC',
      icon: '🌱'
    },
    {
      title: '森林碳匯',
      description: '造林、森林保護等自然解決方案',
      price: 'NT$ 150-500/噸',
      verification: 'VCS, Gold Standard',
      icon: '🌳'
    },
    {
      title: '工業減排',
      description: '製程改善、設備更新等技術減排',
      price: 'NT$ 300-800/噸',
      verification: 'CDM, VCS',
      icon: '🏭'
    },
    {
      title: '碳捕集封存',
      description: '直接空氣捕集、工業碳捕集技術',
      price: 'NT$ 1000-3000/噸',
      verification: 'VCS, CAR',
      icon: '🔬'
    }
  ];

  const marketStats = [
    {
      title: '全球碳權市場規模',
      value: '1.8 兆美元',
      change: '+84%',
      description: '2023年交易量'
    },
    {
      title: '平均碳權價格',
      value: 'NT$ 450/噸',
      change: '+12%',
      description: '自願性市場均價'
    },
    {
      title: '台灣碳權需求',
      value: '500萬噸',
      change: '+156%',
      description: '預估2025年需求'
    }
  ];

  const investmentStrategies = [
    {
      title: '多元化投資組合',
      description: '分散投資不同類型的碳權項目，降低風險',
      risk: '中',
      return: '8-15%'
    },
    {
      title: '高品質項目專注',
      description: '投資具有額外性和永久性的高品質碳權',
      risk: '低',
      return: '5-10%'
    },
    {
      title: '新興技術投資',
      description: '投資創新碳移除技術如DAC、BECCS',
      risk: '高',
      return: '15-30%'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              自願性碳權市場
            </h1>
            <p className="text-xl text-yellow-100 max-w-2xl mx-auto">
              深入了解碳權市場機制，掌握投資策略與風險管理
            </p>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">市場概況</h2>
          <p className="text-lg text-gray-600">全球碳權市場最新動態與趨勢分析</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {marketStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
              <div className="flex items-center justify-center space-x-2">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500">{stat.description}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Carbon Credit Types */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">碳權類型</h2>
            <p className="text-lg text-gray-600">了解不同類型碳權的特性與價值</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creditTypes.map((credit, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{credit.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{credit.title}</h3>
                    <p className="text-gray-600 mb-4">{credit.description}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">市場價格</div>
                        <div className="text-lg font-semibold text-green-600">{credit.price}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">驗證標準</div>
                        <div className="text-sm font-medium text-blue-600">{credit.verification}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Strategies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">投資策略</h2>
            <p className="text-lg text-gray-600">專業的碳權投資策略建議</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {investmentStrategies.map((strategy, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{strategy.title}</h3>
                <p className="text-gray-600 mb-4">{strategy.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-500">風險等級</div>
                    <div className={`text-sm font-medium ${
                      strategy.risk === '低' ? 'text-green-600' :
                      strategy.risk === '中' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {strategy.risk}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">預期報酬</div>
                    <div className="text-sm font-medium text-blue-600">{strategy.return}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: '品質保證', description: '國際認證標準驗證' },
            { icon: Globe, title: '全球市場', description: '連接國際碳權交易' },
            { icon: TrendingUp, title: '價格追蹤', description: '即時市場價格資訊' },
            { icon: Coins, title: '投資組合', description: '專業投資建議服務' }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                  <Icon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CarbonCredits;
