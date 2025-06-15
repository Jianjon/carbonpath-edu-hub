
import { Bot, FileText, MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
    ragMode: boolean;
    onModeSwitch: (newRagMode: boolean) => void;
}

const ChatHeader = ({ ragMode, onModeSwitch }: ChatHeaderProps) => {
    return (
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

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onModeSwitch(false)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${!ragMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <MessageCircle className="h-4 w-4" />
                    <span>一般模式</span>
                </button>
                <button
                    onClick={() => onModeSwitch(true)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${ragMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    <FileText className="h-4 w-4" />
                    <span>文件模式</span>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
