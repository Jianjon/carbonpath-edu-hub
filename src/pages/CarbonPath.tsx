import React, { useState } from 'react';
import { Calculator, TrendingDown, FileBarChart, Download } from 'lucide-react';
import Navigation from '../components/Navigation';
import EmissionDataInput from '../components/EmissionDataInput';
import ModelSelection from '../components/ModelSelection';
import PathwayChart from '../components/PathwayChart';
import ReportExport from '../components/ReportExport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface EmissionData {
  scope1: number;
  scope2: number;
  baseYear: number;
  targetYear: number;
  residualEmissionPercentage: number;
  decarbonModel: string;
  reTargetYear?: number;
  renewableTargetType?: string;
  nearTermTarget?: {
    year: number;
    reductionPercentage: number;
    annualReductionRate: number;
  };
  midTermTarget?: {
    year: number;
    reductionPercentage: number;
    annualReductionRate: number;
  };
  longTermTarget?: {
    year: number;
    reductionPercentage: number;
    annualReductionRate: number;
  };
  adjustedLongTermAnnualRate?: number;
}

export interface ReductionModel {
  id: string;
  name: string;
  description: string;
  targetReduction: number; // percentage
  annualReductionRate: number; // percentage per year
}

export interface PathwayData {
  year: number;
  emissions: number;
  reduction: number;
  target: number;
}

