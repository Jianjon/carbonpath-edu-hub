
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
}

const USAGE_LIMIT = 5;

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
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
  const [usage, setUsage] = useState({ count: 0, limit: USAGE_LIMIT });
  const [isLimitReached, setIsLimitReached] = useState(false);

  const getTodayDateString = useCallback(() => new Date().toISOString().split('T')[0], []);

  const checkUsage = useCallback(() => {
    const today = getTodayDateString();
    try {
      const storedUsageRaw = localStorage.getItem('chatbotUsage');
      if (storedUsageRaw) {
        const storedUsage = JSON.parse(storedUsageRaw);
        if (storedUsage.date === today) {
          const currentCount = storedUsage.count || 0;
          setUsage({ count: currentCount, limit: USAGE_LIMIT });
          if (currentCount >= USAGE_LIMIT) {
            setIsLimitReached(true);
            setError("今日額度已用完，請明天再來。");
          }
          return;
        }
      }
      localStorage.setItem('chatbotUsage', JSON.stringify({ count: 0, date: today }));
      setUsage({ count: 0, limit: USAGE_LIMIT });
      setIsLimitReached(false);
    } catch (e) {
      console.error("Failed to process usage data from localStorage", e);
    }
  }, [getTodayDateString]);

  useEffect(() => {
    checkUsage();
    
    const fetchQuickQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-quick-questions');

        if (error) {
          throw error;
        }

        const defaultQuestions = [
            '企業有哪些常見的減碳方法？',
            '如何制定有效的減碳路徑圖？',
            '再生能源憑證(REC)如何幫助企業減碳?',
            '溫室氣體盤查的範疇一、二、三是什麼？',
            '循環經濟如何貢獻於企業的減碳目標？',
            '產品碳足跡與組織碳盤查有何不同？'
        ];

        setQuickQuestions(data.questions && data.questions.length > 0 ? data.questions : defaultQuestions);

      } catch (err) {
        console.error("Error fetching quick questions:", err);
        setQuickQuestions([
            '企業有哪些常見的減碳方法？',
            '如何制定有效的減碳路徑圖？',
            '再生能源憑證(REC)如何幫助企業減碳?',
            '溫室氣體盤查的範疇一、二、三是什麼？',
            '循環經濟如何貢獻於企業的減碳目標？',
            '產品碳足跡與組織碳盤查有何不同？'
        ]);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuickQuestions();
  }, [checkUsage]);

  const incrementUsage = useCallback(() => {
    const today = getTodayDateString();
    try {
      const newCount = usage.count + 1;
      localStorage.setItem('chatbotUsage', JSON.stringify({ count: newCount, date: today }));
      setUsage({ count: newCount, limit: USAGE_LIMIT });

      if (newCount >= USAGE_LIMIT) {
        setIsLimitReached(true);
        setError("今日額度已用完，請明天再來。");
      }
    } catch (e) {
      console.error("Failed to update usage data in localStorage", e);
    }
  }, [getTodayDateString, usage.count]);

  const sendMessage = async (messageContent: string) => {
    if (isLimitReached) {
        setError("今日額度已用完，請明天再來。");
        return;
    }
    if (!messageContent.trim() || isTyping) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: messageContent,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);
    setError(null);
    
    incrementUsage();

    try {
      const functionName = ragMode ? 'rag-search' : 'ai-chat';
      
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
      
      if (ragMode && data.sources_count > 0) {
        botResponseContent += `\n\n💡 此回答基於 ${data.sources_count} 個相關文件片段`;
      }

      const botResponse: Message = {
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
      const errorResponse: Message = {
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
    const modeMessage: Message = {
      id: messages.length + 1,
      type: 'bot',
      content: newRagMode 
        ? '已切換到文件模式！我現在會基於已上傳的PDF文件來回答您的問題。' 
        : '已切換到一般模式！我會使用我的通用知識來回答您的問題。'
    };
    setMessages(prev => [...prev, modeMessage]);
  };

  return {
    messages,
    inputMessage,
    isTyping,
    error,
    ragMode,
    quickQuestions,
    loadingQuestions,
    usage,
    isLimitReached,
    setInputMessage,
    handleSendMessage,
    handleQuickQuestion,
    handleModeSwitch
  };
};
