
import { Lightbulb, Zap, RefreshCw, FileText, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickQuestionsEnhancedProps {
    loadingQuestions: boolean;
    quickQuestions: string[];
    onQuickQuestion: (question: string) => void;
    onRegenerateQuestions: () => void;
    isTyping: boolean;
    limitReached: boolean;
    ragMode: boolean;
}

const QuickQuestionsEnhanced = ({ 
    loadingQuestions, 
    quickQuestions, 
    onQuickQuestion, 
    onRegenerateQuestions,
    isTyping, 
    limitReached,
    ragMode 
}: QuickQuestionsEnhancedProps) => {
    
    const getQuestionIcon = (question: string) => {
        if (question.includes('💡建議切換到文件模式')) {
            return <FileText className="h-4 w-4 text-orange-600" />;
        }
        if (question.includes('🟢')) {
            return <div className="w-3 h-3 rounded-full bg-green-500" />;
        }
        if (question.includes('🔵')) {
            return <div className="w-3 h-3 rounded-full bg-blue-500" />;
        }
        if (question.includes('⚙️')) {
            return <Settings className="h-4 w-4 text-purple-600" />;
        }
        if (question.includes('📊')) {
            return <div className="w-3 h-3 rounded-full bg-indigo-500" />;
        }
        return <Zap className="h-4 w-4 text-purple-600" />;
    };

    const getQuestionStyle = (question: string) => {
        if (question.includes('💡建議切換到文件模式')) {
            return 'border-orange-200 hover:border-orange-300 hover:bg-orange-50';
        }
        if (question.includes('🟢')) {
            return 'border-green-200 hover:border-green-300 hover:bg-green-50';
        }
        if (question.includes('🔵')) {
            return 'border-blue-200 hover:border-blue-300 hover:bg-blue-50';
        }
        if (question.includes('⚙️')) {
            return 'border-purple-200 hover:border-purple-300 hover:bg-purple-50';
        }
        if (question.includes('📊')) {
            return 'border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50';
        }
        return 'border-gray-200 hover:border-purple-300 hover:bg-gray-50';
    };

    const cleanQuestion = (question: string) => {
        return question
            .replace(/💡建議切換到文件模式：/g, '')
            .replace(/🟢|🔵|⚙️|📊/g, '')
            .trim();
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        {ragMode ? '文件相關問題' : '智能推薦問題'}
                    </h3>
                    {!ragMode && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            基於對話生成
                        </span>
                    )}
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
                    quickQuestions.map((question, index) => {
                        const isRagQuestion = question.includes('💡建議切換到文件模式');
                        return (
                            <button
                                key={index}
                                onClick={() => onQuickQuestion(cleanQuestion(question))}
                                className={`text-left p-3 bg-white border rounded-lg transition-colors disabled:opacity-50 ${getQuestionStyle(question)}`}
                                disabled={isTyping || limitReached}
                            >
                                <div className="flex items-start space-x-2">
                                    {getQuestionIcon(question)}
                                    <div className="flex-1">
                                        {isRagQuestion && (
                                            <div className="text-xs text-orange-600 font-medium mb-1">
                                                💡 建議切換到文件模式
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-700">
                                            {cleanQuestion(question)}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
            
            {!loadingQuestions && quickQuestions.length > 0 && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                    問題會根據您的對話內容智能更新，引導您深入學習減碳知識
                </div>
            )}
        </div>
    );
};

export default QuickQuestionsEnhanced;
