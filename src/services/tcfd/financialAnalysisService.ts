
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
  profitLossAnalysis: string;
  cashFlowAnalysis: string;
  balanceSheetAnalysis: string;
  strategyFeasibilityAnalysis: string;
  analysisMethodology: string;
  calculationMethodSuggestions: string;
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

  const basicAnalysis = {
    kpiImpact: generateKPIImpact(isRisk, categoryName, strategyName, companyContext, selectedElements),
    cashFlowImpact: generateCashFlowImpact(isRisk, categoryName, strategyName, companyContext, selectedElements),
    balanceSheetImpact: generateBalanceSheetImpact(isRisk, categoryName, strategyName, companyContext, selectedElements),
    executionCost: generateExecutionCost(isRisk, categoryName, strategyName, companyContext, selectedElements)
  };

  // 生成詳細的六個分析區塊
  const detailedAnalysis = {
    profitLossAnalysis: generateProfitLossAnalysis(isRisk, categoryName, strategyName, companyContext, selectedElements),
    cashFlowAnalysis: generateDetailedCashFlowAnalysis(isRisk, categoryName, strategyName, companyContext, selectedElements),
    balanceSheetAnalysis: generateDetailedBalanceSheetAnalysis(isRisk, categoryName, strategyName, companyContext, selectedElements),
    strategyFeasibilityAnalysis: generateStrategyFeasibilityAnalysis(isRisk, categoryName, strategyName, companyContext, selectedElements),
    analysisMethodology: generateAnalysisMethodology(isRisk, categoryName, strategyName, companyContext, selectedElements),
    calculationMethodSuggestions: generateCalculationMethodSuggestions(isRisk, categoryName, strategyName, companyContext, selectedElements)
  };

  return {
    ...basicAnalysis,
    ...detailedAnalysis
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

// 詳細的六個分析區塊生成函數
const generateProfitLossAnalysis = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    analysis = `營業收入面：人力培訓提升服務品質，預期帶動客戶滿意度提升5-10%，間接增加營收。建議追蹤「人均營收」與「客戶滿意度」指標。

營業費用面：培訓費用將計入當期管理費用，預估增加3-5%營管費用。可透過「培訓費用/總薪資」比例監控合理性。

稅前淨利影響：短期淨利可能因培訓成本增加而下降，長期透過效率提升回收。建議設定18個月投資回收期目標。

計算建議：設定基準績效指標，按月追蹤培訓前後的績效變化幅度。`;
  } else if (elements.includes('系統')) {
    analysis = `營業收入面：系統自動化提升服務效率，預期減少人工錯誤率50%以上，提升客戶留存率。建議設定「系統處理量」與「錯誤率」指標。

營業費用面：系統折舊費用分3-5年攤提，年攤提額約為投資額的20-30%。人力成本預期可節省15-25%。

稅前淨利影響：第一年因折舊費用影響獲利，第二年起透過人力成本節省提升淨利率2-4%。

計算建議：建立「系統投資回收計算表」，按季檢視實際節省成本與預期差異。`;
  } else if (elements.includes('設備')) {
    analysis = `營業收入面：設備效率提升直接改善產能，預期單位時間產出增加20-30%。建議追蹤「設備稼動率」與「單位產出」指標。

營業費用面：設備折舊費用按5-10年攤提，維護費用約為設備價值的3-5%/年。預期可降低維修停機成本。

稅前淨利影響：初期折舊費用較高，但透過產能提升與維修成本降低，預期2-3年內回收投資。

計算建議：建立「設備投資效益追蹤表」，按月計算實際投資回收進度與預期比較。`;
  } else if (elements.includes('外部')) {
    analysis = `營業收入面：外部專業服務提升作業品質，預期減少重工與客訴率。建議追蹤「專案成功率」與「客戶滿意度」指標。

營業費用面：顧問費用計入當期管理費用，預估增加5-10%營管費用。但可避免內部人力配置與試錯成本。

稅前淨利影響：短期因顧問費用增加而影響獲利，中長期透過專業化提升帶來成本節省。

計算建議：設定「顧問效益評估表」，按季追蹤專業服務帶來的實際效益與成本比較。`;
  } else if (elements.includes('流程')) {
    analysis = `營業收入面：流程標準化提升服務一致性，預期減少異常處理時間30-40%。建議追蹤「流程週期時間」與「異常事件數」指標。

營業費用面：流程改善主要為內部人力投入，預估增加3-6個月專案人力成本。長期可降低營運成本。

稅前淨利影響：短期因專案人力投入影響獲利，長期透過效率提升與風險降低改善獲利能力。

計算建議：建立「流程改善效益追蹤表」，按月計算流程改善前後的成本與效率差異。`;
  } else {
    analysis = `營業收入面：${strategyName}執行後預期改善營運效率，但具體影響需依實際策略內容評估。建議設定對應的營收成長指標。

營業費用面：策略執行將產生相關費用，需納入當期損益計算。建議建立費用預算控制機制。

稅前淨利影響：短期可能因策略投入影響獲利，長期目標為透過風險控制或機會掌握提升獲利能力。

計算建議：依據實際選擇的策略項目，建立相對應的效益追蹤與計算方法。`;
  }
  
  return analysis;
};

