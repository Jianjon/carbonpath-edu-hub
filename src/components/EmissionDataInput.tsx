import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { EmissionData } from '../types/carbon';
import { PlusCircle, Trash2, BookOpen } from 'lucide-react';

interface EmissionDataInputProps {
  onNext: (data: EmissionData) => void;
}

interface HistoricalDataEntry {
  id: number;
  year: string;
  emissions: string;
}

const EmissionDataInput: React.FC<EmissionDataInputProps> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    scope1: '',
    scope2: '',
    baseYear: '2024',
    targetYear: '2050',
    residualEmissionPercentage: '5',
    enableRenewableTarget: false,
    renewableTargetType: '',
    reTargetYear: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHistorical, setShowHistorical] = useState(false);
  const [historicalData, setHistoricalData] = useState<HistoricalDataEntry[]>([]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddHistoricalYear = () => {
    const sortedYears = [...historicalData].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const earliestYear = sortedYears.length > 0 ? parseInt(sortedYears[0].year) : parseInt(formData.baseYear);
    
    const newYear = !isNaN(earliestYear) ? earliestYear - 1 : new Date().getFullYear() - 2;

    setHistoricalData(prev => [
      { id: Date.now(), year: newYear.toString(), emissions: '' },
      ...prev
    ]);
  };

  const handleHistoricalChange = (id: number, field: 'year' | 'emissions', value: string) => {
    setHistoricalData(historicalData.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  
  const handleRemoveHistoricalYear = (id: number) => {
    setHistoricalData(historicalData.filter(item => item.id !== id));
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
      newErrors.targetYear = '淨零目標年須大於基準年且不超過2100年';
    }

    if (formData.enableRenewableTarget) {
      if (!formData.renewableTargetType) {
        newErrors.renewableTargetType = '請選擇可再生能源目標類型';
      }
      if (!formData.reTargetYear || parseInt(formData.reTargetYear) <= baseYear || parseInt(formData.reTargetYear) > targetYear) {
        newErrors.reTargetYear = '可再生能源目標年須介於基準年與淨零目標年之間';
      }
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
        targetYear: parseInt(formData.targetYear),
        residualEmissionPercentage: parseInt(formData.residualEmissionPercentage),
        decarbonModel: '',
        reTargetYear: formData.enableRenewableTarget ? parseInt(formData.reTargetYear) : undefined,
        renewableTargetType: formData.enableRenewableTarget ? formData.renewableTargetType : undefined,
        historicalData: showHistorical
          ? historicalData
              .filter(d => d.year && d.emissions && !isNaN(parseInt(d.year)) && !isNaN(parseFloat(d.emissions)))
              .map(d => ({
                year: parseInt(d.year),
                emissions: parseFloat(d.emissions),
              }))
          : undefined,
      };
      onNext(data);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-gray-800">
            <BookOpen className="mr-3 h-7 w-7 text-blue-600" />
            淨零排放目標與基礎資料設定說明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600">
          <p>為協助企業規劃符合科學原則的減碳路徑，本模組提供淨零排放目標模擬與年度減量計算功能。請輸入您企業的範疇一與範疇二碳排放數據，以及基準年與預計達成淨零的目標年。系統將依據所選模型自動產生可行減碳路徑，並作為後續策略評估與報告基礎。</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>輸入基準排放數據</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 基本排放數據 */}
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
                <Label htmlFor="targetYear">淨零目標年</Label>
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

            {/* 歷史排放數據 (選填) */}
            <div className="border-t pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="enableHistoricalData"
                    checked={showHistorical}
                    onCheckedChange={(checked) => setShowHistorical(checked as boolean)}
                  />
                  <Label htmlFor="enableHistoricalData" className="font-medium text-lg">
                    新增歷史排放數據 (選填)
                  </Label>
                </div>
                <p className="text-sm text-gray-500 mb-4">加入基準年以前的排放數據，讓報告圖表更完整。此數據不影響減碳模型計算。</p>
                
                {showHistorical && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    {historicalData.map((item) => (
                      <div key={item.id} className="grid grid-cols-[1fr_1.5fr_auto] gap-2 items-center">
                        <Input
                          type="number"
                          placeholder="年份"
                          value={item.year}
                          onChange={(e) => handleHistoricalChange(item.id, 'year', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="總排放量 (tCO2e)"
                          value={item.emissions}
                          onChange={(e) => handleHistoricalChange(item.id, 'emissions', e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveHistoricalYear(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button onClick={handleAddHistoricalYear} variant="outline" className="w-full">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      增加一筆歷史年份
                    </Button>
                  </div>
                )}
            </div>

            {/* 進階設定 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">進階設定</h3>
              
              {/* 最終殘留排放比例 */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="residualEmission">最終殘留排放比例</Label>
                <Select value={formData.residualEmissionPercentage} onValueChange={(value) => handleInputChange('residualEmissionPercentage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇殘留排放比例" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% - 完全淨零</SelectItem>
                    <SelectItem value="5">5% - 接近淨零</SelectItem>
                    <SelectItem value="10">10% - 低殘留排放</SelectItem>
                    <SelectItem value="20">20% - 中等殘留排放</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">選擇企業最終可接受的殘留排放比例</p>
              </div>

              {/* 可再生能源目標（可選） */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableRenewableTarget"
                    checked={formData.enableRenewableTarget}
                    onCheckedChange={(checked) => handleInputChange('enableRenewableTarget', checked as boolean)}
                  />
                  <Label htmlFor="enableRenewableTarget" className="font-medium">
                    設定可再生能源目標（可選）
                  </Label>
                </div>
                <p className="text-sm text-gray-500">可設定RE100、RE50、RE30或Fit 55等可再生能源目標</p>

                {formData.enableRenewableTarget && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-green-200">
                    <div className="space-y-2">
                      <Label htmlFor="renewableTargetType">可再生能源目標類型</Label>
                      <Select 
                        value={formData.renewableTargetType} 
                        onValueChange={(value) => handleInputChange('renewableTargetType', value)}
                      >
                        <SelectTrigger className={errors.renewableTargetType ? 'border-red-500' : ''}>
                          <SelectValue placeholder="選擇目標類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RE100">RE100 - 100%可再生能源</SelectItem>
                          <SelectItem value="RE50">RE50 - 50%可再生能源</SelectItem>
                          <SelectItem value="RE30">RE30 - 30%可再生能源</SelectItem>
                          <SelectItem value="Fit55">Fit 55 - 歐盟2030氣候目標</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.renewableTargetType && <p className="text-sm text-red-500">{errors.renewableTargetType}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reTargetYear">目標達成年份</Label>
                      <Input
                        id="reTargetYear"
                        type="number"
                        placeholder="例如：2030"
                        value={formData.reTargetYear}
                        onChange={(e) => handleInputChange('reTargetYear', e.target.value)}
                        className={errors.reTargetYear ? 'border-red-500' : ''}
                      />
                      {errors.reTargetYear && <p className="text-sm text-red-500">{errors.reTargetYear}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 排放量摘要 */}
            {formData.scope1 && formData.scope2 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">排放量摘要</h4>
                <p className="text-green-700">
                  總排放量：{(parseFloat(formData.scope1 || '0') + parseFloat(formData.scope2 || '0')).toLocaleString()} tCO2e
                </p>
                <p className="text-green-700">
                  残留排放：{formData.residualEmissionPercentage}%
                </p>
                {formData.enableRenewableTarget && formData.renewableTargetType && (
                  <p className="text-green-700">
                    可再生能源目標：{formData.renewableTargetType}（{formData.reTargetYear}年達成）
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
        下一步：選擇減碳模型
      </Button>
    </div>
  );
};

export default EmissionDataInput;
