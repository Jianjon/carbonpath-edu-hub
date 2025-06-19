import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useTCFDAssessment } from '@/hooks/useTCFDAssessment';
import TCFDStage1 from '@/components/tcfd/TCFDStage1';
import TCFDStage2 from '@/components/tcfd/TCFDStage2';
import TCFDStage3 from '@/components/tcfd/TCFDStage3';
import TCFDStage4 from '@/components/tcfd/TCFDStage4';
import TCFDStage5 from '@/components/tcfd/TCFDStage5';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

// 生成真正的UUID格式
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const TCFDSimulator = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessment');
  
  const {
    assessment,
    loading,
    error,
    createAssessment,
    updateAssessmentStage,
  } = useTCFDAssessment(assessmentId || undefined);

  const [currentStage, setCurrentStage] = useState(1);

  useEffect(() => {
    if (assessment) {
      setCurrentStage(assessment.current_stage);
    }
  }, [assessment]);

  const handleStageComplete = async (nextStage: number) => {
    if (assessment) {
      await updateAssessmentStage(nextStage);
      setCurrentStage(nextStage);
    }
  };

  const handleNewAssessment = async (data: {
    industry: string;
    company_size: string;
    has_carbon_inventory: boolean;
    has_international_operations?: boolean;
    annual_revenue_range?: string;
    supply_chain_carbon_disclosure?: string;
    has_sustainability_team?: string;
    main_emission_source?: string;
    business_description?: string;
  }) => {
    try {
      // 使用真正的UUID格式而不是字符串
      const mockUserId = generateUUID();
      console.log('Generated UUID:', mockUserId);
      
      const newAssessment = await createAssessment({
        ...data,
        user_id: mockUserId
      });
      setSearchParams({ assessment: newAssessment.id });
      setCurrentStage(2);
    } catch (err) {
      console.error('Error creating assessment:', err);
    }
  };

  const renderStageContent = () => {
    if (!assessment && currentStage > 1) {
      return <TCFDStage1 onComplete={handleNewAssessment} />;
    }

    switch (currentStage) {
      case 1:
        return <TCFDStage1 onComplete={handleNewAssessment} />;
      case 2:
        return <TCFDStage2 assessment={assessment!} onComplete={() => handleStageComplete(3)} />;
      case 3:
        return <TCFDStage3 assessment={assessment!} onComplete={() => handleStageComplete(4)} />;
      case 4:
        return <TCFDStage4 assessment={assessment!} onComplete={() => handleStageComplete(5)} />;
      case 5:
        return <TCFDStage5 assessment={assessment!} onComplete={() => {}} />;
      default:
        return <TCFDStage1 onComplete={handleNewAssessment} />;
    }
  };

  const stageNames = [
    '基本條件輸入',
    '風險與機會選擇',
    'LLM 情境評估',
    '策略與財務分析',
    '報告生成'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <FileText className="h-8 w-8" />
              <h1 className="text-4xl md:text-5xl font-bold">TCFD 模擬器</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              气候相關財務揭露架構評估工具
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              依據 TCFD 官方框架，協助企業完成風險與機會評估，並自動生成報告草稿
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {assessment && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {stageNames.map((name, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index + 1 < currentStage
                            ? 'bg-green-500 text-white'
                            : index + 1 === currentStage
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className={`ml-2 text-sm ${
                        index + 1 === currentStage ? 'text-blue-600 font-medium' : 'text-gray-600'
                      }`}>
                        {name}
                      </span>
                      {index < stageNames.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-400 mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {assessment && currentStage > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStage(Math.max(1, currentStage - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一階段
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">錯誤：{error}</p>
          </div>
        )}
        
        {!loading && renderStageContent()}
      </div>
    </div>
  );
};

export default TCFDSimulator;
