
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
}

const USAGE_LIMIT = 5;

// 分類問題池
const QUESTION_CATEGORIES = {
  energySaving: [
    '企業有哪些常見的節能減碳方法？',
    '如何制定有效的減碳路徑圖？',
    '再生能源在企業減碳中的角色是什麼？',
    '綠色建築對企業減碳的貢獻有哪些？',
    '智慧電網如何協助企業節能？'
  ],
  inventory: [
    '溫室氣體盤查的範疇一、二、三是什麼？',
    '如何進行企業碳盤查的資料收集？',
    'ISO 14064標準在碳盤查中的重要性？',
    '碳盤查報告需要包含哪些關鍵要素？'
  ],
  footprint: [
    '產品碳足跡與組織碳盤查有何不同？',
    '如何計算產品生命週期的碳足跡？',
    '碳足跡標籤對消費者的意義是什麼？',
    '供應鏈碳足跡管理的挑戰有哪些？'
  ],
  circularEconomy: [
    '循環經濟如何貢獻於企業的減碳目標？',
    '廢料回收再利用對減碳的效益如何計算？',
    '循環經濟商業模式有哪些類型？',
    '如何建立有效的循環經濟供應鏈？'
  ]
};

// 隨機選取問題
const getRandomQuestions = (): string[] => {
  const energySaving = QUESTION_CATEGORIES.energySaving.sort(() => 0.5 - Math.random()).slice(0, 3);
  const inventory = QUESTION_CATEGORIES.inventory.sort(() => 0.5 - Math.random()).slice(0, 1);
  const footprint = QUESTION_CATEGORIES.footprint.sort(() => 0.5 - Math.random()).slice(0, 1);
  const circularEconomy = QUESTION_CATEGORIES.circularEconomy.sort(() => 0.5 - Math.random()).slice(0, 1);
  
  return [...energySaving, ...inventory, ...footprint, ...circularEconomy].sort(() => 0.5 - Math.random());
};

export const useChatEnhanced = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: '您好！我是CarbonPath ESG智能顧問。我專精於ESG永續發展、碳管理、節能減碳等領域，可以基於您上傳的專業文件提供精準解答。我只回答ESG和碳管理相關問題，讓我們一起邁向永續未來！有什麼ESG或碳管理問題需要協助嗎？'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
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

  // 生成情境化問題
  const generateContextualQuestions = useCallback(async () => {
    if (messages.length <= 1) {
      // 初始載入時使用隨機分類問題
      setQuickQuestions(getRandomQuestions());
      return;
    }
    
    setLoadingQuestions(true);
    try {
      const conversationMessages = messages.slice(1);
      
      const { data, error } = await supabase.functions.invoke('generate-contextual-questions', {
        body: { 
          messages: conversationMessages
        },
      });

      if (error) {
        throw error;
      }

      setQuickQuestions(data.questions || getRandomQuestions());

    } catch (err) {
      console.error("Error generating contextual questions:", err);
      setQuickQuestions(getRandomQuestions());
    } finally {
      setLoadingQuestions(false);
    }
  }, [messages]);

  // 初始載入
  useEffect(() => {
    checkUsage();
    setQuickQuestions(getRandomQuestions());
  }, [checkUsage]);

  // 對話後生成新問題
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === 'bot' && messages.length > 2) {
      const timer = setTimeout(() => {
        generateContextualQuestions();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [messages, generateContextualQuestions]);

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
      // 使用新的智能整合模式
      const contextMessages = newMessages.slice(1).map(({ type, content }) => ({ type, content }));

      const { data, error: functionError } = await supabase.functions.invoke('smart-chat', {
        body: { messages: contextMessages },
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      let botResponseContent = data.reply;
      
      if (data.sources_count > 0) {
        botResponseContent += `\n\n💡 此回答參考了 ${data.sources_count} 個相關文件片段`;
      }

      const botResponse: Message = {
        id: newMessages.length + 1,
        type: 'bot',
        content: botResponseContent,
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (err: any) {
      console.error("Error sending message:", err);
      const errorMessage = "抱歉，我現在遇到了一些問題，請稍後再試。";
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

  const regenerateQuestions = () => {
    if (messages.length <= 1) {
      setQuickQuestions(getRandomQuestions());
    } else {
      generateContextualQuestions();
    }
  };

  return {
    messages,
    inputMessage,
    isTyping,
    error,
    quickQuestions,
    loadingQuestions,
    usage,
    isLimitReached,
    setInputMessage,
    handleSendMessage,
    handleQuickQuestion,
    regenerateQuestions
  };
};