const generateDetailedCashFlowAnalysis = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    analysis = `營運現金流：培訓費用按月或按季支付，現金流出較為平穩。預估每季現金流出增加2-5%。建議建立培訓預算分配機制。

投資現金流：人力投資主要為費用性質，不涉及固定資產投資。但可考慮將重要培訓課程資本化處理。

融資現金流：一般情況下不需要額外融資，但大規模培訓計畫可考慮分期付款或教育貸款。

現金管理建議：設定「培訓費用現金流預測表」，按季預估培訓相關現金需求，確保營運資金充足。`;
  } else if (elements.includes('系統')) {
    analysis = `營運現金流：系統導入後可節省人力成本，預期第3季起營運現金流轉正。但需考慮系統維護費用的持續支出。

投資現金流：系統建置需要一次性大額現金投入，建議評估分期付款或租賃方案。預估投資現金流出為總投資額的80-100%。

融資現金流：如資金不足，可考慮設備融資或營運資金貸款。建議預留20-30%資金緩衝。

現金管理建議：建立「系統投資現金流規劃表」，按月追蹤實際現金流與預算差異，確保專案資金到位。`;
  } else if (elements.includes('設備')) {
    analysis = `營運現金流：設備投入後可改善生產效率，預期12-18個月後營運現金流顯著改善。需考慮設備維護的現金需求。

投資現金流：設備採購產生大額現金流出，建議評估設備融資或分期付款方案。預估現金流出為設備價值的100-120%。

融資現金流：大型設備投資常需要融資支應，建議比較銀行貸款與租賃方案的成本效益。

現金管理建議：建立「設備投資現金流管理表」，按月監控設備投資的現金流出與回收狀況。`;
  } else if (elements.includes('外部')) {
    analysis = `營運現金流：顧問費用按專案進度分期支付，現金流壓力相對平緩。預估每季現金流出增加3-8%。

投資現金流：外部服務主要為費用性質，不涉及固定資產投資。但知識轉移可視為無形資產投資。

融資現金流：一般情況下不需要額外融資，但大型顧問專案可考慮專案融資或分期付款。

現金管理建議：建立「外部服務現金流預測表」，按專案階段預估現金需求，確保合作款項及時到位。`;
  } else if (elements.includes('流程')) {
    analysis = `營運現金流：流程改善主要為內部人力投入，現金流出有限。預期6個月內透過效率提升產生正現金流。

投資現金流：流程改善可能涉及少量系統或設備投資，但金額相對較小。主要為人力時間成本。

融資現金流：流程改善專案一般不需要外部融資，以內部資源為主。

現金管理建議：建立「流程改善現金流追蹤表」，按月計算專案投入成本與效率提升帶來的現金流回收。`;
  } else {
    analysis = `營運現金流：${strategyName}對營運現金流的影響需依具體策略內容評估。建議設定現金流監控指標。

投資現金流：策略執行可能涉及投資現金流出，需依實際選擇項目進行評估。

融資現金流：大型策略可能需要融資支應，建議評估不同融資方案的成本效益。

現金管理建議：依據實際策略內容建立現金流管理機制，確保策略執行的資金需求。`;
  }
  
  return analysis;
};

