
import { Lightbulb, Zap, RefreshCw, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickQuestionsEnhancedProps {
    loadingQuestions: boolean;
    quickQuestions: string[];
    onQuickQuestion: (question: string) => void;
    onRegenerateQuestions: () => void;
    isTyping: boolean;
    limitReached: boolean;
}

const QuickQuestionsEnhanced = ({ 
    loadingQuestions, 
    quickQuestions, 
    onQuickQuestion, 
    onRegenerateQuestions,
    isTyping, 
    limitReached
}: QuickQuestionsEnhancedProps) => {
    
    const getQuestionIcon = (question: string) => {
        if (question.includes('盤查') || question.includes('溫室氣體')) {
            return <div className="w-3 h-3 rounded-full bg-blue-500" />;
        }
        if (question.includes('足跡') || question.includes('碳足跡')) {
            return <div className="w-3 h-3 rounded-full bg-green-500" />;
        }
        if (question.includes('循環經濟') || question.includes('循環')) {
            return <Settings className="h-4 w-4 text-purple-600" />;
        }
        return <Zap className="h-4 w-4 text-orange-600" />;
    };

    const getQuestionStyle = (question: string) => {
        if (question.includes('盤查') || question.includes('溫室氣體')) {
            return 'border-blue-200 hover:border-blue-300 hover:bg-blue-50';
        }
        if (question.includes('足跡') || question.includes('碳足跡')) {
            return 'border-green-200 hover:border-green-300 hover:bg-green-50';
        }
        if (question.includes('循環經濟') || question.includes('循環')) {
            return 'border-purple-200 hover:border-purple-300 hover:bg-purple-50';
        }
        return 'border-orange-200 hover:border-orange-300 hover:bg-orange-50';
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        ESG智能推薦問題
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        智能整合模式
                    </span>
                </div>
                
                <button
                    onClick={onRegenerateQuestions}
                    disabled={loadingQuestions || isTyping || limitReached}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50"
                    title="重新生成問題"
                >
                    <RefreshCw className={`h-4 w-4 ${loadingQuestions ? 'animate-spin' : ''}`} />
                    <span>重新生成</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loadingQuestions ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-14 w-full rounded-lg bg-gray-200" />
                    ))
                ) : (
                    quickQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => onQuickQuestion(question)}
                            className={`text-left p-3 bg-white border rounded-lg transition-colors disabled:opacity-50 ${getQuestionStyle(question)}`}
                            disabled={isTyping || limitReached}
                        >
                            <div className="flex items-start space-x-2">
                                {getQuestionIcon(question)}
                                <div className="flex-1">
                                    <span className="text-sm text-gray-700">
                                        {question}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
            
            {!loadingQuestions && quickQuestions.length > 0 && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                    問題涵蓋節能減碳、盤查、足跡、循環經濟等ESG專業領域
                </div>
            )}
        </div>
    );
};

export default QuickQuestionsEnhanced;
