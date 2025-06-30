export interface FinancialAnalysisInput {
  riskOrOpportunityType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  scenarioDescription: string;
  selectedStrategy: string;
  strategyNotes: string;
  companyProfile: {
    industry: string;
    size: string;
    hasInternationalOperations: boolean;
    hasCarbonInventory: boolean;
    mainEmissionSource?: string;
  };
}

export interface FinancialAnalysisOutput {
  // 基本四項分析（保持向後相容）
  kpiImpact: string;
  cashFlowImpact: string;
  balanceSheetImpact: string;
  executionCost: string;
  
  // 新增六項詳細分析
  profitLossAnalysis: string;
  cashFlowAnalysis: string;
  balanceSheetAnalysis: string;
  strategyFeasibilityAnalysis: string;
  analysisMethodology: string;
  calculationMethodSuggestions: string;
}

// 中文對照表
const industryTranslations: {[key: string]: string} = {
  'restaurant': '餐飲業',
  'retail': '零售業', 
  'manufacturing': '製造業',
  'construction': '營建業',
  'transportation': '運輸業',
  'technology': '科技業',
  'finance': '金融業',
  'healthcare': '醫療保健',
  'education': '教育服務',
  'hospitality': '旅宿業'
};

const sizeTranslations: {[key: string]: string} = {
  'small': '小型',
  'medium': '中型',
  'large': '大型'
};

const strategyTranslations: {[key: string]: string} = {
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

export const generateFinancialAnalysis = (input: FinancialAnalysisInput): FinancialAnalysisOutput => {
  const industryText = industryTranslations[input.companyProfile.industry] || input.companyProfile.industry;
  const sizeText = sizeTranslations[input.companyProfile.size] || input.companyProfile.size;
  const strategyName = strategyTranslations[input.selectedStrategy] || input.selectedStrategy;
  const isRisk = input.riskOrOpportunityType === 'risk';
  const isManufacturing = input.companyProfile.industry === 'manufacturing';

  // 基本四項分析（向後相容）
  const basicAnalysis = generateBasicAnalysis(input, industryText, sizeText, strategyName, isRisk);
  
  // 六大面向詳細分析
  const detailedAnalysis = generateDetailedSixDimensionAnalysis(input, industryText, sizeText, strategyName, isRisk, isManufacturing);

  return {
    ...basicAnalysis,
    ...detailedAnalysis
  };
};

const generateBasicAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean
) => {
  
  return {
    kpiImpact: `${strategyName}執行後，${sizeText}${industryText}企業預期在環境績效指標上將有顯著改善，特別在碳排放強度與能源使用效率方面可望提升15-25%。`,
    cashFlowImpact: `短期內需投入資金進行${input.categoryName}相關的基礎建設與人員培訓，預估初期投資約需200-500萬元，回收期約3-5年。`,
    balanceSheetImpact: `可能需要增加固定資產投資，同時提升企業永續價值，有助改善ESG評等與融資條件。`,
    executionCost: `${strategyName}的執行成本包含設備採購、顧問費用、員工培訓等，總計約300-800萬元，建議分階段投入降低資金壓力。`
  };
};

const generateDetailedSixDimensionAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean,
  isManufacturing: boolean
) => {
  const applicableDimensions = selectApplicableDimensions(input, isRisk, isManufacturing);
  
  return {
    profitLossAnalysis: generateRevenueImpactAnalysis(input, industryText, sizeText, strategyName, isRisk, isManufacturing),
    cashFlowAnalysis: generateCostStructureAnalysis(input, industryText, sizeText, strategyName, isRisk, isManufacturing),
    balanceSheetAnalysis: generateCapitalExpenditureAnalysis(input, industryText, sizeText, strategyName, isRisk, isManufacturing),
    strategyFeasibilityAnalysis: generateOperationalCostAnalysis(input, industryText, sizeText, strategyName, isRisk, isManufacturing),
    analysisMethodology: generateAssetImpairmentAnalysis(input, industryText, sizeText, strategyName, isRisk, isManufacturing),
    calculationMethodSuggestions: generateFinancingAccessibilityAnalysis(input, industryText, sizeText, strategyName, isRisk, isManufacturing)
  };
};

