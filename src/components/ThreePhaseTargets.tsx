
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Target } from 'lucide-react';

interface ThreePhaseTargetsProps {
  baseYear: number;
  targetYear: number;
  residualEmissionPercentage: number;
  onTargetsChange: (targets: {
    nearTermTarget?: { year: number; reductionPercentage: number };
    midTermTarget?: { year: number; reductionPercentage: number };
    longTermTarget?: { year: number; reductionPercentage: number };
  }) => void;
}

const ThreePhaseTargets: React.FC<ThreePhaseTargetsProps> = ({
  baseYear,
  targetYear,
  residualEmissionPercentage,
  onTargetsChange
}) => {
  const [nearTermYear, setNearTermYear] = useState(baseYear + 3);
  const [nearTermReduction, setNearTermReduction] = useState(15);
  const [midTermYear, setMidTermYear] = useState(baseYear + 10);
  const [midTermReduction, setMidTermReduction] = useState(40);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxReduction = 100 - residualEmissionPercentage;
  const longTermReduction = maxReduction;

  useEffect(() => {
    validateAndUpdate();
  }, [nearTermYear, nearTermReduction, midTermYear, midTermReduction, maxReduction]);

  const validateAndUpdate = () => {
    const newErrors: Record<string, string> = {};

    // 驗證年份順序
    if (nearTermYear >= midTermYear) {
      newErrors.nearTermYear = '近期目標年必須小於中期目標年';
    }
    if (midTermYear >= targetYear) {
      newErrors.midTermYear = '中期目標年必須小於淨零目標年';
    }

    // 驗證減排百分比
    if (nearTermReduction >= midTermReduction) {
      newErrors.nearTermReduction = '近期減排目標必須小於中期減排目標';
    }
    if (midTermReduction >= maxReduction) {
      newErrors.midTermReduction = `中期減排目標不可超過${maxReduction}%`;
    }
    if (nearTermReduction > maxReduction) {
      newErrors.nearTermReduction = `近期減排目標不可超過${maxReduction}%`;
    }

    setErrors(newErrors);

    // 如果沒有錯誤，更新父組件
    if (Object.keys(newErrors).length === 0) {
      onTargetsChange({
        nearTermTarget: { year: nearTermYear, reductionPercentage: nearTermReduction },
        midTermTarget: { year: midTermYear, reductionPercentage: midTermReduction },
        longTermTarget: { year: targetYear, reductionPercentage: longTermReduction }
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          三階段目標設定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 近期目標 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">近期目標</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nearTermYear">目標年</Label>
                <Input
                  id="nearTermYear"
                  type="number"
                  value={nearTermYear}
                  onChange={(e) => setNearTermYear(parseInt(e.target.value))}
                  className={errors.nearTermYear ? 'border-red-500' : ''}
                />
                {errors.nearTermYear && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nearTermYear}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nearTermReduction">減排目標 (%)</Label>
                <Input
                  id="nearTermReduction"
                  type="number"
                  value={nearTermReduction}
                  onChange={(e) => setNearTermReduction(parseFloat(e.target.value))}
                  className={errors.nearTermReduction ? 'border-red-500' : ''}
                />
                {errors.nearTermReduction && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nearTermReduction}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 中期目標 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">中期目標</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="midTermYear">目標年</Label>
                <Input
                  id="midTermYear"
                  type="number"
                  value={midTermYear}
                  onChange={(e) => setMidTermYear(parseInt(e.target.value))}
                  className={errors.midTermYear ? 'border-red-500' : ''}
                />
                {errors.midTermYear && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.midTermYear}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="midTermReduction">減排目標 (%)</Label>
                <Input
                  id="midTermReduction"
                  type="number"
                  value={midTermReduction}
                  onChange={(e) => setMidTermReduction(parseFloat(e.target.value))}
                  className={errors.midTermReduction ? 'border-red-500' : ''}
                />
                {errors.midTermReduction && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.midTermReduction}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 遠期目標（自動計算） */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">遠期目標（自動計算）</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>目標年</Label>
                <Input value={targetYear} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label>減排目標 (%)</Label>
                <Input value={longTermReduction} readOnly className="bg-gray-100" />
                <p className="text-sm text-gray-500">
                  自動計算：100% - {residualEmissionPercentage}% = {longTermReduction}%
                </p>
              </div>
            </div>
          </div>

          {/* 目標摘要 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">目標摘要</h4>
            <div className="text-blue-700 text-sm space-y-1">
              <p>近期目標：{nearTermYear}年減排{nearTermReduction}%</p>
              <p>中期目標：{midTermYear}年減排{midTermReduction}%</p>
              <p>遠期目標：{targetYear}年減排{longTermReduction}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreePhaseTargets;
