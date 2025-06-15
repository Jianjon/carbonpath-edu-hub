
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
}

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

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: messageContent,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsTyping(true);
    setError(null);

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
    setInputMessage,
    handleSendMessage,
    handleQuickQuestion,
    handleModeSwitch
  };
};
