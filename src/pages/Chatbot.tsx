import { useState, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Lightbulb, Zap, FileText, MessageCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BotMessage } from '@/components/BotMessage';
import InfoCard from '@/components/shared/InfoCard';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '您好！我是CarbonPath減碳智能助手。我可以幫您解答關於減碳策略、碳費計算、碳權投資等問題。您可以切換到「文件模式」來基於已上傳的PDF文件進行問答。請問有什麼我能協助您的嗎？'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragMode, setRagMode] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchQuickQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-quick-questions');

        if (error) {
          throw error;
        }

        const defaultQuestions = [
            '如何制定企業減碳目標？',
            '碳費計算方式是什麼？',
            '自願性碳權有哪些類型？',
            '範疇三排放如何盤查？',
            'SBTi目標設定流程？',
            '碳中和與淨零的差別？'
        ];

        setQuickQuestions(data.questions && data.questions.length > 0 ? data.questions : defaultQuestions);

      } catch (err) {
        console.error("Error fetching quick questions:", err);
        setQuickQuestions([
            '如何制定企業減碳目標？',
            '碳費計算方式是什麼？',
            '自願性碳權有哪些類型？',
            '範疇三排放如何盤查？',
            'SBTi目標設定流程？',
            '碳中和與淨零的差別？'
        ]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuickQuestions();
  }, []);

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
      // 選擇要使用的 Edge Function
      const functionName = ragMode ? 'rag-search' : 'ai-chat';
      
      // 傳送除了第一條歡迎訊息之外的對話歷史，作為上下文
      const contextMessages = newMessages.slice(1).map(({ type, content }) => ({ type, content }));

      const { data, error: functionError } = await supabase.functions.invoke(functionName, {
        body: { messages: contextMessages },
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      let botResponseContent = data.reply;
      
      // 如果是 RAG 模式，添加來源信息
      if (ragMode && data.sources_count > 0) {
        botResponseContent += `\n\n💡 此回答基於 ${data.sources_count} 個相關文件片段`;
      }

      const botResponse = {
        id: newMessages.length + 1,
        type: 'bot',
        content: botResponseContent,
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (err: any) {
      console.error("Error sending message:", err);
      const errorMessage = ragMode 
        ? "抱歉，我在搜尋文件時遇到了問題，請稍後再試。" 
        : "抱歉，我現在遇到了一些問題，請稍後再試。";
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

  const handleModeSwitch = (newRagMode: boolean) => {
    setRagMode(newRagMode);
    const modeMessage = {
      id: messages.length + 1,
      type: 'bot',
      content: newRagMode 
        ? '已切換到文件模式！我現在會基於已上傳的PDF文件來回答您的問題。' 
        : '已切換到一般模式！我會使用我的通用知識來回答您的問題。'
    };
    setMessages(prev => [...prev, modeMessage]);
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
        <InfoCard
          icon={MessageSquare}
          title="減碳智能助手功能說明"
          description={
            <span>
              這位 AI 助教是您專屬的減碳顧問，能協助您應對各種挑戰。
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><b>一般模式：</b>利用廣泛的通用知識，回答您關於節能減碳、法規政策、技術方案等問題。</li>
                <li><b>文件模式：</b>切換後，AI 將優先基於您在管理後台上傳的 PDF 文件內容進行問答，提供更具針對性的解答。</li>
                <li><b>快速提問：</b>下方提供了一些常見問題，點擊即可快速獲得解答，幫助您迅速上手。</li>
              </ul>
            </span>
          }
          themeColor="purple"
          className="mb-8"
        />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">CarbonPath AI Assistant</h3>
                <p className="text-sm text-green-600">● 在線中</p>
              </div>
            </div>
            
            {/* Mode Switch */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleModeSwitch(false)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  !ragMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>一般模式</span>
              </button>
              <button
                onClick={() => handleModeSwitch(true)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                  ragMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>文件模式</span>
              </button>
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
                    {message.type === 'bot' ? (
                      <BotMessage content={message.content} />
                    ) : (
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                    )}
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
                placeholder={ragMode ? "基於文件內容提問..." : "輸入您的問題..."}
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
            {loadingQuestions ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full rounded-lg bg-gray-200" />
              ))
            ) : (
              quickQuestions.map((question, index) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
