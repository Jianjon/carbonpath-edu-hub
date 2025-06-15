
import type { Message } from '@/hooks/useChat';
import MessageItem from './MessageItem';
import { Bot } from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
}

const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="flex space-x-2 max-w-xs lg:max-w-md">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
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
);

const MessageList = ({ messages, isTyping }: MessageListProps) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
        </div>
    );
};

export default MessageList;
