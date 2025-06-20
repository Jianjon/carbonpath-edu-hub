
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
  strategyFeasibilityAnalysis: string;
  analysisMethodology: string;
  calculationMethodSuggestions: string;
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
  
  // 參數中文化
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

  const sizeMapping: Record<string, string> = {
    'small': '小型',
    'medium': '中型',
    'large': '大型'
  };

  const industryText = industryMapping[companyProfile.industry] || companyProfile.industry;
  const sizeText = sizeMapping[companyProfile.size] || companyProfile.size;
  const companyContext = `${sizeText}${industryText}企業`;

  // 生成六大段落分析
  return {
    profitLossAnalysis: generateProfitLossAnalysis(isRisk, categoryName || '', subcategoryName || '', strategyName, companyContext, companyProfile),
    cashFlowAnalysis: generateCashFlowAnalysis(isRisk, categoryName || '', subcategoryName || '', strategyName, companyContext, companyProfile),
    balanceSheetAnalysis: generateBalanceSheetAnalysis(isRisk, categoryName || '', subcategoryName || '', strategyName, companyContext, companyProfile),
    strategyFeasibilityAnalysis: generateStrategyFeasibilityAnalysis(isRisk, categoryName || '', subcategoryName || '', strategyName, companyContext, companyProfile),
    analysisMethodology: generateAnalysisMethodology(isRisk, categoryName || '', subcategoryName || '', strategyName, companyProfile),
    calculationMethodSuggestions: generateCalculationMethodSuggestions(isRisk, categoryName || '', subcategoryName || '', strategyName, companyProfile)
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
  // Add null checks for categoryName
  const safeCategoryName = categoryName || '';
  
  if (safeCategoryName.includes('政策') || safeCategoryName.includes('法規')) {
    if (strategyName.includes('轉移')) {
      return `採用轉移策略將協助${companyContext}將合規成本部分轉嫁，短期內可維持毛利率穩定。然而長期轉嫁能力將取決於市場接受度，可能影響產品定價競爭力，導致市場佔有率變動。`;
    } else if (strategyName.includes('減緩')) {
      return `透過減緩策略主動投入合規準備，將增加短期營運支出，包含系統建置與人員培訓成本。中長期而言有助於提升營運效率，可能改善單位產出成本結構。`;
    } else if (strategyName.includes('接受')) {
      return `接受策略意味直接承擔合規成本，將導致營業費用增加。${companyContext}需評估成本吸收能力，可能需要調整產品組合或服務定價來維持獲利水準。`;
    }
  }

  if (safeCategoryName.includes('技術')) {
    if (strategyName.includes('積極投入')) {
      return `積極投入技術升級將產生大額研發支出與設備投資，短期內將壓縮獲利表現。成功轉型後可望獲得技術優勢，提升產品附加價值並創造差異化營收來源。`;
    } else if (strategyName.includes('能力建設')) {
      return `透過能力建設逐步提升技術水準，將產生持續性的人力培訓與設備更新成本。此策略有助於平衡短期獲利壓力與長期競爭力建設需求。`;
    }
  }

  if (safeCategoryName.includes('市場')) {
    if (strategyName.includes('商業轉換')) {
      return `商業模式轉換將導致既有營收結構調整，初期可能面臨營收下滑風險。轉換成功後可開拓新客群，創造可持續的營收成長動能並提升獲利品質。`;
    }
  }

  // 通用分析
  const impactDirection = isRisk ? '增加成本壓力或營收風險' : '創造新營收機會或提升效率';
  return `${strategyName}將${impactDirection}。${companyContext}需評估策略執行對核心獲利能力的影響，並建立相應的績效追蹤機制來監控財務表現變化。`;
};

const generateCashFlowAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  companyProfile: any
): string => {
  if (strategyName.includes('轉移')) {
    return `轉移策略需要支付合約重新談判、法務諮詢等一次性費用，短期內將增加現金流出壓力。建議${companyContext}預留3-6個月的策略執行資金，並評估融資額度的充足性。`;
  }

  if (strategyName.includes('積極投入') || strategyName.includes('商業轉換')) {
    return `大規模投入策略將產生顯著的資本支出需求，${companyContext}應評估現金流承受能力並制定分期投資計畫。建議建立投資現金流預算，避免流動性風險。`;
  }

  if (strategyName.includes('能力建設')) {
    return `能力建設策略需要持續性的培訓與系統建置投入，現金流影響相對溫和但持續時間較長。建議納入年度預算規劃，並評估每季現金需求變化。`;
  }

  const safeCategoryName = categoryName || '';
  if (safeCategoryName.includes('實體風險')) {
    return `實體風險應對策略可能需要緊急資金調度，包含設備修復、替代方案啟動等支出。建議設立風險準備資金池，確保緊急狀況下的現金可用性。`;
  }

  // 通用分析
  return `${strategyName}的現金流影響將視執行規模而定。${companyContext}應評估策略現金需求的時間分布，並制定相應的資金管理計畫以確保流動性充足。`;
};

const generateBalanceSheetAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  companyProfile: any
): string => {
  const safeCategoryName = categoryName || '';

  if (safeCategoryName.includes('技術')) {
    return `技術相關策略將改變${companyContext}的固定資產結構。新技術設備將增加資產項目，既有設備可能面臨減損風險。建議重新評估資產折舊政策並考慮設備汰換的財務處理。`;
  }

  if (safeCategoryName.includes('政策') || safeCategoryName.includes('法規')) {
    return `法規遵循策略可能需要新增合規相關資產，如監測設備或資訊系統。同時可能需要提列合規準備金或潛在罰款準備，影響負債結構。`;
  }

  if (safeCategoryName.includes('實體風險')) {
    return `實體風險管理策略可能導致資產價值重估，特別是暴露於風險區域的設施設備。建議定期進行資產減損測試，並檢視保險覆蓋率對資產保護的充足性。`;
  }

  if (strategyName.includes('積極投入')) {
    return `積極投入策略將顯著增加固定資產規模，同時可能需要增加負債融資。${companyContext}應評估負債承擔能力變化，並檢視資本結構的適當性。`;
  }

  // 通用分析
  return `${strategyName}對${companyContext}的資產負債結構將產生相應影響。建議定期檢視資產品質變化，評估負債水準的合理性，並適時調整資本配置策略。`;
};

const generateStrategyFeasibilityAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  companyProfile: any
): string => {
  const industryContext = companyProfile.industry;
  const sizeContext = companyProfile.size;

  if (strategyName.includes('轉移')) {
    return `選擇轉移策略反映${companyContext}對風險承擔能力的理性評估。此策略適合資源相對有限但有合作夥伴支持的企業，可有效分散單一企業承擔的財務波動。`;
  }

  if (strategyName.includes('積極投入')) {
    return `積極投入策略顯示${companyContext}對機會把握的積極態度。此策略適合財務體質良好、管理能力強的企業，但需要充足的資本支持與完善的風險管控機制。`;
  }

  if (strategyName.includes('能力建設')) {
    return `能力建設策略符合${companyContext}穩健發展的需求。此策略可讓企業按自身步調進行改善，避免過度擴張風險，適合重視長期發展的組織。`;
  }

  if (strategyName.includes('接受')) {
    return `接受策略反映${companyContext}對自身財務承受能力的信心。此策略適合現金流穩定、風險管理經驗豐富的企業，可保持策略彈性並專注核心業務。`;
  }

  // 通用分析
  return `${strategyName}的選擇考量${companyContext}的內部資源與外部環境條件。此策略有助於在不確定環境中維持營運穩定，建議配合完善的執行計畫確保目標達成。`;
};

const generateAnalysisMethodology = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyProfile: any
): string => {
  const baseMethod = '建議建立情境分析模型，設定不同嚴重程度的影響參數進行敏感度分析。';
  const safeCategoryName = categoryName || '';
  
  if (safeCategoryName.includes('政策') || safeCategoryName.includes('法規')) {
    return `${baseMethod}可建立合規成本追蹤系統，設定KPI如合規費用佔營收比例。建議每季模擬不同法規要求下的成本變動，並與同業進行標竿比較。`;
  }

  if (safeCategoryName.includes('技術')) {
    return `${baseMethod}可建立技術投資效益評估模型，追蹤技術導入進度與成本效益。建議設定技術成熟度指標，並進行投資回收期分析。`;
  }

  if (safeCategoryName.includes('市場')) {
    return `${baseMethod}可建立市場需求變化追蹤機制，分析客戶偏好轉移對營收結構的影響。建議定期進行市場調研，更新需求預測模型。`;
  }

  if (safeCategoryName.includes('實體風險')) {
    return `${baseMethod}可結合歷史氣候資料建立風險發生機率模型，評估不同情境下的營運中斷成本。建議建立緊急應變績效指標。`;
  }

  // 通用方法
  return `${baseMethod}建議設定關鍵績效指標追蹤系統，定期評估實際表現與預測差異。可運用蒙地卡羅模擬評估財務影響的機率分布，協助管理決策。`;
};

const generateCalculationMethodSuggestions = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyProfile: any
): string => {
  if (strategyName.includes('轉移')) {
    return `風險轉移成本分攤比例 = 預估總風險成本 × 合作夥伴承擔比例（如60%）。合約修改成本 = 預計修改合約數量 × 每筆平均修改費用。保險費用調整 = 風險轉移後保險費率變動 × 保險標的價值。`;
  }

  if (strategyName.includes('能力建設')) {
    return `人力投入成本 = 培訓時數 × 內部人力平均成本 + 外部培訓費用。系統建置成本 = 軟硬體採購 + 導入服務費 + 維護年費。能力提升效益 = 效率改善比例 × 原有作業成本基準。`;
  }

  if (strategyName.includes('積極投入')) {
    return `投資規模估算 = 設備投資 + 研發支出 + 營運資金需求。預期營收貢獻 = 新產品市場規模 × 預估市佔率 × 平均毛利率。投資回收期 = 總投資額 ÷ 年度淨現金流入。`;
  }

  if (strategyName.includes('商業轉換')) {
    return `轉換成本 = 既有業務調整成本 + 新業務建置成本。營收替代率 = 新業務營收 ÷ 既有業務營收損失。客戶轉移成本 = 客戶取得成本 × 預計新增客戶數。`;
  }

  if (strategyName.includes('接受')) {
    return `風險準備金 = 預估風險成本 × 發生機率 × 安全係數（如1.2倍）。應變成本 = 緊急應變人力 + 替代方案執行成本。風險成本攤提 = 年度風險準備金 ÷ 預期影響年數。`;
  }

  const safeCategoryName = categoryName || '';
  if (safeCategoryName.includes('實體風險')) {
    return `營運中斷損失 = 平均日營收 × 預估中斷天數 × 影響程度（如70%）。復原成本 = 設備修復費 + 臨時措施費用 + 額外人力成本。保險理賠淨額 = 保險給付 - 自負額 - 理賠等待期損失。`;
  }

  // 通用計算建議
  return `成本效益分析 = （預期效益 - 執行成本）÷ 執行成本。敏感度分析 = 關鍵變數變動 ± X% 對財務指標的影響程度。情境模擬 = 樂觀、基準、悲觀三種情境下的財務表現比較。`;
};
