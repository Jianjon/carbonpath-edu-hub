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

export interface EmissionData {
  scope1: number;
  scope2: number;
  baseYear: number;
  targetYear: number;
  residualEmissionPercentage: number;
  decarbonModel: string;
  reTargetYear?: number;
  renewableTargetType?: string;
  historicalData?: { year: number; emissions: number }[];
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
  reduction?: number;
  target?: number;
  annualReduction?: number;
  remainingPercentage?: number;
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

  const generatePathway = () => {
    if (!emissionData || !selectedModel) return;

    const totalEmissions = emissionData.scope1 + emissionData.scope2;
    const years = emissionData.targetYear - emissionData.baseYear;
    let finalPathway: PathwayData[] = [];

    console.log('開始生成路徑:', { 
      totalEmissions, 
      years, 
      selectedModel: selectedModel.id, 
      residualPercentage: emissionData.residualEmissionPercentage 
    });

    const finalResidualEmissions = totalEmissions * (emissionData.residualEmissionPercentage / 100);
    console.log('最終殘留排放量:', finalResidualEmissions, `(${emissionData.residualEmissionPercentage}%)`);

    // 自訂減碳目標 - 混合模型（近期等比，長期平滑曲線）
    if (selectedModel.id === 'custom-target' && customTargets.nearTermTarget && customTargets.longTermTarget) {
      console.log('使用自訂目標（混合平滑模型）:', customTargets);
      
      const path: PathwayData[] = [];
      let tempEmissions = totalEmissions;

      const { baseYear, targetYear } = emissionData;
      const { nearTermTarget } = customTargets;
      const nearTermAnnualRate = nearTermTarget.annualReductionRate / 100;

      // Phase 1: Near-Term Geometric Reduction
      path.push({
        year: baseYear,
        emissions: tempEmissions,
        reduction: 0,
        target: tempEmissions
      });

      let lastYearEmissions = totalEmissions;
      for (let year = baseYear + 1; year <= nearTermTarget.year; year++) {
        lastYearEmissions = tempEmissions;
        tempEmissions *= (1 - nearTermAnnualRate);
        path.push({
          year,
          emissions: tempEmissions,
          reduction: ((totalEmissions - tempEmissions) / totalEmissions) * 100,
          target: tempEmissions,
        });
      }

      // Phase 2: Smoothed Long-Term Reduction
      const emissionsAtNearTermEnd = tempEmissions;
      const annualReductionAtNearTermEnd = lastYearEmissions - emissionsAtNearTermEnd;
      
      const C = annualReductionAtNearTermEnd;
      const D = targetYear - nearTermTarget.year;
      const R_total = emissionsAtNearTermEnd - finalResidualEmissions;

      if (D > 0) {
        // "Hump" case vs "Slope" case
        if (C * D < R_total) {
          // Use downward parabola for annual reduction when more effort is needed
          console.log("長期減排模式：拋物線（加速減排）");
          const A = 6 * (C * D - R_total) / (D * D * D);
          const B = -A * D;
          
          for (let t = 1; t <= D; t++) {
            const annualReduction = A * t * t + B * t + C;
            tempEmissions -= annualReduction;
            path.push({
              year: nearTermTarget.year + t,
              emissions: tempEmissions,
              reduction: ((totalEmissions - tempEmissions) / totalEmissions) * 100,
              target: tempEmissions,
            });
          }
        } else {
          // Use linear decrease for annual reduction when initial reduction is already high
          console.log("長期減排模式：線性遞減");
          const y_D = (2 * R_total / D) - C;
          for (let t = 1; t <= D; t++) {
            const progress = (t - 1) / (D - 1);
            const annualReduction = C + (y_D - C) * progress;
            tempEmissions -= annualReduction;
            path.push({
              year: nearTermTarget.year + t,
              emissions: tempEmissions,
              reduction: ((totalEmissions - tempEmissions) / totalEmissions) * 100,
              target: tempEmissions,
            });
          }
        }
      }

      // Final adjustment to ensure target is met exactly
      const finalIndex = path.findIndex(p => p.year === targetYear);
      if (finalIndex !== -1) {
        path[finalIndex].emissions = finalResidualEmissions;
        path[finalIndex].reduction = ((totalEmissions - finalResidualEmissions) / totalEmissions) * 100;
      }

      finalPathway = path.map(p => ({
        ...p,
        emissions: Math.round(p.emissions),
        reduction: Math.round(p.reduction * 10) / 10,
        target: Math.round(p.emissions),
      }));
      
      setPathwayData(finalPathway);
      setStep(4);
      return;
    } 
    
    // 台灣減碳目標 - 階段性線性減排
    else if (selectedModel.id === 'taiwan-target') {
      console.log('使用台灣目標, 残留排放量:', finalResidualEmissions);
      let pathway: PathwayData[] = []; // Renamed for consistency
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
      finalPathway = pathway;
    } 
    // SBTi 1.5°C目標 - 等比減排
    else {
      console.log('使用SBTi目標（等比減排）:', { annualReductionRate: selectedModel.annualReductionRate, finalResidualEmissions });
      let pathway: PathwayData[] = []; // Renamed for consistency
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
      finalPathway = pathway;
    }

    // Prepend historical data if it exists
    const historicalPathwayData: PathwayData[] = (emissionData.historicalData || [])
      .map(d => ({
        year: d.year,
        emissions: d.emissions,
        reduction: undefined, // Not applicable for historical data
        target: undefined, // No target for past data
      }))
      .sort((a, b) => a.year - b.year);
      
    let fullPathway = [...historicalPathwayData, ...finalPathway];
    
    const baseYearEmissions = emissionData.scope1 + emissionData.scope2;
    fullPathway = fullPathway.map((dataPoint, index, arr) => {
      let annualReduction: number | undefined = undefined;
      if (index > 0) {
        annualReduction = arr[index - 1].emissions - dataPoint.emissions;
      }
  
      let remainingPercentage: number | undefined = undefined;
      if (dataPoint.year >= emissionData.baseYear) {
        remainingPercentage = (dataPoint.emissions / baseYearEmissions) * 100;
      }
  
      return {
        ...dataPoint,
        annualReduction,
        remainingPercentage,
      };
    });

    console.log('生成的完整路徑數據(含歷史):', fullPathway.slice(0, 5)); // 顯示前5年數據
    console.log('最後一年數據:', fullPathway[fullPathway.length - 1]); // 顯示最後一年數據
    
    // 驗證最終年份是否正確達到殘留排放
    const finalYearData = fullPathway[fullPathway.length - 1];
    const expectedFinalEmissions = finalResidualEmissions;
    console.log('驗證最終排放:', {
      actual: finalYearData.emissions,
      expected: expectedFinalEmissions,
      difference: Math.abs(finalYearData.emissions - expectedFinalEmissions)
    });
    
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