const selectApplicableDimensions = (input: FinancialAnalysisInput, isRisk: boolean, isManufacturing: boolean): string[] => {
  const allDimensions = ['營收變動', '成本結構變化', '資本支出需求', '營運成本變化', '資產減損風險', '融資可得性與風險溢酬'];
  
  // 根據情境類型和策略選擇適用的3-4個面向
  if (input.categoryName.includes('碳費') || input.categoryName.includes('法規')) {
    return ['成本結構變化', '資本支出需求', '營運成本變化', '融資可得性與風險溢酬'];
  } else if (input.categoryName.includes('品牌') || input.categoryName.includes('市場')) {
    return ['營收變動', '成本結構變化', '營運成本變化', '融資可得性與風險溢酬'];
  } else if (isManufacturing) {
    return ['成本結構變化', '資本支出需求', '資產減損風險', '融資可得性與風險溢酬'];
  }
  
  return allDimensions.slice(0, 4); // 預設選取前4項
};

// 營收變動分析
const generateRevenueImpactAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean,
  isManufacturing: boolean
): string => {
  const categoryLower = input.categoryName.toLowerCase();
  
  if (categoryLower.includes('品牌') || categoryLower.includes('聲譽')) {
    if (isRisk) {
      return `${sizeText}${industryText}企業若未妥善處理${input.categoryName}風險，可能導致品牌信譽受損，估計銷售收入下滑5-15%。特別是B2B客戶可能因ESG採購要求而轉向競爭對手，影響既有客戶續約率。建議透過${strategyName}強化品牌透明度，預期可維持現有市場份額並爭取永續意識客群，潛在營收保護效益約年營收的8-12%。`;
    } else {
      return `透過${strategyName}執行${input.categoryName}機會，${sizeText}${industryText}企業可望提升品牌ESG形象，吸引永續消費族群。預估可帶動營收成長3-8%，主要來自綠色產品溢價與新客戶開發。若結合數位行銷推廣永續成果，B2B市場接單機會可增加10-20%，年營收增長潛力約200-500萬元。`;
    }
  }
  
  if (categoryLower.includes('碳費') || categoryLower.includes('法規')) {
    return `碳費政策實施對${industryText}營收無直接影響，但若企業成功執行${strategyName}達成減碳目標，可透過碳權交易或綠色產品認證創造新收入來源。預估每年可透過碳權販售或綠色產品溢價增加營收50-150萬元，同時避免因碳費增加而被迫調漲產品售價導致市場競爭力下滑。`;
  }
  
  if (isManufacturing && input.companyProfile.mainEmissionSource?.includes('電力')) {
    return `${sizeText}製造業企業透過${strategyName}降低用電成本後，可維持產品價格競爭力，避免因電費上漲而流失價格敏感客戶。預估可保護年營收的5-10%，約300-800萬元。若進一步取得綠色製造認證，可開拓國際ESG要求客戶，新增營收潛力約年營收的3-7%。`;
  }
  
  return `${strategyName}執行後，預期對${sizeText}${industryText}企業營收產生正面影響。透過提升永續競爭力與客戶信任度，估計可維持既有營收穩定性並創造3-8%的營收成長機會，年增潛力約100-400萬元。`;
};

// 成本結構變化分析
const generateCostStructureAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean,
  isManufacturing: boolean
): string => {
  const categoryLower = input.categoryName.toLowerCase();
  
  if (categoryLower.includes('碳費')) {
    return `隨著碳費政策推行，${sizeText}${industryText}企業每年碳費支出預估將由目前50-200萬元增加至300-1000萬元。透過${strategyName}執行，可減少70-80%碳排放量，有效控制碳費成本增長。同時需投入能源管理、碳盤查等新增管理成本約每年80-150萬元，但整體成本結構優化後可節省總營運成本5-12%。`;
  }
  
  if (categoryLower.includes('能源') || (isManufacturing && input.companyProfile.mainEmissionSource?.includes('電力'))) {
    return `${sizeText}製造業企業當前電力成本約占營運成本15-25%，透過${strategyName}可降低用電密集度20-35%。預估每年可節省電費200-600萬元，但需增加綠電採購成本或節能設備維護費用約100-300萬元。整體能源成本結構改善後，可降低對傳統電價波動的敏感度，提升成本預測穩定性。`;
  }
  
  if (input.selectedStrategy === 'invest' || input.selectedStrategy === 'build') {
    return `執行${strategyName}將重組${industryText}企業成本結構，初期需增加研發支出、顧問費用及人員培訓成本約每年150-400萬元。但長期而言可透過流程優化、自動化提升等降低人力成本10-20%，預估3年後整體營運成本可較現況節省8-15%，年節省金額約300-800萬元。`;
  }
  
  return `${strategyName}實施將調整${sizeText}${industryText}企業成本配置，增加永續相關支出約占營收1-3%，但可透過效率提升、廢棄物減量等措施節省傳統營運成本5-10%。預估整體成本結構優化後，可提升毛利率2-5個百分點。`;
};

