import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { INDUSTRIES, COMPANY_SIZES, REVENUE_RANGES, SUPPLY_CHAIN_OPTIONS, SUSTAINABILITY_TEAM_OPTIONS, EMISSION_SOURCES } from '@/types/tcfd';
import { Building2, FileText, Target, Lightbulb, ShieldCheck } from 'lucide-react';
import TCFDContentCard from './shared/TCFDContentCard';
import TCFDFormSection from './shared/TCFDFormSection';
import TCFDProcessFlow from './shared/TCFDProcessFlow';
import InfoCard from '../shared/InfoCard';
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
  const sizeKey = companySize.includes('大型') ? '大型企業' : companySize.includes('中') ? '中小企業' : '微型企業';
  return suggestions[industryKey]?.[sizeKey] || '請簡述貴公司主要營運型態、產品服務、目標市場等資訊...';
};
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
  const placeholderText = getBusinessDescriptionPlaceholder(industry, companySize);
  return <div className="max-w-4xl mx-auto space-y-8">
      {/* 標題區 - 統一風格 */}
      <div className="text-center space-y-4">
        
        
      </div>

      {/* 流程圖 - 統一風格 */}
      <TCFDProcessFlow />

      {/* 簡介說明 - 統一風格 */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            
            <h3 className="font-semibold text-gray-900 mb-2">智能化評估</h3>
            <p className="text-sm text-gray-600">
              根據產業特性客製化風險識別，AI 驅動的情境分析與評估
            </p>
          </div>
          <div className="text-center">
            
            <h3 className="font-semibold text-gray-900 mb-2">專業級輸出</h3>
            <p className="text-sm text-gray-600">
              涵蓋 TCFD 四大核心要素，可直接參考的揭露內容草稿
            </p>
          </div>
          <div className="text-center">
            
            <h3 className="font-semibold text-gray-900 mb-2">法規合規</h3>
            <p className="text-sm text-gray-600">
              符合金管會 ESG 資訊揭露要求，對接國際 TCFD 框架標準
            </p>
          </div>
        </div>
      </div>

      {/* 主要表單 - 統一風格 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            企業基本資訊
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 基本資訊區塊 */}
          <div className="grid md:grid-cols-2 gap-6">
            <TCFDFormSection title="產業別" description="請選擇最符合您企業的主要產業分類" required>
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
            </TCFDFormSection>

            <TCFDFormSection title="企業規模" description="請根據員工人數或營業額選擇企業規模" required>
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
            </TCFDFormSection>
          </div>

          {/* 專業評估資訊 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">專業評估資訊</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <TCFDFormSection title="國際營運狀況" description="是否有跨地區或國際營運據點">
                <Select value={hasInternationalOperations?.toString() || ''} onValueChange={value => setHasInternationalOperations(value === 'true')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="請選擇" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">是</SelectItem>
                    <SelectItem value="false">否</SelectItem>
                  </SelectContent>
                </Select>
              </TCFDFormSection>

              <TCFDFormSection title="營業額區間" description="去年度企業營業額範圍">
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
              </TCFDFormSection>

              <TCFDFormSection title="供應鏈碳揭露" description="是否被要求進行供應鏈碳排放揭露">
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
              </TCFDFormSection>

              <TCFDFormSection title="永續管理組織" description="是否設有專責永續管理人員或團隊">
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
              </TCFDFormSection>
            </div>

            <div className="mt-6">
              <TCFDFormSection title="主要溫室氣體來源" description="預估企業營運中最主要的溫室氣體排放來源">
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
              </TCFDFormSection>
            </div>
          </div>

          {/* 碳盤查完成狀態 */}
          <div className="border-t border-gray-200 pt-6">
            <TCFDFormSection title="碳盤查完成狀態" description="是否已完成溫室氣體盤查作業">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox id="carbon_inventory" checked={hasCarbonInventory} onCheckedChange={checked => setHasCarbonInventory(!!checked)} />
                <label htmlFor="carbon_inventory" className="text-sm text-gray-700 cursor-pointer">
                  我們已完成溫室氣體盤查（GHG Inventory）
                </label>
              </div>
            </TCFDFormSection>
          </div>

          {/* 組織營運簡述 */}
          <div className="border-t border-gray-200 pt-6">
            <TCFDFormSection title="組織營運簡述" description="請簡述企業主要營運型態、產品服務等（選填，200字內）">
              <Textarea placeholder={placeholderText} value={businessDescription} onChange={e => setBusinessDescription(e.target.value)} maxLength={200} rows={4} className="resize-none" />
              <div className="flex justify-between items-center text-sm mt-2">
                <p className="text-gray-500">
                  {businessDescription.length}/200 字
                </p>
                <p className="text-gray-500 text-xs">
                  💡 請避免透露具體數據、客戶名稱等機密資訊
                </p>
              </div>
            </TCFDFormSection>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-center pt-6">
            <Button type="submit" disabled={!isValid || isSubmitting} className="px-8 py-3 text-base">
              {isSubmitting ? '建立評估中...' : '開始 TCFD 評估'}
            </Button>
          </div>
        </form>
      </div>
    </div>;
};
export default TCFDStage1;