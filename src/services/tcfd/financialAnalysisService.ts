
export interface FinancialAnalysisInput {
  riskOrOpportunityType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  scenarioDescription: string;
  selectedStrategy: string;
  companyProfile: {
    industry: string;
    size: string;
    hasInternationalOperations?: boolean;
    hasCarbonInventory: boolean;
    mainEmissionSource?: string;
  };
}

export interface FinancialAnalysisOutput {
  profitLossAnalysis: string;
  cashFlowAnalysis: string;
  balanceSheetAnalysis: string;
  analysisMethodology: string;
  strategyRationale: string;
}

export const generateFinancialAnalysis = (input: FinancialAnalysisInput): FinancialAnalysisOutput => {
  const {
    riskOrOpportunityType,
    categoryName,
    subcategoryName,
    scenarioDescription,
    selectedStrategy,
    companyProfile
  } = input;

  // 策略類型映射
  const strategyMapping = {
    // 風險策略
    'mitigate': '減緩策略',
    'transfer': '轉移策略', 
    'accept': '接受策略',
    'control': '控制策略',
    // 機會策略
    'evaluate_explore': '評估探索策略',
    'capability_building': '能力建設策略',
    'business_transformation': '商業轉換策略',
    'cooperation_participation': '合作參與策略',
    'aggressive_investment': '積極投入策略'
  };

  const strategyName = strategyMapping[selectedStrategy as keyof typeof strategyMapping] || selectedStrategy;
  const isRisk = riskOrOpportunityType === 'risk';
  const companyContext = `${companyProfile.size}規模的${companyProfile.industry}企業`;

  // 1. 損益表影響分析
  const profitLossAnalysis = generateProfitLossAnalysis(
    isRisk, categoryName, subcategoryName, strategyName, companyContext, companyProfile
  );

  // 2. 現金流分析
  const cashFlowAnalysis = generateCashFlowAnalysis(
    isRisk, categoryName, subcategoryName, strategyName, companyContext, companyProfile
  );

  // 3. 資產負債表影響分析
  const balanceSheetAnalysis = generateBalanceSheetAnalysis(
    isRisk, categoryName, subcategoryName, strategyName, companyContext, companyProfile
  );

  // 4. 分析建議方式
  const analysisMethodology = generateAnalysisMethodology(
    isRisk, categoryName, subcategoryName, strategyName, companyProfile
  );

  // 5. 策略配合說明
  const strategyRationale = generateStrategyRationale(
    isRisk, categoryName, subcategoryName, strategyName, companyContext
  );

  return {
    profitLossAnalysis,
    cashFlowAnalysis,
    balanceSheetAnalysis,
    analysisMethodology,
    strategyRationale
  };
};

const generateProfitLossAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  companyProfile: any
): string => {
  const baseImpact = isRisk ? '可能對營收產生負面影響或增加營業成本' : '有機會創造新營收來源或提升營運效率';
  
  // 根據不同類別提供具體的損益表影響邏輯
  if (categoryName.includes('政策') || categoryName.includes('法規')) {
    return `法規合規要求將增加${companyContext}的合規成本，包含人員培訓、系統建置及外部顧問費用。${baseImpact}，建議按季度追蹤合規支出佔營收比例變化，評估對毛利率的影響程度。若採用${strategyName}，需額外考量策略執行成本對短期獲利能力的影響。`;
  }
  
  if (categoryName.includes('技術')) {
    return `技術變革對${companyContext}的產品競爭力及成本結構將產生直接影響。${baseImpact}，特別是研發支出、設備折舊及人員技能提升成本。建議建立技術投資效益追蹤機制，監控研發支出對營收成長的貢獻度。${strategyName}的採用將影響資本化程度及攤銷政策。`;
  }
  
  if (categoryName.includes('市場')) {
    return `市場需求變化將直接影響${companyContext}的銷售表現及定價策略。${baseImpact}，同時可能需要調整行銷費用配置及通路策略投資。建議按產品線分析營收變動趨勢，評估市場轉換對獲利結構的影響。配合${strategyName}，需重新評估產品組合的邊際貢獻。`;
  }

  if (categoryName.includes('實體風險')) {
    return `實體風險事件可能造成${companyContext}營運中斷，導致營收損失及復原成本增加。生產設備損壞、供應鏈中斷等將直接衝擊毛利表現。建議建立事件發生頻率與財務影響的對應模型，評估保險理賠對損益的緩解效果。${strategyName}的實施將改變風險成本結構。`;
  }

  // 機會類別的損益表分析
  if (categoryName.includes('資源效率')) {
    return `資源效率提升將為${companyContext}帶來營運成本節約效益，特別是能源、原料使用的優化。長期而言有助於提升毛利率及營運槓桿效應。建議追蹤單位產出的資源消耗變化，量化效率改善對獲利的貢獻。透過${strategyName}，可評估投資回收期及持續效益。`;
  }

  if (categoryName.includes('產品和服務')) {
    return `新產品開發將為${companyContext}創造額外營收機會，但初期需投入研發及市場開拓成本。產品生命週期的不同階段對損益表影響差異明顯。建議建立新產品營收貢獻度追蹤，評估市場接受度對獲利預測的影響。${strategyName}將決定產品投資的節奏與規模。`;
  }

  // 通用分析
  return `${subcategoryName}情境將${baseImpact}。建議${companyContext}建立相關財務指標追蹤機制，定期評估對核心獲利能力的影響程度。配合${strategyName}的執行，需重新檢視成本效益分析及獲利預測模型的適用性。`;
};

const generateCashFlowAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  companyProfile: any
): string => {
  const baseFlow = isRisk ? '可能增加現金流出壓力' : '有機會改善現金流入狀況';
  
  if (categoryName.includes('政策') || categoryName.includes('法規')) {
    return `法規遵循將要求${companyContext}預先投入合規相關資本支出，包含系統建置、設備升級等一次性支出。營運現金流將承受持續性合規費用壓力。建議編列法規緩衝資金，並評估合規投資的分期付款安排。${strategyName}的現金流需求應納入年度預算規劃。`;
  }

  if (categoryName.includes('技術')) {
    return `技術升級需要大額資本支出，${companyContext}應評估設備投資的現金流影響及融資需求。研發階段的現金消耗與商業化後的現金回流存在時間落差。建議制定技術投資現金流規劃，考量分階段投入策略。${strategyName}將影響現金流的時間分布。`;
  }

  if (categoryName.includes('實體風險')) {
    return `實體風險事件可能造成${companyContext}緊急支出，包含設備修復、臨時應變措施等。營運中斷期間的現金流入減少將加劇流動性壓力。建議設立緊急應變資金，並檢視保險給付的現金流時效性。${strategyName}有助於減緩現金流波動幅度。`;
  }

  if (categoryName.includes('資源效率')) {
    return `效率改善投資雖需要初期資本支出，但${companyContext}可預期中長期營運現金流的改善。節約效益將逐步反映在現金流表現上。建議評估投資回收期，並將節約金額納入現金流預測。${strategyName}將決定現金流改善的時程與幅度。`;
  }

  // 通用分析
  return `${subcategoryName}情境${baseFlow}。${companyContext}應評估相關現金需求的時間分布，並檢視現有融資額度的充足性。建議建立現金流敏感度分析，評估不同情境下的流動性管理需求。${strategyName}的執行將直接影響現金流規劃。`;
};

const generateBalanceSheetAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  companyProfile: any
): string => {
  if (categoryName.includes('政策') || categoryName.includes('法規')) {
    return `法規要求可能促使${companyContext}新增合規相關資產，如監測設備、資訊系統等。同時可能需要提列合規準備金或潛在罰款準備。建議重新評估資產分類及折舊政策，確保符合會計準則要求。${strategyName}將影響資產負債結構的調整方式。`;
  }

  if (categoryName.includes('技術')) {
    return `技術升級將改變${companyContext}的固定資產結構，舊設備可能面臨加速折舊或資產減損。新技術資產的認列與評價需要專業評估。建議進行資產重估，並評估技術資產的殘值政策。${strategyName}決定了資產汰換的節奏與財務處理方式。`;
  }

  if (categoryName.includes('實體風險')) {
    return `實體風險可能導致${companyContext}資產損失，需要重新評估資產的帳面價值與可回收金額。保險理賠資產的認列時點與金額確認需要謹慎處理。建議定期進行資產減損測試，並檢視保險覆蓋率的適足性。${strategyName}有助於降低資產價值波動風險。`;
  }

  if (categoryName.includes('市場')) {
    return `市場變化可能影響${companyContext}存貨價值及應收帳款品質。產品需求下降可能導致存貨跌價損失，客戶財務狀況變化影響應收帳款回收。建議加強存貨管理及信用風險控制，適時調整備抵呆帳政策。${strategyName}將影響營運資產的管理策略。`;
  }

  if (categoryName.includes('資源效率')) {
    return `效率改善投資將增加${companyContext}的生產性資產，同時可能提升資產使用效率指標。節能設備等環保資產可能享有稅務優惠或補助。建議重新評估資產周轉率及生產力指標，並掌握相關稅務處理。${strategyName}將優化資產配置效率。`;
  }

  // 通用分析
  return `${subcategoryName}情境將影響${companyContext}的資產負債結構。建議定期進行資產品質檢視，評估負債承擔能力的變化，並適時調整資本結構政策。${strategyName}的選擇將決定資產負債調整的方向與程度。`;
};

