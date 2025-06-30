
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TCFDStage4Props {
  assessment: any;
  onComplete: () => void;
}

interface SelectedStrategyData {
  scenarioKey: string;
  riskOpportunityId: string;
  strategy: string;
  scenarioDescription: string;
  categoryType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  notes: string;
}

interface Stage3Results {
  assessment: any;
  strategySelections: SelectedStrategyData[];
}

const TCFDStage4 = ({ assessment, onComplete }: TCFDStage4Props) => {
  const [stage3Results, setStage3Results] = useState<Stage3Results | null>(null);
  const [userModifications, setUserModifications] = useState<Record<string, string>>({});

  useEffect(() => {
    // 嘗試從 sessionStorage 讀取第三階段的結果
    const storedStage3Results = sessionStorage.getItem('tcfd-stage3-results');
    if (storedStage3Results) {
      try {
        const results: Stage3Results = JSON.parse(storedStage3Results);
        setStage3Results(results);
        console.log('第四階段成功載入第三階段結果:', results);
      } catch (error) {
        console.error('解析第三階段結果失敗:', error);
      }
    }
  }, []);

  const handleNotesChange = (scenarioKey: string, notes: string) => {
    setUserModifications(prev => ({
      ...prev,
      [scenarioKey]: notes
    }));
  };

  const handleComplete = () => {
    if (!stage3Results) {
      toast.error('請先完成第三階段');
      return;
    }

    // 儲存第四階段結果到 sessionStorage
    const stage4Results = {
      assessment: assessment,
      strategySelections: stage3Results.strategySelections,
      userModifications: userModifications,
      completedAt: new Date().toISOString()
    };
    sessionStorage.setItem('tcfd-stage4-results', JSON.stringify(stage4Results));
    console.log('第四階段結果已儲存到 sessionStorage:', stage4Results);

    onComplete();
  };

  if (!stage3Results || !stage3Results.strategySelections) {
    return (
      <div className="text-center py-8">
        <p>請先完成第三階段的分析。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>策略與財務分析</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            請針對每個情境，補充說明策略執行的具體細節與預期效益。
          </p>
        </CardContent>
      </Card>

      {stage3Results.strategySelections.map((selection) => (
        <Card key={selection.scenarioKey}>
          <CardHeader>
            <CardTitle>{selection.categoryName} - {selection.subcategoryName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`scenario-${selection.scenarioKey}`} className="text-sm font-medium text-gray-700">
                情境描述
              </Label>
              <Input
                id={`scenario-${selection.scenarioKey}`}
                className="mt-1"
                value={selection.scenarioDescription}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor={`strategy-${selection.scenarioKey}`} className="text-sm font-medium text-gray-700">
                選擇的策略
              </Label>
              <Input
                id={`strategy-${selection.scenarioKey}`}
                className="mt-1"
                value={selection.strategy}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor={`notes-${selection.scenarioKey}`} className="text-sm font-medium text-gray-700">
                策略執行備註
              </Label>
              <Textarea
                id={`notes-${selection.scenarioKey}`}
                className="mt-1"
                placeholder="請輸入策略執行的具體細節與預期效益"
                value={userModifications[selection.scenarioKey] || ''}
                onChange={(e) => handleNotesChange(selection.scenarioKey, e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <Button onClick={handleComplete}>
          下一步
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TCFDStage4;
