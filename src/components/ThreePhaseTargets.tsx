
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
    nearTermTarget?: { year: number; reductionPercentage: number; annualReductionRate: number };
    longTermTarget?: { year: number; reductionPercentage: number; annualReductionRate: number };
  }) => void;
}

const ThreePhaseTargets: React.FC<ThreePhaseTargetsProps> = ({
  baseYear,
  targetYear,
  residualEmissionPercentage,
  onTargetsChange
}) => {
  const [nearTermYears, setNearTermYears] = useState(5);
  const [nearTermAnnualRate, setNearTermAnnualRate] = useState(2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxReduction = 100 - residualEmissionPercentage;

  // 短期目標
  const nearTermTargetYear = baseYear + nearTermYears;
  const nearTermCumulativeReduction = nearTermAnnualRate * nearTermYears;

  // 長期自動計算
  const longTermYears = targetYear - baseYear;
  const longTermReduction = maxReduction;
  const remainingReductionAfterNearTerm = longTermReduction - nearTermCumulativeReduction;
  const remainingYearsAfterNearTerm = targetYear - nearTermTargetYear;
  const longTermAnnualRate = remainingYearsAfterNearTerm > 0 && remainingReductionAfterNearTerm > 0
    ? remainingReductionAfterNearTerm / remainingYearsAfterNearTerm
    : 0;

  useEffect(() => {
    validateAndUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearTermYears, nearTermAnnualRate, maxReduction, baseYear, targetYear, residualEmissionPercentage]);

  const validateAndUpdate = () => {
    const newErrors: Record<string, string> = {};

    // 驗證年數範圍
    if (nearTermYears < 5 || nearTermYears > 10) {
      newErrors.nearTermYears = '近期目標年數必須介於5~10年';
    }
    // 驗證長期必須大於近期
    if (nearTermTargetYear >= targetYear) {
      newErrors.nearTermYears = '近期目標年必須小於淨零目標年';
    }

    // 驗證年減排率
    if (nearTermAnnualRate <= 0) {
      newErrors.nearTermAnnualRate = '年減排率必須大於0%';
    }
    if (nearTermCumulativeReduction > maxReduction) {
      newErrors.nearTermAnnualRate = `近期累積減排目標不可超過${maxReduction}%`;
    }

    // 長期階段的年減排率預警
    if (longTermAnnualRate > 10) {
      newErrors.longTermAnnualRate = '目前設定會導致長期階段年減排率過高（>10%），請修改近期設定';
    }

    setErrors(newErrors);

    // 無錯誤時才回傳
    if (Object.keys(newErrors).length === 0) {
      onTargetsChange({
        nearTermTarget: {
          year: nearTermTargetYear,
          reductionPercentage: nearTermCumulativeReduction,
          annualReductionRate: nearTermAnnualRate
        },
        longTermTarget: {
          year: targetYear,
          reductionPercentage: longTermReduction,
          annualReductionRate: longTermAnnualRate
        }
      });
    } else {
      onTargetsChange({}); // 若錯誤則回傳空，防止送出
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          自訂減碳目標
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 近期目標 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">近期目標</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nearTermYears">時間區間（5~10年）</Label>
                <Input
                  id="nearTermYears"
                  type="number"
                  value={nearTermYears}
                  onChange={(e) => setNearTermYears(Math.max(5, Math.min(10, Number(e.target.value) || 0)))}
                  className={errors.nearTermYears ? 'border-red-500' : ''}
                  min="5"
                  max="10"
                />
                {errors.nearTermYears && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nearTermYears}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nearTermRate">年減排目標 (%)</Label>
                <Input
                  id="nearTermRate"
                  type="number"
                  step="0.1"
                  value={nearTermAnnualRate}
                  onChange={(e) => setNearTermAnnualRate(parseFloat(e.target.value) || 0)}
                  className={errors.nearTermAnnualRate ? 'border-red-500' : ''}
                />
                {errors.nearTermAnnualRate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.nearTermAnnualRate}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                目標年：{nearTermTargetYear} | 累積減排目標：{nearTermCumulativeReduction.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* 長期目標（自動計算） */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">長期目標（自動計算）</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>剩餘時間（年）</Label>
                <Input value={remainingYearsAfterNearTerm} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label>年減排目標 (%)</Label>
                <Input value={longTermAnnualRate.toFixed(2)} readOnly className="bg-gray-100" />
                {errors.longTermAnnualRate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.longTermAnnualRate}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                目標年：{targetYear} | 累積減排目標：{longTermReduction}%
                <br />
                <span className="text-xs text-gray-500">
                  剩餘減排量：{remainingReductionAfterNearTerm.toFixed(1)}% ÷ 剩餘時間：{remainingYearsAfterNearTerm}年 = {longTermAnnualRate.toFixed(2)}%/年
                </span>
              </p>
            </div>
          </div>

          {/* 目標摘要 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">目標摘要</h4>
            <div className="text-blue-700 text-sm space-y-1">
              <p>近期目標：{nearTermTargetYear}年累積減排{nearTermCumulativeReduction.toFixed(1)}%（年減排{nearTermAnnualRate}%）</p>
              <p>長期目標：{targetYear}年累積減排{longTermReduction}%（年減排{longTermAnnualRate.toFixed(2)}%）</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreePhaseTargets;