// 資本支出需求分析
const generateCapitalExpenditureAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean,
  isManufacturing: boolean
): string => {
  const categoryLower = input.categoryName.toLowerCase();
  
  if (input.selectedStrategy === 'invest' || categoryLower.includes('設備') || categoryLower.includes('技術')) {
    if (isManufacturing) {
      return `${sizeText}製造業執行${strategyName}需投資新生產設備、監測系統及自動化改造，估計資本支出需求1500-3500萬元。主要包含：節能設備汰換（800-1500萬）、數位化監控系統（300-600萬）、廠房改建（400-1400萬）。設備使用年限8-12年，年折舊費用約200-400萬元，預計4-6年可回收投資成本。`;
    } else {
      return `${sizeText}${industryText}企業因應${input.categoryName}需求，預估資本支出500-1200萬元。主要投資項目包含：永續管理系統建置（150-300萬）、節能設施改造（200-500萬）、監測設備採購（100-250萬）、顧問服務（50-150萬）。預計攤提期間5-8年，年折舊約80-200萬元。`;
    }
  }
  
  if (categoryLower.includes('數位') || categoryLower.includes('系統')) {
    return `建置${input.categoryName}相關數位化系統需資本支出300-800萬元，包含軟體授權、硬體設備、系統整合及客製化開發。預計使用年限5年，年攤提費用60-160萬元。若搭配雲端服務，可降低初期投資至200-500萬元，但增加年度維運費用50-120萬元。投資回收期約3-4年。`;
  }
  
  return `執行${strategyName}處理${input.categoryName}需要資本投資400-1000萬元，主要用於基礎設施改善、設備升級及系統建置。投資項目具備5-10年使用年限，年折舊費用約80-150萬元。預期透過效率提升與成本節省，4-6年內可回收投資成本。`;
};

// 營運成本變化分析
const generateOperationalCostAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean,
  isManufacturing: boolean
): string => {
  const categoryLower = input.categoryName.toLowerCase();
  
  if (categoryLower.includes('碳盤查') || categoryLower.includes('管理')) {
    return `${strategyName}執行後，${sizeText}${industryText}企業需新增永續管理營運成本：碳盤查費用每年60-120萬元、ESG報告編制30-80萬元、第三方驗證費用20-50萬元、專責人員薪資100-200萬元。總計年增營運成本210-450萬元。但可透過能源管理優化節省20-40%水電費，預估年節省150-400萬元，整體營運效率提升。`;
  }
  
  if (input.selectedStrategy === 'collaborate' || categoryLower.includes('供應鏈')) {
    return `透過${strategyName}建立供應鏈永續管控機制，需增加供應商評估、稽核、培訓等營運成本約每年80-180萬元。包含：供應商永續評估系統維運費30-60萬元、定期稽核費用40-80萬元、供應商培訓成本10-40萬元。但可降低供應鏈風險，減少因供應商ESG問題造成的營運中斷損失，預估風險成本節省約200-500萬元。`;
  }
  
  if (isManufacturing && input.companyProfile.mainEmissionSource?.includes('製程')) {
    return `製程改善執行${strategyName}後，生產營運成本結構調整：增加品質管控人力成本50-120萬元/年、新增檢測費用30-80萬元/年、員工技術培訓20-60萬元/年。但透過製程優化可降低原料損耗15-25%、減少能源消耗20-30%，預估年節省營運成本300-700萬元，淨效益約200-450萬元。`;
  }
  
  return `${strategyName}實施將增加${sizeText}${industryText}企業日常營運管理成本約每年100-250萬元，主要包含人員培訓、系統維運、外部顧問等費用。但透過流程優化與效率提升，可節省既有營運成本8-15%，預估年節省200-500萬元，整體營運成本效益為正。`;
};