const generateDetailedBalanceSheetAnalysis = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    analysis = `資產面：人力培訓費用可考慮遞延費用處理，分期攤提。人力資本提升雖無法直接入帳，但可透過績效改善反映於營運效率。

負債面：培訓費用如採分期付款，會產生應付款項。一般情況下不會顯著影響負債結構。

權益面：培訓投資透過費用化處理，會直接影響當期淨利與保留盈餘。長期透過人力資本增值間接增強股東權益。

財務比率影響：對流動比率影響有限，但可能短期影響淨利率。建議設定人力投資報酬率指標進行評估。`;
  } else if (elements.includes('系統')) {
    analysis = `資產面：系統建置將增加固定資產（電腦設備）或無形資產（軟體）科目。需按使用年限提列折舊或攤銷。

負債面：系統投資如需要融資，會增加長期負債。分期付款會產生應付款項，影響負債結構。

權益面：系統投資透過折舊攤銷影響淨利，進而影響保留盈餘。但營運效率提升可改善長期獲利能力。

財務比率影響：固定資產增加會影響總資產週轉率，但可改善資產使用效率。需重新評估資產負債比例的合理性。`;
  } else if (elements.includes('設備')) {
    analysis = `資產面：設備投資將顯著增加固定資產規模，需按設備類別設定折舊年限與方法。同時可能影響資產組合結構。

負債面：設備融資會增加長期負債，需考慮償債能力與利息負擔。可能需要提供資產抵押或保證。

權益面：設備投資透過折舊費用影響淨利，短期可能降低權益報酬率。長期透過產能提升改善獲利能力。

財務比率影響：固定資產增加會影響資產週轉率與負債比率，需重新評估財務結構的適當性與償債能力。`;
  } else if (elements.includes('外部')) {
    analysis = `資產面：外部服務費用主要為當期費用，對資產結構影響有限。但知識轉移可視為無形資產增值。

負債面：顧問費用分期付款會產生應付款項，但金額相對較小，不會顯著改變負債結構。

權益面：顧問費用直接影響當期淨利與保留盈餘。專業服務品質提升可間接增強企業價值。

財務比率影響：對主要財務比率影響有限，但可能短期影響淨利率。建議設定外部服務投資效益指標。`;
  } else if (elements.includes('流程')) {
    analysis = `資產面：流程改善主要為內部人力投入，對資產結構直接影響較小。但可能涉及少量系統或設備投資。

負債面：流程改善一般不會增加負債，主要以內部資源支應。如有外部顧問或系統投資才會影響負債。

權益面：專案人力成本會影響當期淨利，但流程效率提升可改善長期獲利能力與股東權益。

財務比率影響：對資產負債結構影響較小，主要透過營運效率提升間接改善資產使用效率與獲利能力。`;
  } else {
    analysis = `資產面：${strategyName}對資產結構的影響需依具體策略內容評估。建議分析策略執行對各項資產的影響。

負債面：策略執行可能影響負債結構，需評估融資需求與償債能力的變化。

權益面：策略投入會影響淨利與股東權益，需平衡短期成本與長期效益。

財務比率影響：策略執行可能影響各項財務比率，建議建立財務影響評估機制。`;
  }
  
  return analysis;
};

