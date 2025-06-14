
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ReductionModel } from '../pages/CarbonPath';

interface ModelSelectionProps {
  onNext: (model: ReductionModel) => void;
  onBack: () => void;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({ onNext, onBack }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  const reductionModels: ReductionModel[] = [
    {
      id: 'sbt-1.5',
      name: 'SBTi 1.5°C目標',
      description: '符合科學基礎目標倡議（SBTi）1.5°C路徑，年均減排4.2%，2030年前減排50%',
      targetReduction: 50,
      annualReductionRate: 4.2
    },
    {
      id: 'sbt-2.0',
      name: 'SBTi 2°C目標',
      description: '符合SBTi 2°C路徑，年均減排2.5%，2030年前減排27%',
      targetReduction: 27,
      annualReductionRate: 2.5
    },
    {
      id: 'taiwan-target',
      name: '台灣減碳目標',
      description: '依循台灣國家減碳目標：2030年減28%、2032年減32%、2035年減38%（相對2005年）',
      targetReduction: 38,
      annualReductionRate: 2.8
    },
    {
      id: 'aggressive',
      name: '積極減排',
      description: '高強度減排策略，年均減排6%，適合具備完善減碳技術的企業',
      targetReduction: 70,
      annualReductionRate: 6.0
    },
    {
      id: 'conservative',
      name: '保守減排',
      description: '穩健減排策略，年均減排2%，適合減碳資源有限的企業',
      targetReduction: 30,
      annualReductionRate: 2.0
    }
  ];

  const handleNext = () => {
    const selectedModel = reductionModels.find(model => model.id === selectedModelId);
    if (selectedModel) {
      onNext(selectedModel);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>選擇減碳參考模型</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <RadioGroup value={selectedModelId} onValueChange={setSelectedModelId}>
            <div className="space-y-4">
              {reductionModels.map((model) => (
                <div key={model.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={model.id} className="font-semibold cursor-pointer">
                      {model.name}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                    <div className="flex space-x-4 mt-2 text-sm">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        目標減排：{model.targetReduction}%
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        年均減排率：{model.annualReductionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex space-x-4">
            <Button onClick={onBack} variant="outline">
              返回上一步
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!selectedModelId}
              className="bg-green-600 hover:bg-green-700"
            >
              下一步：確認參數
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelSelection;