const CarbonPath = () => {
  const [step, setStep] = useState(1);
  const [emissionData, setEmissionData] = useState<EmissionData | null>(null);
  const [selectedModel, setSelectedModel] = useState<ReductionModel | null>(null);
  const [customTargets, setCustomTargets] = useState<{
    nearTermTarget?: { year: number; reductionPercentage: number; annualReductionRate: number };
    midTermTarget?: { year: number; reductionPercentage: number; annualReductionRate: number };
    longTermTarget?: { year: number; reductionPercentage: number; annualReductionRate: number };
  }>({});
  const [pathwayData, setPathwayData] = useState<PathwayData[]>([]);
  const [adjustedRates, setAdjustedRates] = useState<{ longTerm?: number }>({});

  const generatePathway = () => {
    if (!emissionData || !selectedModel) return;

    const totalEmissions = emissionData.scope1 + emissionData.scope2;
    const years = emissionData.targetYear - emissionData.baseYear;
    const pathway: PathwayData[] = [];

    console.log('開始生成路徑:', { 
      totalEmissions, 
      years, 
      selectedModel: selectedModel.id, 
      residualPercentage: emissionData.residualEmissionPercentage 
    });

    // 計算最終殘留排放量（這是絕對不能低於的底線）
    const finalResidualEmissions = totalEmissions * (emissionData.residualEmissionPercentage / 100);
    console.log('最終殘留排放量:', finalResidualEmissions, `(${emissionData.residualEmissionPercentage}%)`);

    // 自訂減碳目標 - 兩階段等比減排
    if (selectedModel.id === 'custom-target' && customTargets.nearTermTarget && customTargets.longTermTarget) {
      console.log('使用自訂目標（等比減排）:', customTargets);

      const nearTermYears = customTargets.nearTermTarget.year - emissionData.baseYear;
      const nearTermAnnualRate = customTargets.nearTermTarget.annualReductionRate / 100;
      const nearTermEndEmissions = totalEmissions * Math.pow(1 - nearTermAnnualRate, nearTermYears);
      const longTermYears = customTargets.longTermTarget.year - customTargets.nearTermTarget.year;
      
      let adjustedLongTermRate = 0;
      if (longTermYears > 0 && nearTermEndEmissions > finalResidualEmissions) {
        adjustedLongTermRate = 1 - Math.pow(finalResidualEmissions / nearTermEndEmissions, 1 / longTermYears);
      }
      
      setAdjustedRates({ longTerm: adjustedLongTermRate });
      console.log('調整後的長期年均減排率:', (adjustedLongTermRate * 100).toFixed(4), '%');

      for (let i = 0; i <= years; i++) {
        const currentYear = emissionData.baseYear + i;
        let currentEmissions: number;

        if (currentYear <= customTargets.nearTermTarget.year) {
          const yearsInPhase = currentYear - emissionData.baseYear;
          currentEmissions = totalEmissions * Math.pow(1 - nearTermAnnualRate, yearsInPhase);
        } else if (currentYear <= customTargets.longTermTarget.year) {
          const yearsInLongPhase = currentYear - customTargets.nearTermTarget.year;
          currentEmissions = nearTermEndEmissions * Math.pow(1 - adjustedLongTermRate, yearsInLongPhase);
        } else {
          currentEmissions = finalResidualEmissions;
        }

        currentEmissions = Math.max(currentEmissions, finalResidualEmissions);
        const actualReduction = ((totalEmissions - currentEmissions) / totalEmissions) * 100;

        pathway.push({
          year: currentYear,
          emissions: Math.round(currentEmissions),
          reduction: Math.round(actualReduction * 10) / 10,
          target: Math.round(currentEmissions)
        });
      }
    }
    // 台灣減碳目標 - 階段性線性減排
    else if (selectedModel.id === 'taiwan-target') {
      console.log('使用台灣目標, 残留排放量:', finalResidualEmissions);
      
      for (let i = 0; i <= years; i++) {
        const currentYear = emissionData.baseYear + i;
        let targetReduction = 0;

        if (currentYear <= 2030) {
          // 線性減排到2030年28%
          targetReduction = (currentYear - emissionData.baseYear) / (2030 - emissionData.baseYear) * 28;
        } else if (currentYear <= 2032) {
          // 線性減排從28%到32%
          targetReduction = 28 + (currentYear - 2030) / (2032 - 2030) * (32 - 28);
        } else if (currentYear <= 2035) {
          // 線性減排從32%到38%
          targetReduction = 32 + (currentYear - 2032) / (2035 - 2032) * (38 - 32);
        } else {
          // 從2035年後線性減排到最終殘留排放
          if (currentYear === emissionData.targetYear) {
            // 最終年份必須達到殘留排放
            targetReduction = (1 - emissionData.residualEmissionPercentage / 100) * 100;
          } else {
            const maxReduction = (1 - emissionData.residualEmissionPercentage / 100) * 100;
            targetReduction = 38 + (currentYear - 2035) / (emissionData.targetYear - 2035) * (maxReduction - 38);
          }
        }

        const emissions = Math.max(totalEmissions * (1 - targetReduction / 100), finalResidualEmissions);
        const actualReduction = ((totalEmissions - emissions) / totalEmissions) * 100;

        pathway.push({
          year: currentYear,
          emissions: Math.round(emissions),
          reduction: Math.round(actualReduction * 10) / 10,
          target: Math.round(emissions)
        });
      }
    } 
    // SBTi 1.5°C目標 - 等比減排
    else {
      console.log('使用SBTi目標（等比減排）:', { annualReductionRate: selectedModel.annualReductionRate, finalResidualEmissions });
      
      // 計算需要的年均減排率以達到最終殘留排放
      const requiredAnnualRate = 1 - Math.pow(emissionData.residualEmissionPercentage / 100, 1 / years);
      console.log('調整後的年均減排率:', (requiredAnnualRate * 100).toFixed(2), '%');
      
      for (let i = 0; i <= years; i++) {
        const year = emissionData.baseYear + i;
        
        // 等比減排：每年減固定百分比
        const reductionFactor = Math.pow(1 - requiredAnnualRate, i);
        let emissions = totalEmissions * reductionFactor;
        
        // 確保不低於最終殘留排放
        emissions = Math.max(emissions, finalResidualEmissions);
        const reduction = ((totalEmissions - emissions) / totalEmissions) * 100;
        
        pathway.push({
          year,
          emissions: Math.round(emissions),
          reduction: Math.round(reduction * 10) / 10,
          target: Math.round(emissions)
        });
      }
    }

    console.log('生成的路徑數據:', pathway.slice(0, 5)); // 顯示前5年數據
    console.log('最後一年數據:', pathway[pathway.length - 1]); // 顯示最後一年數據
    
    // 驗證最終年份是否正確達到殘留排放
    const finalYearData = pathway[pathway.length - 1];
    const expectedFinalEmissions = finalResidualEmissions;
    console.log('驗證最終排放:', {
      actual: finalYearData.emissions,
      expected: expectedFinalEmissions,
      difference: Math.abs(finalYearData.emissions - expectedFinalEmissions)
    });
    
    setPathwayData(pathway);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center space-x-8 mb-8">
          {[
            { number: 1, title: '輸入排放數據', icon: Calculator },
            { number: 2, title: '選擇減碳模型', icon: TrendingDown },
            { number: 3, title: '生成路徑規劃', icon: FileBarChart },
            { number: 4, title: '導出報告', icon: Download }
          ].map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isActive = step === stepItem.number;
            const isCompleted = step > stepItem.number;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                  isActive ? 'bg-green-600 border-green-600 text-white' :
                  isCompleted ? 'bg-green-100 border-green-600 text-green-600' :
                  'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-sm font-medium ${
                  isActive || isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {stepItem.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <EmissionDataInput 
              onNext={(data) => {
                setEmissionData(data);
                setStep(2);
              }}
            />
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
                customPhases={selectedModel.id === 'custom-target' ? {
                  nearTermTarget: customTargets.nearTermTarget,
                  longTermTarget: customTargets.longTermTarget
                } : undefined}
              />
              <ReportExport 
                emissionData={{
                  ...emissionData,
                  nearTermTarget: customTargets.nearTermTarget,
                  midTermTarget: customTargets.midTermTarget,
                  longTermTarget: customTargets.longTermTarget,
                  adjustedLongTermAnnualRate: adjustedRates.longTerm
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
