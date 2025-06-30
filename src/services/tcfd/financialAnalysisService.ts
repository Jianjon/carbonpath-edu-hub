
export interface FinancialAnalysisInput {
  riskOrOpportunityType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  scenarioDescription: string;
  selectedStrategy: string;
  strategyNotes?: string;
  companyProfile: {
    industry: string;
    size: string;
    hasInternationalOperations?: boolean;
    hasCarbonInventory: boolean;
    mainEmissionSource?: string;
  };
}

export interface FinancialAnalysisOutput {
  kpiImpact: string;
  cashFlowImpact: string;
  balanceSheetImpact: string;
  executionCost: string;
}

// 策略類型對應映射
const strategyTypeMapping: Record<string, string> = {
  'mitigate': '減緩策略',
  'transfer': '轉移策略',
  'accept': '接受策略',
  'control': '控制策略',
  'explore': '探索策略',
  'build': '建設策略',
  'transform': '轉換策略',
  'collaborate': '合作策略',
  'invest': '投入策略'
};

// 產業中文映射
const industryMapping: Record<string, string> = {
  'hospitality': '旅宿業',
  'manufacturing': '製造業',
  'technology': '科技業',
  'finance': '金融業',
  'retail': '零售業',
  'healthcare': '醫療業',
  'education': '教育業',
  'construction': '建築業',
  'transportation': '運輸業',
  'restaurant': '餐飲業'
};

// 規模中文映射
const sizeMapping: Record<string, string> = {
  'small': '小型',
  'medium': '中型',
  'large': '大型'
};

export const generateFinancialAnalysis = (input: FinancialAnalysisInput): FinancialAnalysisOutput => {
  const {
    riskOrOpportunityType,
    categoryName,
    subcategoryName,
    selectedStrategy,
    strategyNotes,
    companyProfile
  } = input;

  const strategyName = strategyTypeMapping[selectedStrategy] || selectedStrategy;
  const industryText = industryMapping[companyProfile.industry] || companyProfile.industry;
  const sizeText = sizeMapping[companyProfile.size] || companyProfile.size;
  const companyContext = `${sizeText}${industryText}企業`;
  const isRisk = riskOrOpportunityType === 'risk';

  // 根據策略備註解析實際選擇的策略元素
  const selectedElements = parseStrategyElements(strategyNotes || '');

  return {
    kpiImpact: generateKPIImpact(isRisk, categoryName, strategyName, companyContext, selectedElements),
    cashFlowImpact: generateCashFlowImpact(isRisk, categoryName, strategyName, companyContext, selectedElements),
    balanceSheetImpact: generateBalanceSheetImpact(isRisk, categoryName, strategyName, companyContext, selectedElements),
    executionCost: generateExecutionCost(isRisk, categoryName, strategyName, companyContext, selectedElements)
  };
};

// 解析策略備註中的實際選擇元素
const parseStrategyElements = (notes: string): string[] => {
  const elements = [];
  if (notes.includes('人力投入') || notes.includes('人員培訓')) elements.push('人力');
  if (notes.includes('系統建置') || notes.includes('系統導入')) elements.push('系統');
  if (notes.includes('設備更新') || notes.includes('設備投資')) elements.push('設備');
  if (notes.includes('外部合作') || notes.includes('顧問諮詢')) elements.push('外部');
  if (notes.includes('流程改善') || notes.includes('制度建立')) elements.push('流程');
  return elements.length > 0 ? elements : ['通用'];
};

const generateKPIImpact = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let impact = '';
  
  if (elements.includes('人力')) {
    impact = `人力培訓投入將提升員工專業能力，預期提高作業效率15-25%。${companyContext}可設定人均產能提升指標，監控培訓投資效益轉換。`;
  } else if (elements.includes('系統')) {
    impact = `系統導入將優化作業流程，預期減少人工作業時間30-40%。建議設定系統使用率及錯誤率下降指標，追蹤數位轉型成效。`;
  } else if (elements.includes('設備')) {
    impact = `設備更新將提升生產效率，預期單位產出成本下降10-20%。可設定設備稼動率及維護成本指標，評估投資回收效果。`;
  } else if (elements.includes('外部')) {
    impact = `透過外部合作取得專業資源，預期縮短學習曲線50%以上。建議設定專案達成率及知識轉移指標，確保合作效益。`;
  } else if (elements.includes('流程')) {
    impact = `流程改善將降低營運風險，預期減少異常事件發生率20-30%。可設定合規達成率及流程循環時間指標，監控改善成效。`;
  } else {
    impact = `${strategyName}實施後，預期關鍵績效指標將有所改善。${companyContext}應建立對應監控機制，定期評估策略執行成效。`;
  }
  
  return impact;
};

