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
  is_demo_data?: boolean;
}

export interface RiskOpportunitySelection {
  id: string;
  assessment_id: string;
  category_type: 'risk' | 'opportunity';
  category_name: string;
  subcategory_name?: string;
  selected: boolean;
  custom_scenario_description?: string;
  created_at: string;
  is_demo_data?: boolean;
}

export interface ScenarioEvaluation {
  id: string;
  assessment_id: string;
  risk_opportunity_id: string;
  category_name?: string;
  subcategory_name?: string;
  scenario_description: string;
  scenario_generated_by_llm: boolean;
  user_score?: number;
  likelihood_score?: number;
  llm_response?: string;
  selected_strategy?: string;
  strategy_type?: 'mitigate' | 'transfer' | 'accept' | 'control' | 'explore' | 'build' | 'transform' | 'collaborate' | 'invest';
  strategy_description?: string;
  custom_scenario_context?: string;
  created_at: string;
  is_demo_data?: boolean;
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
  is_demo_data?: boolean;
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
  is_demo_data?: boolean;
}

export interface TCFDScenarioItem {
  id: string;
  title: string;
  description: string;
  hint: string;
}

export interface TCFDCategory {
  id: string;
  type: 'risk' | 'opportunity';
  name: string;
  subcategories?: string[];
  scenarios?: TCFDScenarioItem[];
  description: string;
}

// TCFD 官方風險與機會分類 - 更新為包含具體情境
export const TCFD_RISK_CATEGORIES: TCFDCategory[] = [
  {
    id: 'transition_policy',
    type: 'risk',
    name: '政策和法規',
    description: '轉型風險 - 政策和法規變化',
    scenarios: [
      {
        id: 'carbon_tariff',
        title: '政府宣告將於 2030 年起實施高碳排產品徵收「碳關稅」',
        description: '因應國際碳邊境調整機制，政府研擬對高碳排進口產品課徵碳關稅',
        hint: '若您的產品需出口，是否有潛在營運風險？'
      },
      {
        id: 'carbon_fee_increase',
        title: '國內排放費率擬調高至每噸 1000 元',
        description: '環保署研議大幅提高碳費徵收標準，從目前每噸 300 元調升至 1000 元',
        hint: '企業是否有固定燃氣、電力高使用比例？'
      },
      {
        id: 'ghg_reporting_mandate',
        title: '主管機關要求申報完整溫室氣體盤查',
        description: '金管會規定上市櫃公司必須完成 Scope 1、2、3 溫室氣體盤查並公開揭露',
        hint: '尚未盤查、或無SOP機制的企業將面臨挑戰'
      },
      {
        id: 'litigation_risk',
        title: '氣候相關訴訟案件增加，企業面臨法律風險',
        description: '國際氣候訴訟案例增加，投資人和環保團體對企業氣候責任要求提高',
        hint: '您的企業是否有完整的氣候風險管理機制？'
      }
    ]
  },
  {
    id: 'transition_technology',
    type: 'risk',
    name: '技術',
    description: '轉型風險 - 技術變化',
    scenarios: [
      {
        id: 'low_carbon_substitution',
        title: '競爭對手推出低碳替代產品，市場佔有率受威脅',
        description: '同業開發出碳足跡更低的替代產品，消費者偏好轉移',
        hint: '您的核心產品是否面臨低碳技術替代風險？'
      },
      {
        id: 'tech_investment_cost',
        title: '綠色技術轉型需要大量資本投資',
        description: '設備汰換、製程改善、人員培訓等轉型成本龐大',
        hint: '企業是否有足夠資金進行技術升級？'
      },
      {
        id: 'obsolete_technology',
        title: '現有生產技術可能因環保法規而淘汰',
        description: '傳統高耗能製程面臨法規限制，需要技術轉型',
        hint: '您的生產設備是否屬於高耗能或高污染類型？'
      }
    ]
  },
  {
    id: 'transition_market',
    type: 'risk',
    name: '市場',
    description: '轉型風險 - 市場變化',
    scenarios: [
      {
        id: 'consumer_preference_change',
        title: '消費者偏好轉向環保產品，傳統產品需求下滑',
        description: '年輕消費者更關注產品的環境影響，願意為永續產品付出溢價',
        hint: '您的產品是否符合環保趨勢和消費者期待？'
      },
      {
        id: 'supply_chain_disruption',
        title: '供應鏈夥伴因氣候因素無法穩定供貨',
        description: '上游供應商面臨環保法規壓力，可能影響供貨穩定性和成本',
        hint: '您是否有供應鏈風險管理和備案計劃？'
      },
      {
        id: 'raw_material_cost_increase',
        title: '原物料價格因碳成本內化而上漲',
        description: '石化、金屬等傳統原料因碳費徵收而成本增加',
        hint: '您的主要原物料是否屬於高碳排放類型？'
      }
    ]
  },
  {
    id: 'transition_reputation',
    type: 'risk',
    name: '聲譽',
    description: '轉型風險 - 聲譽變化',
    scenarios: [
      {
        id: 'stakeholder_pressure',
        title: '投資人和客戶要求企業提升ESG表現',
        description: '機構投資人將ESG表現納入投資決策，客戶要求供應商符合永續標準',
        hint: '您是否已建立ESG管理機制和對外溝通策略？'
      },
      {
        id: 'industry_stigmatization',
        title: '所屬產業被標籤為「高污染」行業',
        description: '特定產業因環境影響而面臨社會質疑和監管壓力',
        hint: '您的產業是否容易受到環保團體關注？'
      },
      {
        id: 'greenwashing_accusation',
        title: '面臨「漂綠」指控，影響品牌形象',
        description: '企業永續宣傳與實際行動不符，遭受媒體和消費者質疑',
        hint: '您的永續承諾是否有具體行動支撐？'
      }
    ]
  },
  {
    id: 'physical_acute',
    type: 'risk',
    name: '急性',
    description: '實體風險 - 急性風險',
    scenarios: [
      {
        id: 'extreme_weather_disruption',
        title: '極端天氣事件導致營運中斷',
        description: '颱風、暴雨、熱浪等極端天氣影響工廠營運和物流運輸',
        hint: '您的營運據點是否位於氣候災害高風險區域？'
      },
      {
        id: 'supply_chain_weather_impact',
        title: '供應鏈因氣候災害受到衝擊',
        description: '上游供應商因極端天氣無法正常生產或運輸',
        hint: '您是否有多元化供應鏈佈局和應急計劃？'
      },
      {
        id: 'infrastructure_damage',
        title: '基礎設施因極端天氣受損',
        description: '道路、港口、電力設施因氣候災害而中斷，影響營運',
        hint: '您的營運是否高度依賴特定基礎設施？'
      }
    ]
  },
  {
    id: 'physical_chronic',
    type: 'risk',
    name: '慢性',
    description: '實體風險 -慢性風險',
    scenarios: [
      {
        id: 'water_stress',
        title: '長期乾旱導致水資源短缺，影響生產',
        description: '氣候變遷導致降雨模式改變，工業用水供應不穩定',
        hint: '您的生產過程是否需要大量用水？'
      },
      {
        id: 'sea_level_rise',
        title: '海平面上升威脅沿海設施',
        description: '海平面上升和海水倒灌影響沿海工廠和倉儲設施',
        hint: '您的重要設施是否位於沿海低窪地區？'
      },
      {
        id: 'temperature_rise_impact',
        title: '平均氣溫上升增加營運成本',
        description: '持續高溫導致冷卻和空調成本增加，影響員工作業效率',
        hint: '您的營運是否對溫度變化敏感？'
      }
    ]
  }
];

