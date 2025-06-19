
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { INDUSTRIES, COMPANY_SIZES, REVENUE_RANGES, SUPPLY_CHAIN_OPTIONS, SUSTAINABILITY_TEAM_OPTIONS, EMISSION_SOURCES } from '@/types/tcfd';
import { Building2, Users, FileCheck, Globe, DollarSign, Link, Shield, Zap, FileText } from 'lucide-react';
import TCFDContentCard from './shared/TCFDContentCard';
import TCFDFormSection from './shared/TCFDFormSection';
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 統一的標題區 */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg">
        <div className="text-center space-y-4 py-8 px-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                第一階段：基本條件輸入
              </h1>
            </div>
          </div>
          <p className="text-slate-600 text-base leading-relaxed max-w-3xl mx-auto">
            請提供您的企業基本資訊，這些資料將作為後續風險與機會分析的基礎。資訊愈完整，AI 分析結果愈精準。
          </p>
        </div>
      </div>

      {/* TCFD 介紹卡片 */}
      <InfoCard
        icon={FileText}
        title="關於 TCFD 模擬器"
        description={
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-slate-700 leading-relaxed">
                氣候相關財務揭露工作小組（<span className="font-semibold text-slate-800">Task Force on Climate-related Financial Disclosures, TCFD</span>）
                建議企業在年度財務申報中揭露氣候相關的財務資訊，協助投資者和其他利害關係人了解氣候變化對企業的影響。
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">模組功能與特色</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">🎯 智能化評估</h4>
                  <ul className="text-sm text-slate-600 space-y-2 leading-relaxed">
                    <li>• 根據產業特性客製化風險與機會識別</li>
                    <li>• AI 生成情境分析與財務影響評估</li>
                    <li>• 自動化報告產出，符合 TCFD 架構</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800">📊 專業級輸出</h4>
                  <ul className="text-sm text-slate-600 space-y-2 leading-relaxed">
                    <li>• 完整四大核心要素分析報告</li>
                    <li>• 可直接參考的揭露內容草稿</li>
                    <li>• 財務影響量化分析與策略建議</li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-base font-semibold text-slate-800 mb-4 text-center">五步驟完成評估</h4>
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
                          item.step === 1 ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {item.step}
                        </div>
                        <div className="mt-2 max-w-20">
                          <div className="font-medium text-slate-800 text-xs">{item.title}</div>
                          <div className="text-xs text-slate-600">{item.desc}</div>
                        </div>
                      </div>
                      {index < 4 && <div className="mx-2 text-slate-400">→</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
        themeColor="blue"
        className="mb-8"
      />

      {/* 主要表單 */}
      <TCFDContentCard title="企業基本資訊" icon={Building2}>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本資訊區塊 */}
          <div className="grid md:grid-cols-2 gap-8">
            <TCFDFormSection
              title="產業別"
              description="請選擇最符合您企業的主要產業分類"
              required
            >
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
            </TCFDFormSection>

            <TCFDFormSection
              title="企業規模"
              description="請根據員工人數或營業額選擇企業規模"
              required
            >
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
            </TCFDFormSection>
          </div>

          {/* 專業評估資訊 */}
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">專業評估資訊</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <TCFDFormSection title="國際營運狀況" description="是否有跨地區或國際營運據點">
                <Select value={hasInternationalOperations?.toString() || ''} onValueChange={(value) => setHasInternationalOperations(value === 'true')}>
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
                    {REVENUE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TCFDFormSection>

              <TCFDFormSection title="供應鏈碳揭露" description="是否被要求進行供應鏈碳排放揭露">
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
              </TCFDFormSection>

              <TCFDFormSection title="永續管理組織" description="是否設有專責永續管理人員或團隊">
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
              </TCFDFormSection>
            </div>

            <div className="mt-8">
              <TCFDFormSection title="主要溫室氣體來源" description="預估企業營運中最主要的溫室氣體排放來源">
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
              </TCFDFormSection>
            </div>
          </div>

          {/* 碳盤查完成狀態 */}
          <div className="border-t border-slate-200 pt-8">
            <TCFDFormSection title="碳盤查完成狀態" description="是否已完成溫室氣體盤查作業">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <Checkbox 
                  id="carbon_inventory" 
                  checked={hasCarbonInventory} 
                  onCheckedChange={(checked) => setHasCarbonInventory(!!checked)} 
                />
                <label htmlFor="carbon_inventory" className="text-sm text-slate-700 cursor-pointer">
                  我們已完成溫室氣體盤查（GHG Inventory）
                </label>
              </div>
            </TCFDFormSection>
          </div>

          {/* 組織營運簡述 */}
          <div className="border-t border-slate-200 pt-8">
            <TCFDFormSection 
              title="組織營運簡述" 
              description="請簡述企業主要營運型態、產品服務等（選填，200字內）"
            >
              <Textarea 
                placeholder={placeholderText}
                value={businessDescription} 
                onChange={(e) => setBusinessDescription(e.target.value)} 
                maxLength={200} 
                rows={4}
                className="resize-none" 
              />
              <div className="flex justify-between items-center text-sm">
                <p className="text-slate-500">
                  {businessDescription.length}/200 字
                </p>
                <p className="text-slate-500 text-xs">
                  💡 請避免透露具體數據、客戶名稱等機密資訊
                </p>
              </div>
            </TCFDFormSection>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-center pt-8">
            <Button 
              type="submit" 
              disabled={!isValid || isSubmitting} 
              className="px-12 py-3 text-base bg-slate-700 hover:bg-slate-800"
            >
              {isSubmitting ? '建立評估中...' : '開始 TCFD 評估'}
            </Button>
          </div>
        </form>
      </TCFDContentCard>
    </div>
  );
};

export default TCFDStage1;
