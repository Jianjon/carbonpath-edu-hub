
import { Lightbulb, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickQuestionsProps {
    loadingQuestions: boolean;
    quickQuestions: string[];
    onQuickQuestion: (question: string) => void;
    isTyping: boolean;
    limitReached: boolean;
}

const QuickQuestions = ({ loadingQuestions, quickQuestions, onQuickQuestion, isTyping, limitReached }: QuickQuestionsProps) => {
    return (
        <div className="mt-8">
            <div className="flex items-center space-x-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">常見問題</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loadingQuestions ? (
                    Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-12 w-full rounded-lg bg-gray-200" />
                    ))
                ) : (
                    quickQuestions.map((question, index) => (
                        <button
                            key={index}
                            onClick={() => onQuickQuestion(question)}
                            className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors disabled:opacity-50"
                            disabled={isTyping || limitReached}
                        >
                            <div className="flex items-center space-x-2">
                                <Zap className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-gray-700">{question}</span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuickQuestions;
