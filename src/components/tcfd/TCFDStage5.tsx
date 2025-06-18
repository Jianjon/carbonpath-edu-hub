
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TCFDAssessment } from '@/types/tcfd';
import { FileText, Download } from 'lucide-react';

interface TCFDStage5Props {
  assessment: TCFDAssessment;
  onComplete: () => void;
}

const TCFDStage5 = ({ assessment, onComplete }: TCFDStage5Props) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <FileText className="h-8 w-8 text-green-600" />
            <span>第五階段：TCFD 報告生成</span>
          </CardTitle>
          <p className="text-gray-600 text-center">
            系統整合您的所有輸入與分析，生成完整的 TCFD 揭露報告
          </p>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="space-y-6">
            <Download className="h-16 w-16 text-green-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium mb-2">報告功能包含：</h3>
              <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
                <li>• TCFD 四大類別完整揭露內容</li>
                <li>• 風險與機會揭露矩陣</li>
                <li>• PDF 格式報告下載</li>
                <li>• JSON 結構化資料輸出</li>
              </ul>
            </div>
            <p className="text-gray-600">此階段將在完整系統實作後提供完整功能</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage5;
