
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { INDUSTRIES, COMPANY_SIZES, REVENUE_RANGES, SUPPLY_CHAIN_OPTIONS, SUSTAINABILITY_TEAM_OPTIONS, EMISSION_SOURCES } from '@/types/tcfd';
import { Building2, Users, FileCheck, Globe, DollarSign, Link, Shield, Zap, FileText, Info, CheckCircle, ArrowRight } from 'lucide-react';

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
              
              {/* TCFD 四大核心要素 */}
              <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  TCFD 四大核心要素
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">治理 (Governance)</h4>
                      <p className="text-sm text-gray-600 mt-1">氣候風險與機會的監督與管理</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">策略 (Strategy)</h4>
                      <p className="text-sm text-gray-600 mt-1">氣候風險與機會對企業的實際影響</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                    <Shield className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">風險管理 (Risk Management)</h4>
                      <p className="text-sm text-gray-600 mt-1">識別、評估與管理氣候風險的流程</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <FileCheck className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">指標與目標 (Metrics & Targets)</h4>
                      <p className="text-sm text-gray-600 mt-1">衡量與管理氣候風險的指標</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 模組功能說明 - 仿照其他模組風格 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              此模組能為您提供什麼？
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">風險與機會識別</h4>
                <p className="text-sm text-gray-600">依據 TCFD 官方框架，系統化識別氣候相關風險與機會</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">AI 情境分析</h4>
                <p className="text-sm text-gray-600">運用 AI 技術生成具體的氣候情境與財務影響評估</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">自動化報告生成</h4>
                <p className="text-sm text-gray-600">自動產出符合 TCFD 標準的完整報告草稿</p>
              </div>
            </div>

            {/* 使用流程 */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 text-center">五步驟完成 TCFD 評估</h4>
              <div className="flex items-center justify-between text-sm">
                {[
                  { step: 1, title: '基本資料', desc: '填寫企業基本資訊' },
                  { step: 2, title: '風險機會', desc: '選擇相關項目' },
                  { step: 3, title: 'AI 分析', desc: '生成情境評估' },
                  { step: 4, title: '策略制定', desc: '財務影響分析' },
                  { step: 5, title: '報告產出', desc: '完整 TCFD 報告' }
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center">
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        item.step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.step}
                      </div>
                      <div className="mt-2">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.desc}</div>
                      </div>
                    </div>
                    {index < 4 && <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />}
                  </div>
                ))}
              </div>
            </div>

            {/* 預期效益 */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mt-6">
              <h4 className="font-medium text-green-900 mb-2">完成後您將獲得：</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>符合國際標準的氣候風險評估</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>量化的財務影響分析報告</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>具體可行的氣候策略建議</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>完整的 TCFD 揭露報告草稿</span>
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
                    {INDUSTRIES.map(ind => (
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
                    {COMPANY_SIZES.map(size => (
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
                  <Select 
                    value={hasInternationalOperations?.toString() || ''} 
                    onValueChange={(value) => setHasInternationalOperations(value === 'true')}
                  >
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
                      {REVENUE_RANGES.map(range => (
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
                      {SUPPLY_CHAIN_OPTIONS.map(option => (
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
                      {SUSTAINABILITY_TEAM_OPTIONS.map(option => (
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
                    {EMISSION_SOURCES.map(source => (
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

            {/* 組織營運簡述 */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <Label className="text-lg font-medium">組織營運簡述（選填）</Label>
              </div>
              <Textarea 
                placeholder="請簡述貴公司營運型態（如產品、客戶、主要據點），將有助於系統提供貼近的情境風險建議。（50-100字）" 
                value={businessDescription} 
                onChange={(e) => setBusinessDescription(e.target.value)} 
                maxLength={100} 
                className="resize-none" 
              />
              <p className="text-sm text-gray-500">
                {businessDescription.length}/100 字
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
