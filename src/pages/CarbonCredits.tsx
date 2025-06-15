import { Puzzle, Target, ClipboardCheck, BarChartBig, Brain, Bolt, RefreshCcw, Factory, Users } from 'lucide-react';
import Navigation from '../components/Navigation';

const CarbonActions = () => {
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 flex justify-center items-center gap-2">
              <Puzzle className="h-8 w-8 text-white mr-2" /> 減碳行動
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto font-medium">
              🧩 分為四大功能區，協助企業規劃具體可行減碳方案與效益模擬
            </p>
          </div>
        </div>
      </div>

      {/* 四大功能區說明 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10 animate-fade-in">
          <div className="mb-6 flex items-center gap-2">
            <BarChartBig className="text-green-500 w-7 h-7" />
            <h2 className="text-2xl font-bold text-gray-900">減碳行動：四大功能區</h2>
          </div>
          <div className="overflow-x-auto mt-5">
            <table className="min-w-full border border-gray-100 rounded-lg">
              <thead>
                <tr className="bg-teal-50">
                  <th className="py-2 px-3 border-b text-left font-semibold">區塊</th>
                  <th className="py-2 px-3 border-b text-left font-semibold">目的</th>
                  <th className="py-2 px-3 border-b text-left font-semibold">功能設計</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-3"><Target className="inline mr-1 text-green-600" /> 選擇產業與目標</td>
                  <td className="py-2 px-3">產業篩選與減碳目標導入</td>
                  <td className="py-2 px-3">使用者選擇產業、設定年排放量或減碳目標（可選）</td>
                </tr>
                <tr>
                  <td className="py-2 px-3"><ClipboardCheck className="inline mr-1 text-green-600" /> 顯示推薦減碳行動</td>
                  <td className="py-2 px-3">對應行業的行動卡片（3~6 個）</td>
                  <td className="py-2 px-3">包含行動類型（能源/循環/製程）、減碳效益、投資、ROI、難度</td>
                </tr>
                <tr>
                  <td className="py-2 px-3"><BarChartBig className="inline mr-1 text-green-600" /> 行動模擬器</td>
                  <td className="py-2 px-3">組合模擬、效益分折</td>
                  <td className="py-2 px-3">勾選組合、即時計算總減碳與平均ROI，自動摘要與比較圖表</td>
                </tr>
                <tr>
                  <td className="py-2 px-3"><Brain className="inline mr-1 text-green-600" /> 行動建議語句</td>
                  <td className="py-2 px-3">生成專業建議</td>
                  <td className="py-2 px-3">GPT 提供總結語句（如：回本年限&年減碳噸數）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 策略類別介紹 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
          <div className="mb-6 flex items-center gap-2">
            <Bolt className="text-teal-500 w-7 h-7" />
            <h2 className="text-2xl font-bold text-gray-900">減碳策略類別</h2>
          </div>
          <table className="min-w-full border border-gray-100 rounded-lg mb-7">
            <thead>
              <tr className="bg-teal-50">
                <th className="py-2 px-3 border-b text-left font-semibold">策略分類</th>
                <th className="py-2 px-3 border-b text-left font-semibold">說明</th>
                <th className="py-2 px-3 border-b text-left font-semibold">代表技術/方法</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-3"><Bolt className="inline mr-1 text-green-500" /> 能源效率改善</td>
                <td className="py-2 px-3">以減少耗能為主，投資回本快</td>
                <td className="py-2 px-3">LED 換裝、變頻空調、智慧監控</td>
              </tr>
              <tr>
                <td className="py-2 px-3"><RefreshCcw className="inline mr-1 text-green-500" /> 循環經濟與資源再利用</td>
                <td className="py-2 px-3">減少廢棄與物料耗損</td>
                <td className="py-2 px-3">廚餘堆肥、洗碗系統、水回收</td>
              </tr>
              <tr>
                <td className="py-2 px-3"><Factory className="inline mr-1 text-green-500" /> 製程技術改善</td>
                <td className="py-2 px-3">大型製造業適用，改善熱能、排氣</td>
                <td className="py-2 px-3">餘熱回收、氣電共生、製程簡化</td>
              </tr>
              <tr>
                <td className="py-2 px-3"><Users className="inline mr-1 text-green-500" /> 精實管理與行為改變</td>
                <td className="py-2 px-3">不見得需花大錢，靠制度與文化改變</td>
                <td className="py-2 px-3">員工節能SOP、動線優化、運輸整合</td>
              </tr>
            </tbody>
          </table>
          <div className="text-sm text-gray-600 px-1">
            上述四大主軸可依產業特性彈性組合應用，提高減碳行動效益與可執行性。
          </div>
        </div>
      </div>
    </div>
  );
};
export default CarbonActions;
