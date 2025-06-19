
export interface TCFDAssessment {
  id: string;
  user_id: string;
  industry: string;
  company_size: string;
  has_carbon_inventory: boolean;
  // 新增的專業顧問建議欄位
  has_international_operations?: boolean;
  annual_revenue_range?: string;
  supply_chain_carbon_disclosure?: string;
  has_sustainability_team?: string;
  main_emission_source?: string;
  business_description?: string;
  current_stage: number;
  status: 'in_progress' | 'completed' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface RiskOpportunitySelection {
  id: string;
  assessment_id: string;
  category_type: 'risk' | 'opportunity';
  category_name: string;
  subcategory_name?: string;
  selected: boolean;
  created_at: string;
}

export interface ScenarioEvaluation {
  id: string;
  assessment_id: string;
  risk_opportunity_id: string;
  scenario_description: string;
  scenario_generated_by_llm: boolean;
  user_score?: number;
  llm_response?: string;
  created_at: string;
}

export interface StrategyAnalysis {
  id: string;
  assessment_id: string;
  scenario_evaluation_id: string;
  detailed_description?: string;
  financial_impact_pnl?: string;
  financial_impact_cashflow?: string;
  financial_impact_balance_sheet?: string;
  strategy_avoid?: string;
  strategy_accept?: string;
  strategy_transfer?: string;
  strategy_mitigate?: string;
  selected_strategy?: string;
  user_modifications?: string;
  generated_by_llm: boolean;
  created_at: string;
}

export interface TCFDReport {
  id: string;
  assessment_id: string;
  governance_content?: string;
  strategy_content?: string;
  risk_management_content?: string;
  metrics_targets_content?: string;
  disclosure_matrix?: any;
  report_format_content?: string;
  pdf_url?: string;
  json_output?: any;
  generated_at: string;
}

export interface TCFDCategory {
  id: string;
  type: 'risk' | 'opportunity';
  name: string;
  subcategories?: string[];
  description: string;
}

// TCFD 官方風險與機會分類
export const TCFD_RISK_CATEGORIES: TCFDCategory[] = [
  {
    id: 'transition_policy',
    type: 'risk',
    name: '政策和法規',
    subcategories: ['碳定價機制', '排放標準', '產品標籤要求', '暴露於訴訟風險'],
    description: '轉型風險 - 政策和法規變化'
  },
  {
    id: 'transition_technology',
    type: 'risk',
    name: '技術',
    subcategories: ['低碳技術替代', '技術開發成本', '現有技術過時'],
    description: '轉型風險 - 技術變化'
  },
  {
    id: 'transition_market',
    type: 'risk',
    name: '市場',
    subcategories: ['客戶行為變化', '市場信號不確定', '原物料成本上升'],
    description: '轉型風險 - 市場變化'
  },
  {
    id: 'transition_reputation',
    type: 'risk',
    name: '聲譽',
    subcategories: ['消費者偏好改變', '產業污名化', '利害關係人關注度增加'],
    description: '轉型風險 - 聲譽變化'
  },
  {
    id: 'physical_acute',
    type: 'risk',
    name: '急性',
    subcategories: ['極端天氣事件頻率增加', '極端天氣事件嚴重性增加'],
    description: '實體風險 - 急性風險'
  },
  {
    id: 'physical_chronic',
    type: 'risk',
    name: '慢性',
    subcategories: ['降雨模式變化', '極端天氣變化', '海平面上升', '平均溫度上升'],
    description: '實體風險 - 慢性風險'
  }
];

export const TCFD_OPPORTUNITY_CATEGORIES: TCFDCategory[] = [
  {
    id: 'opportunity_resource_efficiency',
    type: 'opportunity',
    name: '資源效率',
    subcategories: ['更高效的運輸方式', '更高效的生產配送流程', '循環利用', '更高效的建築物', '節水節能'],
    description: '機會 - 資源效率'
  },
  {
    id: 'opportunity_energy_source',
    type: 'opportunity',
    name: '能源來源',
    subcategories: ['使用低排放能源', '使用支援性政策激勵措施', '使用新技術', '參與碳市場', '轉換至分散式能源生成'],
    description: '機會 - 能源來源'
  },
  {
    id: 'opportunity_products_services',
    type: 'opportunity',
    name: '產品和服務',
    subcategories: ['開發低排放商品服務', '開發氣候調適解決方案', '研發創新', '消費者偏好轉移'],
    description: '機會 - 產品和服務'
  },
  {
    id: 'opportunity_markets',
    type: 'opportunity',
    name: '市場',
    subcategories: ['進入新市場', '獲得公共部門激勵措施', '獲得新資產和地點'],
    description: '機會 - 市場'
  },
  {
    id: 'opportunity_resilience',
    type: 'opportunity',
    name: '韌性',
    subcategories: ['參與再生能源計畫', '資源替代/多樣化'],
    description: '機會 - 韌性'
  }
];

export const COMPANY_SIZES = [
  { value: 'small', label: '小型企業（50人以下）' },
  { value: 'medium', label: '中型企業（50-250人）' },
  { value: 'large', label: '大型企業（250人以上）' },
];

export const INDUSTRIES = [
  { value: 'manufacturing', label: '製造業' },
  { value: 'finance', label: '金融業' },
  { value: 'technology', label: '科技業' },
  { value: 'retail', label: '零售業' },
  { value: 'construction', label: '營建業' },
  { value: 'transportation', label: '運輸業' },
  { value: 'energy', label: '能源業' },
  { value: 'healthcare', label: '醫療保健業' },
  { value: 'hospitality', label: '餐旅業' },
  { value: 'education', label: '教育業' },
  { value: 'agriculture', label: '農業' },
  { value: 'other', label: '其他' },
];

// 新增的選項定義
export const REVENUE_RANGES = [
  { value: 'small', label: '小於 1,000 萬元' },
  { value: 'medium', label: '1,000 萬 ~ 1 億元' },
  { value: 'large', label: '大於 1 億元' },
];

export const SUPPLY_CHAIN_OPTIONS = [
  { value: 'yes', label: '是' },
  { value: 'no', label: '否' },
  { value: 'uncertain', label: '不確定' },
];

export const SUSTAINABILITY_TEAM_OPTIONS = [
  { value: 'yes', label: '是' },
  { value: 'no', label: '否' },
  { value: 'planning', label: '規劃中' },
];

export const EMISSION_SOURCES = [
  { value: 'electricity', label: '電力' },
  { value: 'fuel', label: '燃料' },
  { value: 'process', label: '製程排放' },
  { value: 'logistics', label: '上下游物流' },
  { value: 'uncertain', label: '不確定' },
];
