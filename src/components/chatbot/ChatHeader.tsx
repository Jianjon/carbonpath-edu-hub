
import { Bot, Zap } from 'lucide-react';

const ChatHeader = () => {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">CarbonPath ESG智能顧問</h3>
                    <p className="text-sm text-green-600">● 智能整合模式</p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700">
                    <Zap className="h-4 w-4" />
                    <span>RAG + LLM</span>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;
