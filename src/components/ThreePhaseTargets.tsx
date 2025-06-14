
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
    midTermTarget?: { year: number; reductionPercentage: number; annualReductionRate: number };
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
  const [midTermYears, setMidTermYears] = useState(10);
  const [midTermAnnualRate, setMidTermAnnualRate] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maxReduction = 100 - residualEmissionPercentage;

  // 計算目標年和累積減排百分比
  const nearTermTargetYear = baseYear + nearTermYears;
  const midTermTargetYear = baseYear + midTermYears;
  const nearTermCumulativeReduction = nearTermAnnualRate * nearTermYears;
  
  // 修正：先計算中期累積減排
  const midTermCumulativeReduction = nearTermCumulativeReduction + (midTermAnnualRate * (midTermYears - nearTermYears));

  // 遠期目標計算 - 根據中期目標完成後的剩餘減排量和剩餘時間計算
  const longTermYears = targetYear - baseYear;
  const longTermReduction = maxReduction;
  const remainingReductionAfterMidTerm = longTermReduction - midTermCumulativeReduction;
  const remainingYearsAfterMidTerm = targetYear - midTermTargetYear;
  const longTermAnnualRate = remainingYearsAfterMidTerm > 0 && remainingReductionAfterMidTerm > 0
    ? remainingReductionAfterMidTerm / remainingYearsAfterMidTerm 
    : 0;

  useEffect(() => {
    validateAndUpdate();
  }, [nearTermYears, nearTermAnnualRate, midTermYears, midTermAnnualRate, maxReduction]);

  const validateAndUpdate = () => {
    const newErrors: Record<string, string> = {};

    // 驗證時間區間
    if (nearTermYears >= midTermYears) {
      newErrors.nearTermYears = '近期目標年數必須小於中期目標年數';
    }
    if (midTermTargetYear >= targetYear) {
      newErrors.midTermYears = '中期目標年必須小於淨零目標年';
    }

    // 驗證年減排率
    if (nearTermAnnualRate <= 0) {
      newErrors.nearTermAnnualRate = '年減排率必須大於0%';
    }
    if (midTermAnnualRate <= 0) {
      newErrors.midTermAnnualRate = '年減排率必須大於0%';
    }

    // 重新計算中期累積減排（考慮近期目標基礎）
    const calculatedMidTermCumulative = nearTermCumulativeReduction + 
      (midTermAnnualRate * (midTermYears - nearTermYears));

    // 驗證累積減排目標
    if (nearTermCumulativeReduction >= calculatedMidTermCumulative) {
      newErrors.midTermAnnualRate = '中期階段的年減排率設定會導致累積減排目標不合理';
    }
    if (calculatedMidTermCumulative >= maxReduction) {
      newErrors.midTermAnnualRate = `中期累積減排目標不可超過${maxReduction}%`;
    }
    if (nearTermCumulativeReduction > maxReduction) {
      newErrors.nearTermAnnualRate = `近期累積減排目標不可超過${maxReduction}%`;
    }

    // 檢查遠期目標是否合理
    const calculatedLongTermAnnualRate = remainingYearsAfterMidTerm > 0 && remainingReductionAfterMidTerm > 0
      ? remainingReductionAfterMidTerm / remainingYearsAfterMidTerm 
      : 0;
    
    if (calculatedLongTermAnnualRate > 10) {
      newErrors.midTermAnnualRate = '目前設定會導致遠期階段年減排率過高（>10%），請調整中期目標';
    }

    setErrors(newErrors);

    // 如果沒有錯誤，更新父組件
    if (Object.keys(newErrors).length === 0) {
      onTargetsChange({
        nearTermTarget: { 
          year: nearTermTargetYear, 
          reductionPercentage: nearTermCumulativeReduction,
          annualReductionRate: nearTermAnnualRate
        },
        midTermTarget: { 
          year: midTermTargetYear, 
          reductionPercentage: calculatedMidTermCumulative,
          annualReductionRate: midTermAnnualRate
        },
        longTermTarget: { 
          year: targetYear, 
          reductionPercentage: longTermReduction,
          annualReductionRate: calculatedLongTermAnnualRate
        }
      });
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
                <Label htmlFor="nearTermYears">時間區間（年）</Label>
                <Input
                  id="nearTermYears"
                  type="number"
                  value={nearTermYears}
                  onChange={(e) => setNearTermYears(parseInt(e.target.value) || 0)}
                  className={errors.nearTermYears ? 'border-red-500' : ''}
                  min="3"
                  max="5"
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

          {/* 中期目標 */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">中期目標</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="midTermYears">時間區間（年）</Label>
                <Input
                  id="midTermYears"
                  type="number"
                  value={midTermYears}
                  onChange={(e) => setMidTermYears(parseInt(e.target.value) || 0)}
                  className={errors.midTermYears ? 'border-red-500' : ''}
                  min="5"
                  max="15"
                />
                {errors.midTermYears && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.midTermYears}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="midTermRate">年減排目標 (%)</Label>
                <Input
                  id="midTermRate"
                  type="number"
                  step="0.1"
                  value={midTermAnnualRate}
                  onChange={(e) => setMidTermAnnualRate(parseFloat(e.target.value) || 0)}
                  className={errors.midTermAnnualRate ? 'border-red-500' : ''}
                />
                {errors.midTermAnnualRate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.midTermAnnualRate}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                目標年：{midTermTargetYear} | 累積減排目標：{midTermCumulativeReduction.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* 遠期目標（自動計算） */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">遠期目標（自動計算）</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>剩餘時間（年）</Label>
                <Input value={remainingYearsAfterMidTerm} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label>年減排目標 (%)</Label>
                <Input value={longTermAnnualRate.toFixed(2)} readOnly className="bg-gray-100" />
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                目標年：{targetYear} | 累積減排目標：{longTermReduction}%
                <br />
                <span className="text-xs text-gray-500">
                  剩餘減排量：{remainingReductionAfterMidTerm.toFixed(1)}% ÷ 剩餘時間：{remainingYearsAfterMidTerm}年 = {longTermAnnualRate.toFixed(2)}%/年
                </span>
              </p>
            </div>
          </div>

          {/* 目標摘要 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">目標摘要</h4>
            <div className="text-blue-700 text-sm space-y-1">
              <p>近期目標：{nearTermTargetYear}年累積減排{nearTermCumulativeReduction.toFixed(1)}%（年減排{nearTermAnnualRate}%）</p>
              <p>中期目標：{midTermTargetYear}年累積減排{midTermCumulativeReduction.toFixed(1)}%（年減排{midTermAnnualRate}%）</p>
              <p>遠期目標：{targetYear}年累積減排{longTermReduction}%（年減排{longTermAnnualRate.toFixed(2)}%）</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreePhaseTargets;
