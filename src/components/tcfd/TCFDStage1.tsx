import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { INDUSTRIES, COMPANY_SIZES, REVENUE_RANGES, SUPPLY_CHAIN_OPTIONS, SUSTAINABILITY_TEAM_OPTIONS, EMISSION_SOURCES } from '@/types/tcfd';
import { Building2, Users, FileCheck, Globe, DollarSign, Link, Shield, Zap, FileText } from 'lucide-react';

interface TCFDStage1Props {
  onComplete: (data: {
    industry: string;
    company_size: string;
    has_carbon_inventory: boolean;
    has_international_operations?: boolean;
    annual_revenue_range?: string;
    supply_chain_carbon_disclosure?: string;
    has_sustainability_team?: string;
    main_emission_source?: string;
    business_description?: string;
  }) => void;
}

const getBusinessDescriptionPlaceholder = (industry: string, companySize: string) => {
  const suggestions = {
    '製造業': {
      '大型企業': '本公司主要生產電子零組件，在台灣及東南亞設有生產基地，主要客戶為國際品牌廠商，年產能約1000萬件。',
      '中小企業': '專精於精密機械加工，主要服務汽車零組件製造商，擁有20年技術經驗及穩定客戶群。',
      '微型企業': '從事手工具製造，以內銷市場為主，產品銷售至五金通路及工業用戶。'
    },
    '服務業': {
      '大型企業': '提供全方位資訊服務解決方案，服務據點遍及全台，客戶涵蓋金融、製造及政府機關。',
      '中小企業': '專業會計師事務所，提供中小企業財稅諮詢及記帳服務，客戶主要分布在大台北地區。',
      '微型企業': '經營在地餐飲服務，以傳統料理為特色，主要服務社區居民及觀光客。'
    },
    '金融業': {
      '大型企業': '區域性銀行，提供個人及企業金融服務，分行網點遍及北部地區，資產規模達千億元。',
      '中小企業': '專業保險代理公司，主要銷售壽險及產險商品，服務客戶超過萬名。',
      '微型企業': '投資顧問公司，專精於個人理財規劃及投資諮詢服務。'
    }
  };

  const industryKey = Object.keys(suggestions).find(key => industry.includes(key)) || '製造業';
  const sizeKey = companySize.includes('大型') ? '大型企業' : 
                 companySize.includes('中') ? '中小企業' : '微型企業';
  
  return suggestions[industryKey]?.[sizeKey] || '請簡述貴公司主要營運型態、產品服務、目標市場等資訊...';
};

