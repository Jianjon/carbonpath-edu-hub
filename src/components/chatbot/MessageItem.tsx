
import { Bot, User } from 'lucide-react';
import { BotMessage } from '@/components/BotMessage';
import type { Message } from '@/hooks/useChat';

interface MessageItemProps {
    message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
    return (
        <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                    {message.type === 'user' ?
                        <User className="h-5 w-5 text-blue-600" /> :
                        <Bot className="h-5 w-5 text-purple-600" />
                    }
                </div>
                <div className={`px-4 py-2 rounded-lg ${message.type === 'user'
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
    );
};

export default MessageItem;