const generateStrategyFeasibilityAnalysis = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    analysis = `實施可行性：人力培訓策略對${companyContext}而言具有高度可行性，投資門檻相對較低，可採階段性實施。

資源需求評估：需要培訓預算（建議為年薪資總額的5-10%）、內部講師資源或外部培訓機構合作、員工培訓時間安排。

實施風險控制：主要風險為培訓成效不如預期、關鍵人才流失等。建議建立培訓效果評估機制與留才方案。

成功關鍵因素：管理層支持、培訓內容與實務結合、建立學習激勵機制、持續性投入而非一次性培訓。`;
  } else if (elements.includes('系統')) {
    analysis = `實施可行性：系統導入策略需要較高的初期投資與技術門檻，建議${companyContext}評估內部IT能力與預算充足性。

資源需求評估：需要系統建置預算（建議為年營收的2-5%）、IT人力資源、系統整合與測試時間、員工教育訓練。

實施風險控制：主要風險為系統整合失敗、成本超支、員工適應困難等。建議選擇有經驗的系統廠商與建立分階段驗收機制。

成功關鍵因素：選擇合適的系統解決方案、充分的需求分析、使用者參與設計、完整的測試與訓練。`;
  } else if (elements.includes('設備')) {
    analysis = `實施可行性：設備投資策略需要大額資金投入，建議${companyContext}評估投資回收期與融資能力。

資源需求評估：需要設備採購預算、安裝場地準備、操作人員培訓、維護保養資源。投資金額通常較大，需要充分評估。

實施風險控制：主要風險為設備選型錯誤、安裝延遲、操作安全等。建議選擇信譽良好的設備供應商與建立完整的設備管理制度。

成功關鍵因素：正確的設備選型、充分的事前規劃、專業的安裝調試、完善的維護保養計畫。`;
  } else if (elements.includes('外部')) {
    analysis = `實施可行性：外部合作策略可快速取得專業資源，對${companyContext}而言具有中高度可行性，但需要慎選合作夥伴。

資源需求評估：需要外部服務預算、內部配合人力、專案管理資源、知識轉移機制。成本相對可控，風險相對較低。

實施風險控制：主要風險為合作夥伴選擇錯誤、知識轉移不足、依賴性過高等。建議建立供應商評估機制與合約管理制度。

成功關鍵因素：選擇合適的合作夥伴、明確的合作目標與範圍、有效的溝通協調、知識轉移與內化。`;
  } else if (elements.includes('流程')) {
    analysis = `實施可行性：流程改善策略主要依賴內部資源，對${companyContext}而言具有高度可行性，可配合營運需求彈性調整。

資源需求評估：需要專案團隊人力、流程分析與設計時間、系統或表單調整、員工教育訓練。主要為人力時間成本。

實施風險控制：主要風險為員工抗拒改變、流程設計不佳、缺乏持續改善等。建議建立變革管理機制與持續改善文化。

成功關鍵因素：管理層承諾、員工參與、流程標準化、持續監控與改善、建立流程管理制度。`;
  } else {
    analysis = `實施可行性：${strategyName}的可行性需依據${companyContext}的資源條件與策略目標進行評估。

資源需求評估：需要依據實際選擇的策略項目評估所需資源，包括人力、資金、時間、技術等面向。

實施風險控制：需要識別策略執行的主要風險點，建立風險控制機制與應變計畫。

成功關鍵因素：需要依據策略特性識別成功的關鍵因素，確保策略執行的有效性。`;
  }
  
  return analysis;
};

