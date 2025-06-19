import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { INDUSTRIES, COMPANY_SIZES, REVENUE_RANGES, SUPPLY_CHAIN_OPTIONS, SUSTAINABILITY_TEAM_OPTIONS, EMISSION_SOURCES } from '@/types/tcfd';
import { Building2, Users, FileCheck, Globe, DollarSign, Link, Shield, Zap, FileText, Info, Target, Lightbulb, BarChart3, ClipboardCheck } from 'lucide-react';
import Stepper, { StepConfig } from '@/components/carbon-tax/Stepper';
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
const tcfdSteps: StepConfig[] = [{
  title: '基本條件輸入',
  icon: FileText
}, {
  title: '風險與機會選擇',
  icon: Shield
}, {
  title: 'LLM 情境評估',
  icon: Zap
}, {
  title: '策略與財務分析',
  icon: DollarSign
}, {
  title: '報告生成',
  icon: FileCheck
}];
const TCFDStage1 = ({
  onComplete
}: TCFDStage1Props) => {
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
  return <div className="max-w-6xl mx-auto space-y-8">
      {/* TCFD 架構說明 */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="space-y-8 p-8">
          {/* TCFD 核心理念介紹 */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Info className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">關於 TCFD 架構</h2>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                氣候相關財務揭露工作小組（<span className="font-semibold text-blue-700">Task Force on Climate-related Financial Disclosures, TCFD</span>）
                建議企業在年度財務申報中揭露氣候相關的財務資訊。
              </p>
              
              <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  TCFD 四大核心要素
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">治理 (Governance)</h4>
                      <p className="text-sm text-gray-600">氣候風險與機會的監督與管理</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">策略 (Strategy)</h4>
                      <p className="text-sm text-gray-600">氣候風險與機會對企業的實際影響</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">風險管理 (Risk Management)</h4>
                      <p className="text-sm text-gray-600">識別、評估與管理氣候風險的流程</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">指標與目標 (Metrics & Targets)</h4>
                      <p className="text-sm text-gray-600">衡量與管理氣候風險的指標</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 模擬器功能說明 */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
              <ClipboardCheck className="h-5 w-5 text-green-700 mr-2" />
              本模擬器將協助您完成
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-green-800">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>氣候風險與機會的識別</span>
              </div>
              <div className="flex items-center space-x-2 text-green-800">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>情境分析與財務影響評估</span>
              </div>
              <div className="flex items-center space-x-2 text-green-800">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>TCFD 報告草稿自動生成</span>
              </div>
            </div>
          </div>

          {/* TCFD 階段圖示 */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">TCFD 評估五階段流程</h3>
            <Stepper currentStep={1} steps={tcfdSteps} themeColor="blue" />
            
            <div className="mt-6 grid md:grid-cols-5 gap-3 text-xs text-gray-600">
              <div className="text-center">
                <p className="font-medium">蒐集企業基本資訊</p>
              </div>
              <div className="text-center">
                <p className="font-medium">選擇相關風險與機會</p>
              </div>
              <div className="text-center">
                <p className="font-medium">AI 生成情境分析</p>
              </div>
              <div className="text-center">
                <p className="font-medium">策略制定與財務量化</p>
              </div>
              <div className="text-center">
                <p className="font-medium">產出完整 TCFD 報告</p>
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
                    {INDUSTRIES.map(ind => <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>)}
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
                    {COMPANY_SIZES.map(size => <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>)}
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
                  <Select value={hasInternationalOperations?.toString() || ''} onValueChange={value => setHasInternationalOperations(value === 'true')}>
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
                      {REVENUE_RANGES.map(range => <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>)}
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
                      {SUPPLY_CHAIN_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>)}
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
                      {SUSTAINABILITY_TEAM_OPTIONS.map(option => <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>)}
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
                    {EMISSION_SOURCES.map(source => <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>)}
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
                <Checkbox id="carbon_inventory" checked={hasCarbonInventory} onCheckedChange={checked => setHasCarbonInventory(!!checked)} />
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
              <Textarea placeholder="請簡述貴公司營運型態（如產品、客戶、主要據點），將有助於系統提供貼近的情境風險建議。（50-100字）" value={businessDescription} onChange={e => setBusinessDescription(e.target.value)} maxLength={100} className="resize-none" />
              <p className="text-sm text-gray-500">
                {businessDescription.length}/100 字
              </p>
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
    </div>;
};
export default TCFDStage1;