const generateCashFlowImpact = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let impact = '';
  
  if (elements.includes('人力')) {
    impact = `人力投入策略需要持續性培訓支出，預估每季增加現金流出2-5%。建議分期投入，避免單季現金壓力過大。`;
  } else if (elements.includes('系統')) {
    impact = `系統建置需要一次性大額投入，預估現金流出集中於前2季。後續可節省人力成本，第3季起現金流將轉為正向。`;
  } else if (elements.includes('設備')) {
    impact = `設備投資將產生顯著現金流出，建議評估融資或租賃方案。預期18個月後透過效率提升回收現金流。`;
  } else if (elements.includes('外部')) {
    impact = `外部合作費用分期支付，現金流壓力相對平緩。預估每季固定支出增加3-8%，但可避免內部大額投資。`;
  } else if (elements.includes('流程')) {
    impact = `流程改善主要為內部人力重新配置，現金流影響有限。預期透過效率提升，6個月內產生正向現金流。`;
  } else {
    impact = `${strategyName}執行將對現金流產生影響，${companyContext}需評估資金需求並制定相應的現金管理計畫。`;
  }
  
  return impact;
};

const generateBalanceSheetImpact = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let impact = '';
  
  if (elements.includes('人力')) {
    impact = `人力投資主要反映於預付費用科目，對資產結構影響較小。人力資本提升將間接增強企業無形資產價值。`;
  } else if (elements.includes('系統')) {
    impact = `系統建置將增加固定資產項目，需要考慮折舊政策。同時可能需要短期借款支應，影響負債結構。`;
  } else if (elements.includes('設備')) {
    impact = `設備投資將顯著增加固定資產規模，同時可能增加長期負債。需重新評估資產負債比例的適當性。`;
  } else if (elements.includes('外部')) {
    impact = `外部合作費用計入應付款項，對資產負債表影響相對有限。主要為營運費用性質，不改變資本結構。`;
  } else if (elements.includes('流程')) {
    impact = `流程改善對資產負債表直接影響較小，主要透過營運效率提升間接改善資產運用效率。`;
  } else {
    impact = `${strategyName}對${companyContext}資產負債結構將產生相應影響，需定期檢視資本配置的合理性。`;
  }
  
  return impact;
};

const generateExecutionCost = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let cost = '';
  
  if (elements.includes('人力')) {
    cost = `人力投入成本包含：內部培訓時數成本（建議以平均薪資×培訓時數計算）、外部訓練費用、人力替代成本等，預估總投入為年薪資總額的5-10%。`;
  } else if (elements.includes('系統')) {
    cost = `系統建置成本包含：軟體授權費、硬體設備、導入服務費、教育訓練費等，預估總投入為年營收的2-5%，分2-3年攤提。`;
  } else if (elements.includes('設備')) {
    cost = `設備投資成本包含：設備採購、安裝調試、操作培訓、維護保養等，預估為設備價值的110-120%，需評估融資條件。`;
  } else if (elements.includes('外部')) {
    cost = `外部合作成本包含：顧問服務費、合作夥伴費用、專案管理費等，預估每月固定支出增加8-15%，依合作期程分攤。`;
  } else if (elements.includes('流程')) {
    cost = `流程改善成本包含：內部人力投入、制度建立、文件製作、驗證測試等，預估為3-6個月的專案人力成本。`;
  } else {
    cost = `${strategyName}執行成本需依實際選擇項目進行估算，${companyContext}應建立成本追蹤機制確保預算控制。`;
  }
  
  return cost;
};