const generateAnalysisMethodology = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let methodology = '';
  
  if (elements.includes('人力')) {
    methodology = `分析框架：採用人力資本投資報酬率（HCROI）分析法，評估培訓投資對組織績效的影響。

數據收集方法：
1. 基準數據：培訓前的個人與部門績效指標
2. 投入數據：培訓費用、時間成本、機會成本
3. 產出數據：培訓後的績效改善、效率提升、品質改善

評估指標設計：
- 直接指標：人均產值、作業效率、錯誤率
- 間接指標：員工滿意度、離職率、客戶滿意度
- 財務指標：培訓成本、績效改善帶來的收益

分析週期建議：建立月度追蹤、季度評估、年度檢討的三層級分析機制。`;
  } else if (elements.includes('系統')) {
    methodology = `分析框架：採用IT投資價值分析（IT Value Analysis）方法，結合成本效益分析與風險評估。

數據收集方法：
1. 成本數據：系統建置、維護、訓練、機會成本
2. 效益數據：效率提升、錯誤減少、成本節省
3. 風險數據：技術風險、營運風險、市場風險

評估指標設計：
- 效率指標：處理時間、處理量、自動化率
- 品質指標：錯誤率、客戶滿意度、系統穩定度
- 財務指標：ROI、NPV、回收期

分析週期建議：系統導入期間按月監控，穩定營運後按季評估，年度進行全面檢討。`;
  } else if (elements.includes('設備')) {
    methodology = `分析框架：採用設備投資評估（Equipment Investment Analysis）方法，包含技術、經濟、風險三個面向。

數據收集方法：
1. 投資數據：設備成本、安裝調試、培訓費用
2. 營運數據：產能提升、品質改善、維護成本
3. 市場數據：產品需求、價格變動、競爭態勢

評估指標設計：
- 產能指標：設備稼動率、產出量、品質合格率
- 效率指標：單位成本、維護效率、能源效率
- 財務指標：投資回收期、內部報酬率、淨現值

分析週期建議：設備導入期按週監控，正常營運後按月評估，年度進行投資效益檢討。`;
  } else if (elements.includes('外部')) {
    methodology = `分析框架：採用外部服務價值評估（External Service Value Assessment）方法，評估合作效益與風險。

數據收集方法：
1. 成本數據：外部服務費用、內部配合成本、機會成本
2. 效益數據：專業能力提升、時間節省、品質改善
3. 風險數據：依賴風險、知識轉移風險、合作風險

評估指標設計：
- 合作指標：專案達成率、時程達成率、品質達成率
- 學習指標：知識轉移效果、內部能力提升
- 財務指標：外部服務成本、內部成本節省、價值創造

分析週期建議：合作期間按月評估專案進度，合作結束後按季評估知識轉移效果。`;
  } else if (elements.includes('流程')) {
    methodology = `分析框架：採用流程改善分析（Process Improvement Analysis）方法，結合精實管理與品質管理原理。

數據收集方法：
1. 現況數據：流程時間、成本、品質、資源使用
2. 改善數據：流程重設計、標準化、自動化效果
3. 效益數據：效率提升、成本節省、品質改善

評估指標設計：
- 效率指標：流程週期時間、處理量、資源利用率
- 品質指標：錯誤率、重工率、客戶滿意度
- 財務指標：流程成本、改善投入、效益產出

分析週期建議：改善實施期間按週追蹤，穩定後按月評估，季度進行流程績效檢討。`;
  } else {
    methodology = `分析框架：需要依據${strategyName}的特性選擇適當的分析方法，建議結合定量與定性分析。

數據收集方法：
1. 建立基準數據收集機制
2. 設定投入與產出指標
3. 建立風險監控數據

評估指標設計：
- 依據策略目標設定關鍵績效指標
- 建立財務影響追蹤指標
- 設定風險控制指標

分析週期建議：依據策略執行週期設定適當的分析頻率與檢討機制。`;
  }
  
  return methodology;
};