// 資產減損風險分析
const generateAssetImpairmentAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean,
  isManufacturing: boolean
): string => {
  const categoryLower = input.categoryName.toLowerCase();
  
  if (categoryLower.includes('轉型') || categoryLower.includes('淘汰')) {
    if (isManufacturing) {
      return `${sizeText}製造業面臨綠色轉型壓力，現有高碳排設備存在減損風險。燃油鍋爐、傳統生產設備等帳面價值約1000-3000萬元，預估未來5-8年內需提前報廢或大幅折價處分，潛在減損損失500-1500萬元。透過${strategyName}可緩解轉型衝擊，建議分階段汰換並申請政府補助，預估可降低減損損失40-60%。`;
    } else {
      return `因應${input.categoryName}轉型需求，${sizeText}${industryText}企業部分既有設施可能面臨提前汰換。預估現有辦公設備、傳統系統等資產減損風險約200-600萬元。透過${strategyName}規劃，可透過設備改造、系統升級等方式延長資產使用年限，降低減損損失至100-300萬元。`;
    }
  }
  
  if (categoryLower.includes('法規') || categoryLower.includes('政策')) {
    return `新法規實施可能導致部分不符合環保標準的資產面臨強制汰換或限制使用。${sizeText}${industryText}企業相關資產帳面價值約300-800萬元，預估減損風險150-400萬元。執行${strategyName}可提前因應法規要求，透過設備改良、流程調整等方式，將減損風險控制在50-150萬元範圍內。`;
  }
  
  return `執行${strategyName}過程中，${sizeText}${industryText}企業既有資產預期不會有顯著減損風險。透過逐步升級與改造，可延長現有設備使用年限並提升資產效率。若有局部汰換需求，預估影響金額控制在總資產價值1-3%範圍內，約50-200萬元。`;
};

// 融資可得性與風險溢酬分析
const generateFinancingAccessibilityAnalysis = (
  input: FinancialAnalysisInput,
  industryText: string,
  sizeText: string,
  strategyName: string,
  isRisk: boolean,
  isManufacturing: boolean
): string => {
  const categoryLower = input.categoryName.toLowerCase();
  
  if (input.selectedStrategy === 'invest' || input.selectedStrategy === 'build') {
    return `${sizeText}${industryText}企業透過${strategyName}提升ESG表現後，可改善金融機構風險評等，預期貸款利率可降低0.3-0.8%。以現有負債5000-15000萬元計算，每年可節省利息支出15-120萬元。同時具備申請綠色融資、永續發展貸款等優惠方案資格，額度可達投資金額70-90%，利率較一般貸款低1-2%，有效降低資金成本。`;
  }
  
  if (categoryLower.includes('ESG') || categoryLower.includes('永續')) {
    return `執行${input.categoryName}相關${strategyName}將顯著提升企業ESG評等，吸引ESG投資基金關注。預估可提升信用評等1-2個級距，降低融資成本0.5-1.2%。${sizeText}${industryText}企業年融資需求約2000-8000萬元，可節省融資成本10-96萬元。另外具備發行綠色債券、申請永續連結貸款等創新融資工具的資格。`;
  }
  
  if (isRisk && !categoryLower.includes('機會')) {
    return `若未妥善處理${input.categoryName}風險，可能影響金融機構對企業的信用評價，預估貸款利率可能上升0.2-0.5%，年增融資成本20-60萬元。透過${strategyName}主動因應，可維持現有信用條件並展現風險管控能力，避免融資條件惡化，保持與金融機構的良好合作關係。`;
  }
  
  return `${strategyName}的成功執行將改善${sizeText}${industryText}企業在金融市場的永續形象，提升投資者信心。預期可降低股權融資成本、改善債券發行條件，整體資金成本約可下降0.2-0.6%。年節省融資費用預估10-80萬元，同時提升企業價值與市場競爭力。`;
};