export const TCFD_OPPORTUNITY_CATEGORIES: TCFDCategory[] = [
  {
    id: 'opportunity_resource_efficiency',
    type: 'opportunity',
    name: '資源效率',
    description: '機會 - 資源效率',
    scenarios: [
      {
        id: 'efficient_transport',
        title: '導入智慧物流系統，降低運輸碳排與成本',
        description: '運用AI優化配送路線，電動車隊減少燃料成本',
        hint: '您的物流成本佔營收比重是否偏高？'
      },
      {
        id: 'production_optimization',
        title: '製程優化帶來能源效率提升',
        description: '導入自動化和數位監控系統，減少能源浪費',
        hint: '您的生產過程是否有節能改善空間？'
      },
      {
        id: 'circular_economy',
        title: '發展循環經濟商業模式',
        description: '將廢料再利用或轉化為新產品，創造額外收益',
        hint: '您的生產過程是否產生可再利用的副產品？'
      },
      {
        id: 'building_efficiency',
        title: '綠建築改造降低營運成本',
        description: 'LED照明、智慧空調系統減少電費支出',
        hint: '您的辦公或廠房設施是否有節能改善潛力？'
      }
    ]
  },
  {
    id: 'opportunity_energy_source',
    type: 'opportunity',
    name: '能源來源',
    description: '機會 - 能源來源',
    scenarios: [
      {
        id: 'renewable_energy_access',
        title: '貴公司所在地出現可簽約綠電（如PPA或再生能源證書）',
        description: '政府開放綠電直供或再生能源憑證交易市場',
        hint: '若您能轉用，將對碳揭露與成本產生正面效益'
      },
      {
        id: 'government_incentives',
        title: '政府提供再生能源設備補助，申請期限為兩年',
        description: '經濟部推出太陽能板、儲能設備安裝補助計劃',
        hint: '您是否可考慮提前汰換老舊電力系統？'
      },
      {
        id: 'customer_green_requirements',
        title: '客戶要求供應商提供低碳產品證明（如RE100）',
        description: '大型企業客戶加入RE100倡議，要求供應鏈使用再生能源',
        hint: '若無低碳能源基礎，是否會喪失商機？'
      },
      {
        id: 'distributed_energy',
        title: '建置分散式發電系統，降低電力成本',
        description: '屋頂太陽能、小型風電等自發自用系統',
        hint: '您的用電需求是否適合建置自有發電設備？'
      }
    ]
  },
  {
    id: 'opportunity_products_services',
    type: 'opportunity',
    name: '產品和服務',
    description: '機會 - 產品和服務',
    scenarios: [
      {
        id: 'low_carbon_products',
        title: '開發低碳產品搶攻綠色市場商機',
        description: '推出碳足跡較低的產品版本，滿足環保消費需求',
        hint: '您是否能開發出環保版本的核心產品？'
      },
      {
        id: 'climate_adaptation_solutions',
        title: '提供氣候調適解決方案服務',
        description: '協助其他企業進行碳盤查、節能改善等顧問服務',
        hint: '您是否具備相關技術能力可對外提供服務？'
      },
      {
        id: 'green_innovation',
        title: '研發創新綠色技術，建立技術優勢',
        description: '投入清潔技術研發，成為產業技術領導者',
        hint: '您是否有研發能量投入綠色創新？'
      },
      {
        id: 'consumer_trend_shift',
        title: '掌握消費者永續消費趨勢',
        description: '年輕消費者願意為永續產品支付溢價',
        hint: '您的目標客群是否重視環保議題？'
      }
    ]
  },
  {
    id: 'opportunity_markets',
    type: 'opportunity',
    name: '市場',
    description: '機會 - 市場',
    scenarios: [
      {
        id: 'new_market_access',
        title: '進入新興綠色市場',
        description: '歐盟、美國等地區對低碳產品需求增加',
        hint: '您是否有能力開拓國際綠色市場？'
      },
      {
        id: 'public_sector_opportunities',
        title: '獲得政府綠色採購訂單',
        description: '政府優先採購環保標章產品，提供穩定訂單',
        hint: '您的產品是否符合政府綠色採購標準？'
      },
      {
        id: 'asset_location_advantages',
        title: '善用地理位置優勢發展綠色業務',
        description: '利用再生能源豐富地區建置生產基地',
        hint: '您是否可考慮在綠能豐富地區設置據點？'
      }
    ]
  },
  {
    id: 'opportunity_resilience',
    type: 'opportunity',
    name: '韌性',
    description: '機會 - 韌性',
    scenarios: [
      {
        id: 'renewable_programs',
        title: '參與企業再生能源聯合採購計畫',
        description: '與其他企業合作採購綠電，降低採購成本',
        hint: '您是否有興趣參與集體採購降低綠電成本？'
      },
      {
        id: 'resource_diversification',
        title: '建立多元化資源供應體系',
        description: '分散原料來源和能源供應，提高營運韌性',
        hint: '您是否過度依賴單一供應商或能源來源？'
      },
      {
        id: 'climate_insurance',
        title: '開發氣候風險保險商品',
        description: '與保險公司合作開發針對氣候風險的保險產品',
        hint: '您是否需要轉移氣候相關營運風險？'
      }
    ]
  }
];

export const COMPANY_SIZES = [
  { value: 'small', label: '小型企業（50人以下）' },
  { value: 'medium', label: '中型企業（50-250人）' },
  { value: 'large', label: '大型企業（250人以上）' },
];

export const INDUSTRIES = [
  { value: 'restaurant', label: '餐飲業' },
  { value: 'retail', label: '零售業' },
  { value: 'manufacturing', label: '製造業' },
  { value: 'construction', label: '營建業' },
  { value: 'transportation', label: '運輸業' },
  { value: 'technology', label: '科技業' },
  { value: 'finance', label: '金融業' },
  { value: 'healthcare', label: '醫療保健' },
  { value: 'education', label: '教育服務' },
  { value: 'hospitality', label: '旅宿業' },
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
