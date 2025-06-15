
import Navigation from '../components/Navigation';
import { useChat } from '@/hooks/useChat';
import ChatbotPageHeader from '@/components/chatbot/ChatbotPageHeader';
import ChatbotInfo from '@/components/chatbot/ChatbotInfo';
import ChatHeader from '@/components/chatbot/ChatHeader';
import MessageList from '@/components/chatbot/MessageList';
import MessageInput from '@/components/chatbot/MessageInput';
import QuickQuestions from '@/components/chatbot/QuickQuestions';

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
        handleModeSwitch
    } = useChat();

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
                <QuickQuestions
                    loadingQuestions={loadingQuestions}
                    quickQuestions={quickQuestions}
                    onQuickQuestion={handleQuickQuestion}
                    isTyping={isTyping}
                    limitReached={isLimitReached}
                />
            </div>
        </div>
    );
};

export default Chatbot;