const generateCalculationMethodSuggestions = (
  isRisk: boolean,
  categoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[]
): string => {
  let suggestions = '';
  
  if (elements.includes('人力')) {
    suggestions = `人力投資報酬率計算：
ROI = (培訓後績效提升價值 - 培訓總成本) / 培訓總成本 × 100%

培訓成本計算：
- 直接成本：培訓費用 + 教材費用 + 場地費用
- 間接成本：員工培訓時間 × 平均時薪 + 管理時間成本
- 機會成本：培訓期間產能損失 × 單位產能價值

效益計算：
- 效率提升：(培訓後產能 - 培訓前產能) × 工作天數 × 單位產能價值
- 品質改善：錯誤減少量 × 重工成本 × 工作天數
- 員工留任：離職率降低 × 招募訓練成本

計算週期：建議每季計算一次，年度進行完整評估。`;
  } else if (elements.includes('系統')) {
    suggestions = `系統投資效益計算：
NPV = Σ(年度現金流入 - 年度現金流出) / (1 + 折現率)^年數 - 初始投資

系統建置成本：
- 硬體成本：伺服器 + 網路設備 + 個人電腦
- 軟體成本：授權費 + 客製化開發 + 維護費
- 人力成本：專案人員 + 教育訓練 + 系統管理

效益計算：
- 效率提升：(系統化後處理時間 - 人工處理時間) × 處理量 × 人力時薪
- 錯誤減少：錯誤率降低 × 處理量 × 重工成本
- 人力節省：減少人力 × 年薪 × 工作效率

投資回收期 = 初始投資 / 年度淨現金流入`;
  } else if (elements.includes('設備')) {
    suggestions = `設備投資分析計算：
內部報酬率 IRR：使 NPV = 0 的折現率
投資回收期 = 初始投資 / 年平均現金流入

設備投資成本：
- 採購成本：設備價格 + 運費 + 安裝費
- 前置成本：場地準備 + 人員培訓 + 測試調校
- 營運成本：維護費 + 耗材費 + 人力成本

效益計算：
- 產能提升：(新設備產能 - 舊設備產能) × 運轉時間 × 單位產值
- 成本節省：(舊設備維護成本 - 新設備維護成本) × 年度
- 品質改善：品質提升率 × 產出量 × 品質價值差異

折舊攤提：依設備類型選擇直線法或加速折舊法。`;
  } else if (elements.includes('外部')) {
    suggestions = `外部服務價值計算：
價值比 = 外部服務創造價值 / 外部服務成本

外部服務成本：
- 直接成本：顧問費 + 專案費 + 材料費
- 間接成本：內部配合人力 × 時薪 + 管理成本
- 機會成本：內部人力投入其他專案的潜在收益

價值計算：
- 專業價值：(外部專業解決方案 - 內部摸索成本) × 時間價值
- 時間價值：專案縮短時間 × 時間成本 × 急迫性係數
- 知識價值：專業知識轉移 × 內部人力 × 學習效率

投資回收期：外部服務總成本 / 年度效益增加額`;
  } else if (elements.includes('流程')) {
    suggestions = `流程改善效益計算：
改善效益 = (改善前總成本 - 改善後總成本) × 年度處理量

流程改善成本：
- 人力成本：專案團隊 × 投入時間 × 平均薪資
- 系統成本：流程系統調整 + 表單重設計
- 訓練成本：員工教育訓練 + 流程文件製作

效益計算：
- 時間節省：(原流程時間 - 新流程時間) × 處理量 × 時間成本
- 品質提升：錯誤率降低 × 處理量 × 重工成本
- 資源節省：資源使用減少 × 單位成本 × 處理量

投資回收期：流程改善總投入 / 年度節省金額`;
  } else {
    suggestions = `通用財務計算方法：
投資報酬率 ROI = (投資效益 - 投資成本) / 投資成本 × 100%
淨現值 NPV = 未來現金流現值 - 初始投資
回收期 = 初始投資 / 年平均現金流入

成本計算原則：
- 識別所有直接與間接成本
- 考慮機會成本與沉沒成本
- 按時間分攤大額投資

效益計算原則：
- 量化可衡量的效益
- 評估難以量化的效益
- 考慮風險調整後的效益

建議依據實際策略選擇項目，採用對應的計算方法進行評估。`;
  }
  
  return suggestions;
};
