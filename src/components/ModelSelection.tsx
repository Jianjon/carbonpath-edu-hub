import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ThreePhaseTargets from './ThreePhaseTargets';
import type { ReductionModel, CustomTargets } from '../types/carbon';

interface ModelSelectionProps {
  onNext: (model: ReductionModel, customTargets?: CustomTargets) => void;
  onBack: () => void;
  baseYear: number;
  targetYear: number;
  residualEmissionPercentage: number;
}

const REDUCTION_MODELS: ReductionModel[] = [
  {
    id: 'sbt-1.5',
    name: 'SBTi 1.5°C目標',
    description: '符合科學基礎目標倡議（SBTi）1.5°C路徑，年均減排4.2%，2030年前減排50%',
    targetReduction: 50,
    annualReductionRate: 4.2,
  },
  {
    id: 'taiwan-target',
    name: '台灣減碳目標',
    description: '依循台灣國家減碳目標：2030年減28%、2032年減32%、2035年減38%（相對2005年）',
    targetReduction: 38,
    annualReductionRate: 2.8,
  },
  {
    id: 'custom-target',
    name: '自訂減碳目標',
    description: '根據企業自身情況設定兩階段減碳目標，包含近期（5~10年）及遠期目標',
    targetReduction: 0,
    annualReductionRate: 0,
  },
];

const ModelSelection: React.FC<ModelSelectionProps> = ({
  onNext,
  onBack,
  baseYear,
  targetYear,
  residualEmissionPercentage,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [customTargets, setCustomTargets] = useState<CustomTargets>({});

  const handleNext = () => {
    const selectedModel = REDUCTION_MODELS.find(model => model.id === selectedModelId);
    if (selectedModelId === 'custom-target') {
      if (
        customTargets.nearTermTarget &&
        customTargets.longTermTarget
      ) {
        onNext(selectedModel!, customTargets);
      }
    } else if (selectedModel) {
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
              {REDUCTION_MODELS.map((model) => (
                <div key={model.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={model.id} id={model.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={model.id} className="font-semibold cursor-pointer">
                      {model.name}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                    {model.id !== 'custom-target' && (
                      <div className="flex space-x-4 mt-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          目標減排：{model.targetReduction}%
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          年均減排率：{model.annualReductionRate}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedModelId === 'custom-target' && (
            <div>
              <div className="mt-6">
                <ThreePhaseTargets
                  baseYear={baseYear}
                  targetYear={targetYear}
                  residualEmissionPercentage={residualEmissionPercentage}
                  onTargetsChange={setCustomTargets}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <Button onClick={onBack} variant="outline">
              返回上一步
            </Button>
            <Button 
              onClick={handleNext}
              disabled={
                !selectedModelId ||
                (selectedModelId === 'custom-target' &&
                  (!customTargets.nearTermTarget ||
                    !customTargets.longTermTarget))
              }
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
