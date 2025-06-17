
import Navigation from '../components/Navigation';
import { useChatEnhanced } from '@/hooks/useChatEnhanced';
import ChatbotPageHeader from '@/components/chatbot/ChatbotPageHeader';
import ChatbotInfo from '@/components/chatbot/ChatbotInfo';
import ChatHeader from '@/components/chatbot/ChatHeader';
import MessageList from '@/components/chatbot/MessageList';
import MessageInput from '@/components/chatbot/MessageInput';
import QuickQuestionsEnhanced from '@/components/chatbot/QuickQuestionsEnhanced';

const Chatbot = () => {
    const {
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
        handleModeSwitch,
        regenerateQuestions
    } = useChatEnhanced();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <ChatbotPageHeader />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ChatbotInfo />
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                    <ChatHeader ragMode={ragMode} onModeSwitch={handleModeSwitch} />
                    <MessageList messages={messages} isTyping={isTyping} />
                    <MessageInput
                        inputMessage={inputMessage}
                        setInputMessage={setInputMessage}
                        handleSendMessage={handleSendMessage}
                        isTyping={isTyping}
                        ragMode={ragMode}
                        error={error}
                        usage={usage}
                        limitReached={isLimitReached}
                    />
                </div>
                <QuickQuestionsEnhanced
                    loadingQuestions={loadingQuestions}
                    quickQuestions={quickQuestions}
                    onQuickQuestion={handleQuickQuestion}
                    onRegenerateQuestions={regenerateQuestions}
                    isTyping={isTyping}
                    limitReached={isLimitReached}
                    ragMode={ragMode}
                />
            </div>
        </div>
    );
};

export default Chatbot;
