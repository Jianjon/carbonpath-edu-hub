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
    
    // 残留排放量是用戶設定的目標終點（固定不變）
    const residualEmissions = totalEmissions * (emissionData.residualEmissionPercentage / 100);
    
    console.log('=== 減碳路徑規劃邏輯 ===');
    console.log('起點 - 基線排放量:', totalEmissions.toLocaleString(), 'tCO2e');
    console.log('終點 - 残留排放量:', residualEmissions.toLocaleString(), 'tCO2e');
    console.log('用戶設定殘留比例:', emissionData.residualEmissionPercentage, '%');
    console.log('需要減排的總量:', (totalEmissions - residualEmissions).toLocaleString(), 'tCO2e');
    
    let finalPathway: PathwayData[] = [];

    // 自訂減碳目標 - 混合模型（近期等比，長期平滑曲線）
    if (selectedModel.id === 'custom-target' && customTargets.nearTermTarget && customTargets.longTermTarget) {
      console.log('使用自訂目標（混合平滑模型）- 從基線到殘留量');
      
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

      // Phase 2: Smoothed Long-Term Reduction to residualEmissions
      const emissionsAtNearTermEnd = tempEmissions;
      const annualReductionAtNearTermEnd = lastYearEmissions - emissionsAtNearTermEnd;
      
      const C = annualReductionAtNearTermEnd;
      const D = targetYear - nearTermTarget.year;

      if (D > 0) {
        console.log("長期減排模式：二次曲線平滑（拋物線）");
        const y_start = emissionsAtNearTermEnd;
        const y_end = residualEmissions;
        const y_prime_start = -C; // Initial slope

        // y(t) = a*t^2 + b*t + c
        // c = y_start (at t=0)
        // b = y_prime_start (at t=0)
        // a is solved from y(D) = y_end
        const a = (y_end - y_start - y_prime_start * D) / (D * D);
        const b = y_prime_start;
        
        for (let t = 1; t <= D; t++) {
          const currentEmissions = y_start + a * t * t + b * t;
          path.push({
            year: nearTermTarget.year + t,
            emissions: currentEmissions,
            reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
            target: currentEmissions,
          });
        }
      }

      // 確保最終年份精確達到殘留排放量
      const finalIndex = path.findIndex(p => p.year === targetYear);
      if (finalIndex !== -1) {
        path[finalIndex].emissions = residualEmissions;
        path[finalIndex].reduction = ((totalEmissions - residualEmissions) / totalEmissions) * 100;
        path[finalIndex].target = residualEmissions;
      }

      finalPathway = path.map(p => ({
        ...p,
        emissions: Math.round(p.emissions),
        reduction: Math.round(p.reduction * 10) / 10,
        target: Math.round(p.target),
      }));
    } 
    
    // 台灣減碳目標 - 階段性線性減排到殘留量
    else if (selectedModel.id === 'taiwan-target') {
      console.log('使用台灣目標 - 從基線到殘留量:', residualEmissions.toLocaleString());
      let pathway: PathwayData[] = [];
      
      // 計算各階段目標排放量（以殘留量為最終目標）
      const totalReductionNeeded = totalEmissions - residualEmissions;
      
      for (let i = 0; i <= years; i++) {
        const currentYear = emissionData.baseYear + i;
        let targetEmissions;

        if (currentYear === emissionData.baseYear) {
          targetEmissions = totalEmissions;
        } else if (currentYear === emissionData.targetYear) {
          targetEmissions = residualEmissions; // 最終必須達到殘留量
        } else {
          // 按台灣目標階段計算，但最終指向殘留量
          let reductionProgress = 0;
          
          if (currentYear <= 2030) {
            // 到2030年28%減排
            reductionProgress = (currentYear - emissionData.baseYear) / (2030 - emissionData.baseYear) * 0.28;
          } else if (currentYear <= 2032) {
            // 2030-2032年從28%到32%
            reductionProgress = 0.28 + (currentYear - 2030) / (2032 - 2030) * (0.32 - 0.28);
          } else if (currentYear <= 2035) {
            // 2032-2035年從32%到38%
            reductionProgress = 0.32 + (currentYear - 2032) / (2035 - 2032) * (0.38 - 0.32);
          } else {
            // 2035年後線性減排到殘留量
            const finalReductionRatio = (totalEmissions - residualEmissions) / totalEmissions;
            reductionProgress = 0.38 + (currentYear - 2035) / (emissionData.targetYear - 2035) * (finalReductionRatio - 0.38);
          }
          
          targetEmissions = totalEmissions * (1 - reductionProgress);
          // 確保不會低於殘留量
          targetEmissions = Math.max(targetEmissions, residualEmissions);
        }
        
        const actualReduction = ((totalEmissions - targetEmissions) / totalEmissions) * 100;

        pathway.push({
          year: currentYear,
          emissions: Math.round(targetEmissions),
          reduction: Math.round(actualReduction * 10) / 10,
          target: Math.round(targetEmissions)
        });
      }
      finalPathway = pathway;
    } 
    
    // SBTi 1.5°C目標 - 到2030年等比減4.2%，之後平滑減排到殘留量
    else {
      console.log('使用SBTi目標 - 2030年前每年等比減4.2%，之後平滑減排到殘留量');
      let pathway: PathwayData[] = [];
      let tempEmissions = totalEmissions;

      pathway.push({
        year: emissionData.baseYear,
        emissions: tempEmissions,
        reduction: 0,
        target: tempEmissions,
      });

      // Phase 1: Geometric reduction until 2030 (or target year if sooner)
      const sbtiRate = 0.042; // 4.2%
      const endPhase1Year = Math.min(2030, emissionData.targetYear);
      let lastYearEmissions = totalEmissions;
      
      for (let year = emissionData.baseYear + 1; year <= endPhase1Year; year++) {
        lastYearEmissions = tempEmissions;
        tempEmissions *= (1 - sbtiRate);
        pathway.push({
          year,
          emissions: tempEmissions,
          reduction: ((totalEmissions - tempEmissions) / totalEmissions) * 100,
          target: tempEmissions
        });
      }

      // Phase 2: Smoothed reduction from 2031 to target year
      if (emissionData.targetYear > 2030) {
        const emissionsAt2030 = tempEmissions;
        const annualReductionAt2030End = lastYearEmissions - emissionsAt2030;
        
        const C = annualReductionAt2030End;
        const D = emissionData.targetYear - 2030;

        console.log(`2030年後平滑減排: 起始排放 ${emissionsAt2030.toLocaleString()}, ${D}年內需達到 ${residualEmissions.toLocaleString()}`);
        console.log(`2030年終減排量 (C): ${C.toLocaleString()}`);

        if (D > 0) {
          console.log("SBTi 長期減排模式：二次曲線平滑（拋物線）");
          const y_start = emissionsAt2030;
          const y_end = residualEmissions;
          const y_prime_start = -C;

          const a = (y_end - y_start - y_prime_start * D) / (D * D);
          const b = y_prime_start;
          
          for (let t = 1; t <= D; t++) {
            const currentEmissions = y_start + a * t * t + b * t;
            pathway.push({
              year: 2030 + t,
              emissions: currentEmissions,
              reduction: ((totalEmissions - currentEmissions) / totalEmissions) * 100,
              target: currentEmissions,
            });
          }
        }
      }

      // Ensure final year hits residualEmissions exactly to correct for float precision
      const finalIndex = pathway.findIndex(p => p.year === emissionData.targetYear);
      if (finalIndex !== -1) {
        pathway[finalIndex].emissions = residualEmissions;
        pathway[finalIndex].reduction = ((totalEmissions - residualEmissions) / totalEmissions) * 100;
        pathway[finalIndex].target = residualEmissions;
      }
      
      finalPathway = pathway.map(p => ({
        ...p,
        emissions: Math.round(p.emissions),
        reduction: Math.round(p.reduction * 10) / 10,
        target: Math.round(p.target ? p.target : p.emissions)
      }));
    }

    // 添加歷史數據
    const historicalPathwayData: PathwayData[] = (emissionData.historicalData || [])
      .map(d => ({
        year: d.year,
        emissions: d.emissions,
        reduction: undefined,
        target: undefined,
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

    // 驗證最終年份排放量
    const finalYearData = fullPathway[fullPathway.length - 1];
    const actualFinalResidualPercentage = (finalYearData.emissions / baseYearEmissions) * 100;
    console.log('=== 最終驗證 ===');
    console.log('最終排放量:', finalYearData.emissions.toLocaleString(), 'tCO2e');
    console.log('實際殘留比例:', actualFinalResidualPercentage.toFixed(1) + '%');
    console.log('用戶設定比例:', emissionData.residualEmissionPercentage + '%');
    console.log('是否達到目標:', Math.abs(actualFinalResidualPercentage - emissionData.residualEmissionPercentage) < 0.1);
    
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
