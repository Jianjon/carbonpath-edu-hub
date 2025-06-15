
import { Send } from 'lucide-react';

interface MessageInputProps {
    inputMessage: string;
    setInputMessage: (value: string) => void;
    handleSendMessage: () => void;
    isTyping: boolean;
    ragMode: boolean;
    error: string | null;
}

const MessageInput = ({
    inputMessage,
    setInputMessage,
    handleSendMessage,
    isTyping,
    ragMode,
    error
}: MessageInputProps) => {
    return (
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
    );
};

export default MessageInput;
