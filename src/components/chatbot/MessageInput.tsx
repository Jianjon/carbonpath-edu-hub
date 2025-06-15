
import { Send } from 'lucide-react';

interface MessageInputProps {
    inputMessage: string;
    setInputMessage: (value: string) => void;
    handleSendMessage: () => void;
    isTyping: boolean;
    ragMode: boolean;
    error: string | null;
    usage: { count: number; limit: number };
    limitReached: boolean;
}

const MessageInput = ({
    inputMessage,
    setInputMessage,
    handleSendMessage,
    isTyping,
    ragMode,
    error,
    usage,
    limitReached
}: MessageInputProps) => {
    return (
        <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSendMessage()}
                    placeholder={limitReached ? "今日額度已用完" : (ragMode ? "基於文件內容提問..." : "輸入您的問題...")}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    disabled={isTyping || limitReached}
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400"
                    disabled={isTyping || !inputMessage.trim() || limitReached}
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : (
                    <div />
                )}
                <p className="text-gray-500 ml-auto">
                    今日用量: {Math.min(usage.count, usage.limit)}/{usage.limit}
                </p>
            </div>
        </div>
    );
};

export default MessageInput;