const generateAnalysisMethodology = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyProfile: any
): string => {
  const baseMethod = '建議建立情境分析模型，設定不同嚴重程度的影響參數，進行敏感度分析。';
  
  if (categoryName.includes('政策') || categoryName.includes('法規')) {
    return `${baseMethod}針對法規遵循，建議盤點現有合規程度與目標要求的差距，量化合規成本及時程。可參考同業實施經驗，建立成本效益比較基準。定期追蹤法規更新，評估對財務預測的影響。`;
  }

  if (categoryName.includes('技術')) {
    return `${baseMethod}針對技術影響，建議進行技術成熟度評估，分析市場接受度與競爭優勢持續性。可建立技術生命週期模型，評估不同發展階段的財務需求。建議與技術部門協作，量化技術效益與風險。`;
  }

  if (categoryName.includes('實體風險')) {
    return `${baseMethod}針對實體風險，建議結合歷史氣候資料及未來預測，建立發生機率模型。可參考保險精算方法，評估風險成本與保險費用的平衡點。建議建立緊急應變財務計畫。`;
  }

  if (categoryName.includes('市場')) {
    return `${baseMethod}針對市場變化，建議分析客戶需求趨勢及競爭環境變化。可建立市場佔有率變動模型，評估營收影響的可能範圍。建議定期進行市場研究，更新財務假設條件。`;
  }

  // 通用方法
  return `${baseMethod}建議設定關鍵績效指標(KPI)追蹤系統，定期評估實際表現與預測的差異。可運用蒙地卡羅模擬等工具，評估財務影響的機率分布，協助管理層決策。`;
};

const generateStrategyRationale = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string
): string => {
  // 根據策略類型提供不同的配合說明
  if (strategyName.includes('減緩') || strategyName.includes('評估探索')) {
    return `採用${strategyName}有助於${companyContext}降低不確定性，透過積極介入減少負面影響或提升正面效益。此策略可讓企業掌握主導權，雖需投入較多資源，但能建立長期競爭優勢，提升財務表現的可預測性。`;
  }

  if (strategyName.includes('轉移') || strategyName.includes('合作參與')) {
    return `${strategyName}可幫助${companyContext}分散財務風險，透過與外部夥伴合作或風險分攤機制，降低單一企業承擔的財務波動。此策略有助於維持現金流穩定，但需要建立有效的合作管理機制。`;
  }

  if (strategyName.includes('接受') || strategyName.includes('能力建設')) {
    return `選擇${strategyName}反映${companyContext}對自身財務承受能力的信心，透過內部能力提升來因應挑戰或把握機會。此策略可保持企業彈性，避免過度依賴外部資源，但需要充足的財務緩衝與管理能力。`;
  }

  if (strategyName.includes('控制') || strategyName.includes('商業轉換')) {
    return `${strategyName}強調${companyContext}透過系統性管理來掌控財務影響，建立預警機制與應變能力。此策略有助於提升風險管理效率，但需要投資建立完善的監控系統與組織能力。`;
  }

  if (strategyName.includes('積極投入')) {
    return `${strategyName}顯示${companyContext}對於機會把握的積極態度，願意承擔較高風險以獲取更大回報。此策略可能帶來顯著的財務績效提升，但需要充足的資本支持與風險管理能力。`;
  }

  // 通用說明
  return `${strategyName}的選擇反映${companyContext}對於${subcategoryName}情境的管理思維。此策略有助於企業在不確定環境中維持財務穩健，建議配合完善的執行計畫與績效監控機制，確保策略目標的達成。`;
};
