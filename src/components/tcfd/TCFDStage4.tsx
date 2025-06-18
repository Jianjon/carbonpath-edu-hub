
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TCFDAssessment } from '@/types/tcfd';
import { Target, DollarSign } from 'lucide-react';

interface TCFDStage4Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage4 = ({ assessment, onComplete }: TCFDStage4Props) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <Target className="h-8 w-8 text-orange-600" />
            <span>第四階段：策略與財務分析</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            AI 將根據您的評估結果，生成詳細的策略建議與財務影響分析
          </p>
        </CardHeader>
        <CardContent className="text-center py-12">
          <DollarSign className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">此階段將在您提供詳細的 LLM prompt 模板後實作</p>
          <Button onClick={onComplete}>暫時跳過至報告生成</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage4;
