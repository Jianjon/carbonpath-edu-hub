
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EmissionData } from '../pages/CarbonPath';

interface EmissionDataInputProps {
  onNext: (data: EmissionData) => void;
}

const EmissionDataInput: React.FC<EmissionDataInputProps> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    scope1: '',
    scope2: '',
    baseYear: new Date().getFullYear().toString(),
    targetYear: (new Date().getFullYear() + 10).toString()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.scope1 || parseFloat(formData.scope1) < 0) {
      newErrors.scope1 = '請輸入有效的範疇一排放量';
    }

    if (!formData.scope2 || parseFloat(formData.scope2) < 0) {
      newErrors.scope2 = '請輸入有效的範疇二排放量';
    }

    const baseYear = parseInt(formData.baseYear);
    const targetYear = parseInt(formData.targetYear);

    if (baseYear < 2000 || baseYear > new Date().getFullYear()) {
      newErrors.baseYear = '基準年須介於2000年至今年';
    }

    if (targetYear <= baseYear || targetYear > 2100) {
      newErrors.targetYear = '目標年須大於基準年且不超過2100年';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const data: EmissionData = {
        scope1: parseFloat(formData.scope1),
        scope2: parseFloat(formData.scope2),
        baseYear: parseInt(formData.baseYear),
        targetYear: parseInt(formData.targetYear)
      };
      onNext(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>輸入基準排放數據</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="scope1">範疇一排放量 (tCO2e)</Label>
              <Input
                id="scope1"
                type="number"
                placeholder="例如：1000"
                value={formData.scope1}
                onChange={(e) => handleInputChange('scope1', e.target.value)}
                className={errors.scope1 ? 'border-red-500' : ''}
              />
              {errors.scope1 && <p className="text-sm text-red-500">{errors.scope1}</p>}
              <p className="text-sm text-gray-500">直接排放（如燃料燃燒、製程排放）</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope2">範疇二排放量 (tCO2e)</Label>
              <Input
                id="scope2"
                type="number"
                placeholder="例如：2000"
                value={formData.scope2}
                onChange={(e) => handleInputChange('scope2', e.target.value)}
                className={errors.scope2 ? 'border-red-500' : ''}
              />
              {errors.scope2 && <p className="text-sm text-red-500">{errors.scope2}</p>}
              <p className="text-sm text-gray-500">間接排放（購買電力、蒸汽等）</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseYear">基準年</Label>
              <Input
                id="baseYear"
                type="number"
                value={formData.baseYear}
                onChange={(e) => handleInputChange('baseYear', e.target.value)}
                className={errors.baseYear ? 'border-red-500' : ''}
              />
              {errors.baseYear && <p className="text-sm text-red-500">{errors.baseYear}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetYear">目標年</Label>
              <Input
                id="targetYear"
                type="number"
                value={formData.targetYear}
                onChange={(e) => handleInputChange('targetYear', e.target.value)}
                className={errors.targetYear ? 'border-red-500' : ''}
              />
              {errors.targetYear && <p className="text-sm text-red-500">{errors.targetYear}</p>}
            </div>
          </div>

          {formData.scope1 && formData.scope2 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">排放量摘要</h4>
              <p className="text-green-700">
                總排放量：{(parseFloat(formData.scope1 || '0') + parseFloat(formData.scope2 || '0')).toLocaleString()} tCO2e
              </p>
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
            下一步：選擇減碳模型
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmissionDataInput;
