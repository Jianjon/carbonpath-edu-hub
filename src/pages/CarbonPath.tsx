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
  const [pathwayData, setPathwayData] = useState<PathwayData[]>([]);

  const generatePathway = () => {
    if (!emissionData || !selectedModel) return;

    const totalEmissions = emissionData.scope1 + emissionData.scope2;
    const years = emissionData.targetYear - emissionData.baseYear;
    const pathway: PathwayData[] = [];

    for (let i = 0; i <= years; i++) {
      const year = emissionData.baseYear + i;
      const reductionFactor = Math.pow(1 - selectedModel.annualReductionRate / 100, i);
      const emissions = totalEmissions * reductionFactor;
      const reduction = ((totalEmissions - emissions) / totalEmissions) * 100;
      const target = totalEmissions * (1 - (selectedModel.targetReduction / 100) * (i / years));

      pathway.push({
        year,
        emissions: Math.round(emissions),
        reduction: Math.round(reduction * 10) / 10,
        target: Math.round(target)
      });
    }

    setPathwayData(pathway);
    setStep(4);
  };

  const resetPlanning = () => {
    setStep(1);
    setEmissionData(null);
    setSelectedModel(null);
    setPathwayData([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
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

      {/* Progress Steps */}
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

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {step === 1 && (
            <EmissionDataInput 
              onNext={(data) => {
                setEmissionData(data);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <ModelSelection 
              onNext={(model) => {
                setSelectedModel(model);
                setStep(3);
              }}
              onBack={() => setStep(1)}
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
                      <p>目標年：{emissionData.targetYear}</p>
                      <p>殘留排放：{emissionData.residualEmissionPercentage}%</p>
                      <p>減碳模型：{emissionData.decarbonModel}
                        {emissionData.reTargetYear && ` (${emissionData.reTargetYear})`}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">減碳模型</h4>
                      <p>模型：{selectedModel.name}</p>
                      <p>目標減排：{selectedModel.targetReduction}%</p>
                      <p>年均減排率：{selectedModel.annualReductionRate}%</p>
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
              <PathwayChart data={pathwayData} />
              <ReportExport 
                emissionData={emissionData}
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