const TCFDStage1 = ({ onComplete }: TCFDStage1Props) => {
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [hasCarbonInventory, setHasCarbonInventory] = useState(false);
  const [hasInternationalOperations, setHasInternationalOperations] = useState<boolean | undefined>(undefined);
  const [annualRevenueRange, setAnnualRevenueRange] = useState('');
  const [supplyChainDisclosure, setSupplyChainDisclosure] = useState('');
  const [hasSustainabilityTeam, setHasSustainabilityTeam] = useState('');
  const [mainEmissionSource, setMainEmissionSource] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
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
        has_international_operations: hasInternationalOperations,
        annual_revenue_range: annualRevenueRange || undefined,
        supply_chain_carbon_disclosure: supplyChainDisclosure || undefined,
        has_sustainability_team: hasSustainabilityTeam || undefined,
        main_emission_source: mainEmissionSource || undefined,
        business_description: businessDescription || undefined
      });
    } catch (error) {
      console.error('Error submitting stage 1:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = industry && companySize;
  const placeholderText = getBusinessDescriptionPlaceholder(industry, companySize);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* TCFD 介紹卡片 */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">TCFD 模擬器</CardTitle>
              <p className="text-lg text-blue-700 font-medium">氣候相關財務揭露架構評估工具</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* 關於 TCFD */}
          <div className="text-center space-y-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                氣候相關財務揭露工作小組（<span className="font-semibold text-blue-700">Task Force on Climate-related Financial Disclosures, TCFD</span>）
                建議企業在年度財務申報中揭露氣候相關的財務資訊，協助投資者和其他利害關係人了解氣候變化對企業的影響。
              </p>
            </div>
          </div>

          {/* 模組功能說明 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">模組功能與特色</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">🎯 智能化評估</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 根據產業特性客製化風險與機會識別</li>
                  <li>• AI 生成情境分析與財務影響評估</li>
                  <li>• 自動化報告產出，符合 TCFD 架構</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">📊 專業級輸出</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 完整四大核心要素分析報告</li>
                  <li>• 可直接參考的揭露內容草稿</li>
                  <li>• 財務影響量化分析與策略建議</li>
                </ul>
              </div>
            </div>

            {/* 使用流程 */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">五步驟完成評估</h4>
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
                {[
                  { step: 1, title: '基本資料', desc: '企業基本資訊' },
                  { step: 2, title: '風險機會', desc: '選擇相關項目' },
                  { step: 3, title: 'AI 分析', desc: '情境評估生成' },
                  { step: 4, title: '策略制定', desc: '財務影響分析' },
                  { step: 5, title: '報告產出', desc: 'TCFD 報告' }
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className="text-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        item.step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.step}
                      </div>
                      <div className="mt-2 max-w-20">
                        <div className="font-medium text-gray-900 text-xs">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.desc}</div>
                      </div>
                    </div>
                    {index < 4 && <div className="mx-2 text-gray-400">→</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* 預期效益 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mt-6">
              <h4 className="font-medium text-green-900 mb-3">完成後您將獲得：</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-green-800">氣候風險與機會的系統性分析架構</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-green-800">產業專屬的情境模擬與評估報告</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-green-800">財務影響量化分析與應對策略建議</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-green-800">符合 TCFD 架構的完整揭露草稿</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要表單 */}
      <Card>
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-2xl">第一階段：基本條件輸入</CardTitle>
          <p className="text-gray-600 max-w-2xl mx-auto">
            請提供您的企業基本資訊，這些資料將作為後續風險與機會分析的基礎。
            資訊愈完整，AI 分析結果愈精準。
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本資訊區塊 */}
            <div className="grid md:grid-cols-2 gap-6">
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
              </div>
            </div>

            {/* 專業顧問建議欄位 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">專業評估資訊</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* 國際營運 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <Label className="text-base font-medium">企業是否具跨地區／國際營運</Label>
                  </div>
                  <Select value={hasInternationalOperations?.toString() || ''} onValueChange={(value) => setHasInternationalOperations(value === 'true')}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="請選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">是</SelectItem>
                      <SelectItem value="false">否</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 營業額區間 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <Label className="text-base font-medium">去年營業額區間</Label>
                  </div>
                  <Select value={annualRevenueRange} onValueChange={setAnnualRevenueRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="請選擇營業額區間" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 供應鏈碳揭露 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Link className="h-5 w-5 text-orange-600" />
                    <Label className="text-base font-medium">是否有被列入供應鏈碳揭露要求</Label>
                  </div>
                  <Select value={supplyChainDisclosure} onValueChange={setSupplyChainDisclosure}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="請選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLY_CHAIN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 永續管理人員 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-medium">是否設有專責永續管理人員或小組</Label>
                  </div>
                  <Select value={hasSustainabilityTeam} onValueChange={setHasSustainabilityTeam}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="請選擇" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUSTAINABILITY_TEAM_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 主要溫室氣體來源 */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <Label className="text-base font-medium">預估主要溫室氣體來源</Label>
                </div>
                <Select value={mainEmissionSource} onValueChange={setMainEmissionSource}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="請選擇主要排放源" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMISSION_SOURCES.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 碳盤查完成狀態 */}
            <div className="space-y-4 border-t pt-6">
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
            </div>

            {/* 組織營運簡述 - 更新為200字並增加智能提示 */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <Label className="text-lg font-medium">組織營運簡述（選填）</Label>
              </div>
              <div className="space-y-2">
                <Textarea 
                  placeholder={placeholderText}
                  value={businessDescription} 
                  onChange={(e) => setBusinessDescription(e.target.value)} 
                  maxLength={200} 
                  rows={4}
                  className="resize-none" 
                />
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-500">
                    {businessDescription.length}/200 字
                  </p>
                  <p className="text-gray-500 text-xs">
                    💡 請避免透露具體數據、客戶名稱等機密資訊
                  </p>
                </div>
              </div>
            </div>

            {/* 提交按鈕 */}
            <div className="flex justify-center pt-6">
              <Button type="submit" disabled={!isValid || isSubmitting} className="px-8 py-3 text-lg">
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
