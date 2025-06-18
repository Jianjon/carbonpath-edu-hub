
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { INDUSTRIES, COMPANY_SIZES } from '@/types/tcfd';
import { Building2, Users, FileCheck } from 'lucide-react';

interface TCFDStage1Props {
  onComplete: (data: {
    industry: string;
    company_size: string;
    has_carbon_inventory: boolean;
  }) => void;
}

const TCFDStage1 = ({ onComplete }: TCFDStage1Props) => {
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [hasCarbonInventory, setHasCarbonInventory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!industry || !companySize) return;

    setIsSubmitting(true);
    try {
      await onComplete({
        industry,
        company_size: companySize,
        has_carbon_inventory: hasCarbonInventory,
      });
    } catch (error) {
      console.error('Error submitting stage 1:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = industry && companySize;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">第一階段：基本條件輸入</CardTitle>
          <p className="text-gray-600 text-center">
            請提供您的企業基本資訊，這些資料將作為後續風險與機會分析的基礎
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 產業別選擇 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <Label htmlFor="industry" className="text-lg font-medium">
                  產業別 <span className="text-red-500">*</span>
                </Label>
              </div>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="請選擇您的產業別" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                產業別將影響風險與機會的類型及相關情境的生成
              </p>
            </div>

            {/* 企業規模選擇 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <Label htmlFor="company_size" className="text-lg font-medium">
                  企業規模 <span className="text-red-500">*</span>
                </Label>
              </div>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="請選擇您的企業規模" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                企業規模將影響風險影響程度和應對策略的複雜度
              </p>
            </div>

            {/* 碳盤查完成狀態 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileCheck className="h-5 w-5 text-purple-600" />
                <Label className="text-lg font-medium">碳盤查完成狀態</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="carbon_inventory"
                  checked={hasCarbonInventory}
                  onCheckedChange={(checked) => setHasCarbonInventory(!!checked)}
                />
                <Label htmlFor="carbon_inventory" className="text-sm">
                  我們已完成溫室氣體盤查（GHG Inventory）
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                已完成碳盤查的企業將獲得更精確的財務影響評估和策略建議
              </p>
            </div>

            {/* 說明區塊 */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">關於 TCFD 架構</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                氣候相關財務揭露工作小組（TCFD）建議企業在年度財務申報中揭露氣候相關的財務資訊。
                本模擬器將協助您依據 TCFD 四大核心要素（治理、策略、風險管理、指標與目標）
                完成風險與機會的識別、評估與揭露內容準備。
              </p>
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-8 py-3 text-lg"
              >
                {isSubmitting ? '建立評估中...' : '開始 TCFD 評估'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDStage1;
