
import { useState } from 'react';
import { MessageSquare, Send, Bot, User, Lightbulb, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '您好！我是CarbonPath減碳智能助手。我可以幫您解答關於減碳策略、碳費計算、碳權投資等問題。請問有什麼我能協助您的嗎？'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickQuestions = [
    '如何制定企業減碳目標？',
    '碳費計算方式是什麼？',
    '自願性碳權有哪些類型？',
    '範疇三排放如何盤查？',
    'SBTi目標設定流程？',
    '碳中和與淨零的差別？'
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // 模擬AI回覆
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: getBotResponse(inputMessage)
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (question: string) => {
    // 簡單的關鍵字匹配回覆
    if (question.includes('減碳目標') || question.includes('SBTi')) {
      return '制定企業減碳目標建議遵循SBTi科學基礎目標倡議：\n\n1. 進行碳盤查了解現況\n2. 設定符合1.5°C情境的減碳目標\n3. 制定具體減碳行動方案\n4. 定期監測與報告進度\n\n您希望了解哪個步驟的詳細內容嗎？';
    } else if (question.includes('碳費') || question.includes('計算')) {
      return '台灣碳費計算方式：\n\n碳費 = 排放量 × 碳費費率\n\n目前規劃：\n• 2024年：NT$300/噸CO2e\n• 逐年調升至國際水準\n• 適用於年排放2.5萬噸以上企業\n\n您可以使用我們的碳費模擬器進行詳細計算！';
    } else if (question.includes('碳權') || question.includes('自願性')) {
      return '自願性碳權主要類型包括：\n\n🌱 再生能源憑證（I-REC）\n🌳 森林碳匯項目\n🏭 工業減排項目\n🔬 碳捕集封存技術\n\n選擇碳權時應注意：\n• 額外性（Additionality）\n• 永久性（Permanence）\n• 可驗證性（Verifiability）\n\n需要投資建議嗎？';
    } else {
      return '感謝您的問題！我會持續學習以提供更好的服務。您可以：\n\n1. 瀏覽我們的學習模組獲得系統性知識\n2. 使用碳費模擬器進行計算\n3. 了解碳權市場投資機會\n\n還有其他問題嗎？';
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              減碳智能助手
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              24/7 AI諮詢服務，即時解答您的減碳問題與提供專業建議
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">CarbonPath AI Assistant</h3>
              <p className="text-sm text-green-600">● 在線中</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="h-5 w-5 text-blue-600" /> : 
                      <Bot className="h-5 w-5 text-purple-600" />
                    }
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-2 max-w-xs lg:max-w-md">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="輸入您的問題..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">常見問題</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-700">{question}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
