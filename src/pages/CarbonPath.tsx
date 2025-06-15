import React, { useState } from 'react';
import { Calculator, TrendingDown, FileBarChart, Download } from 'lucide-react';
import Navigation from '../components/Navigation';
import EmissionDataInput from '../components/EmissionDataInput';
import ModelSelection from '../components/ModelSelection';
import PathwayChart from '../components/PathwayChart';
import PathwayTable from '../components/PathwayTable';
import ReportExport from '../components/ReportExport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculatePathwayData } from '../lib/pathwayUtils';
import InfoCard from '@/components/shared/InfoCard';
import Stepper from '@/components/carbon-tax/Stepper';
import type { StepConfig } from '@/components/carbon-tax/Stepper';
import type { 
  EmissionData, 
  ReductionModel, 
  PathwayData, 
  CustomTargets 
} from '../types/carbon';

const carbonPathSteps: StepConfig[] = [
  { title: '輸入排放數據', icon: Calculator },
  { title: '選擇減碳模型', icon: TrendingDown },
  { title: '生成路徑規劃', icon: FileBarChart },
  { title: '導出報告', icon: Download }
];

const CarbonPath = () => {
  const [step, setStep] = useState(1);
  const [emissionData, setEmissionData] = useState<EmissionData | null>(null);
  const [selectedModel, setSelectedModel] = useState<ReductionModel | null>(null);
  const [customTargets, setCustomTargets] = useState<CustomTargets>({});
  const [pathwayData, setPathwayData] = useState<PathwayData[]>([]);

  const generatePathway = () => {
    if (!emissionData || !selectedModel) return;
    
    const fullPathway = calculatePathwayData(emissionData, selectedModel, customTargets);
    
    setPathwayData(fullPathway);
    setStep(4);
  };

  const resetPlanning = () => {
    setStep(1);
    setEmissionData(null);
    setSelectedModel(null);
    setCustomTargets({});
    setPathwayData([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              企業淨零路徑規劃
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              透過科學化方法，為您的企業制定可行的淨零排放路徑規劃
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Stepper currentStep={step} steps={carbonPathSteps} themeColor="green" />
        
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <>
              <InfoCard
                icon={TrendingDown}
                title="淨零路徑規劃功能說明"
                description={
                  <span>
                    此功能旨在協助企業運用科學方法，規劃出清晰、可行的淨零排放路徑。您可以：
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><b>輸入排放數據：</b>提供您企業的範疇一、二排放量、基準年與目標年等基本資料。</li>
                      <li><b>選擇減碳模型：</b>依據國際標準（如 SBTi）或台灣目標，甚至自訂不同階段的減碳目標。</li>
                      <li><b>生成路徑規劃：</b>系統將依您選擇的模型，計算出逐年的排放量下降路徑圖與數據表。</li>
                      <li><b>導出完整報告：</b>將路徑圖、數據表與相關參數匯出成一份完整的報告，作為內部溝通與策略擬定的依據。</li>
                    </ul>
                  </span>
                }
                themeColor="green"
                className="mb-8"
              />
              <EmissionDataInput 
                onNext={(data) => {
                  setEmissionData(data);
                  setStep(2);
                }}
              />
            </>
          )}

          {step === 2 && emissionData && (
            <ModelSelection
              onNext={(model, customTargetsParam) => {
                setSelectedModel(model);
                if (model.id === 'custom-target' && customTargetsParam) {
                  setCustomTargets(customTargetsParam);
                }
                setStep(3);
              }}
              onBack={() => setStep(1)}
              baseYear={emissionData.baseYear}
              targetYear={emissionData.targetYear}
              residualEmissionPercentage={emissionData.residualEmissionPercentage}
            />
          )}

          {step === 3 && emissionData && selectedModel && (
            <Card>
              <CardHeader>
                <CardTitle>確認規劃參數</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">排放數據</h4>
                      <p>範疇一：{emissionData.scope1.toLocaleString()} tCO2e</p>
                      <p>範疇二：{emissionData.scope2.toLocaleString()} tCO2e</p>
                      <p>總排放量：{(emissionData.scope1 + emissionData.scope2).toLocaleString()} tCO2e</p>
                      <p>基準年：{emissionData.baseYear}</p>
                      <p>淨零目標年：{emissionData.targetYear}</p>
                      <p className="font-semibold text-red-600">殘留排放：{emissionData.residualEmissionPercentage}% ({((emissionData.scope1 + emissionData.scope2) * emissionData.residualEmissionPercentage / 100).toLocaleString()} tCO2e)</p>
                      <p>
                        減碳模型：{selectedModel.name}
                      </p>
                      {selectedModel.id === 'custom-target' && customTargets.nearTermTarget && (
                        <>
                          <p>近期目標：{customTargets.nearTermTarget.year}年 累積減排{customTargets.nearTermTarget.reductionPercentage.toFixed(1)}%（年減排{customTargets.nearTermTarget.annualReductionRate}%）</p>
                        </>
                      )}
                      {selectedModel.id === 'custom-target' && customTargets.midTermTarget && (
                        <>
                          <p>中期目標：{customTargets.midTermTarget.year}年 累積減排{customTargets.midTermTarget.reductionPercentage.toFixed(1)}%（年減排{customTargets.midTermTarget.annualReductionRate}%）</p>
                        </>
                      )}
                      {selectedModel.id === 'custom-target' && customTargets.longTermTarget && (
                        <>
                          <p>遠期目標：{customTargets.longTermTarget.year}年 累積減排{customTargets.longTermTarget.reductionPercentage}%（年減排{customTargets.longTermTarget.annualReductionRate.toFixed(2)}%）</p>
                        </>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">減碳模型</h4>
                      <p>模型：{selectedModel.name}</p>
                      {selectedModel.id !== 'custom-target' && (
                        <>
                          <p>目標減排：{selectedModel.targetReduction}%</p>
                          <p>年均減排率：{selectedModel.annualReductionRate}%</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button onClick={() => setStep(2)} variant="outline">
                      返回修改
                    </Button>
                    <Button onClick={generatePathway} className="bg-green-600 hover:bg-green-700">
                      生成路徑規劃
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && pathwayData.length > 0 && emissionData && selectedModel && (
            <div className="space-y-6">
              <PathwayChart 
                data={pathwayData} 
                modelType={selectedModel.id as 'custom-target' | 'taiwan-target' | 'sbti'}
                planBaseYear={emissionData.baseYear}
                customPhases={selectedModel.id === 'custom-target' ? {
                  nearTermTarget: customTargets.nearTermTarget,
                  longTermTarget: customTargets.longTermTarget,
                } : undefined}
              />
              <PathwayTable
                data={pathwayData}
                baseYear={emissionData.baseYear}
                residualEmissions={((emissionData.scope1 + emissionData.scope2) * emissionData.residualEmissionPercentage / 100)}
                residualPercentage={emissionData.residualEmissionPercentage}
              />
              <ReportExport 
                emissionData={{
                  ...emissionData,
                  nearTermTarget: customTargets.nearTermTarget,
                  midTermTarget: customTargets.midTermTarget,
                  longTermTarget: customTargets.longTermTarget,
                  adjustedLongTermAnnualRate: undefined
                }}
                selectedModel={selectedModel}
                pathwayData={pathwayData}
                onReset={resetPlanning}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarbonPath;
