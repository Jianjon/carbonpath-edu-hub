import { useState } from 'react';
import { MessageSquare, Send, Bot, User, Lightbulb, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import { supabase } from '@/integrations/supabase/client';

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
  const [error, setError] = useState<string | null>(null);

  const quickQuestions = [
    '如何制定企業減碳目標？',
    '碳費計算方式是什麼？',
    '自願性碳權有哪些類型？',
    '範疇三排放如何盤查？',
    'SBTi目標設定流程？',
    '碳中和與淨零的差別？'
  ];

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: messageContent,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);
    setError(null);

    try {
      // 傳送除了第一條歡迎訊息之外的對話歷史，作為上下文
      const contextMessages = newMessages.slice(1).map(({ type, content }) => ({ type, content }));

      const { data, error: functionError } = await supabase.functions.invoke('ai-chat', {
        body: { messages: contextMessages },
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const botResponse = {
        id: newMessages.length + 1,
        type: 'bot',
        content: data.reply,
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (err: any) {
      console.error("Error sending message:", err);
      const errorMessage = "抱歉，我現在遇到了一些問題，請稍後再試。";
      setError(errorMessage);
      const errorResponse = {
        id: newMessages.length + 1,
        type: 'bot',
        content: errorMessage,
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
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
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                placeholder="輸入您的問題..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                disabled={isTyping || !inputMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
