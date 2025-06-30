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
    scenarioDescription,
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
    kpiImpact: generateKPIImpact(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription),
    cashFlowImpact: generateCashFlowImpact(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription),
    balanceSheetImpact: generateBalanceSheetImpact(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription),
    executionCost: generateExecutionCost(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription)
  };

  // 生成詳細的六個分析區塊
  const detailedAnalysis = {
    profitLossAnalysis: generateProfitLossAnalysis(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription, industryText, sizeText),
    cashFlowAnalysis: generateDetailedCashFlowAnalysis(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription, industryText, sizeText),
    balanceSheetAnalysis: generateDetailedBalanceSheetAnalysis(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription, industryText, sizeText),
    strategyFeasibilityAnalysis: generateStrategyFeasibilityAnalysis(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription, industryText, sizeText),
    analysisMethodology: generateAnalysisMethodology(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription),
    calculationMethodSuggestions: generateCalculationMethodSuggestions(isRisk, categoryName, subcategoryName, strategyName, companyContext, selectedElements, scenarioDescription)
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

const generateProfitLossAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string,
  industryText: string,
  sizeText: string
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    if (categoryName.includes('法規') || categoryName.includes('政策')) {
      analysis = `因應法規變化進行人員培訓，短期將增加教育訓練費用約佔總薪資成本3-5%，影響營業費用上升。然而培訓後員工合規作業能力提升，可避免違規罰款風險，預期6個月後透過作業效率改善，每人每月可節省2-3小時重工時間，間接提升服務品質與客戶滿意度，有助於營收維持穩定成長。建議設定「合規培訓完成率」與「違規事件減少率」作為績效追蹤指標。`;
    } else if (categoryName.includes('技術') || categoryName.includes('市場')) {
      analysis = `針對技術轉型投入專業人力培訓，預估培訓成本為年薪資總額8-12%，將計入當期管理費用。培訓完成後預期員工專業技能提升，可承接更高價值業務，預估每位培訓員工可帶來15-20%的個人產值提升。${companyContext}可透過「技能認證通過率」與「高價值專案承接量」監控投資效益，預期12-18個月回收培訓投資成本。`;
    } else {
      analysis = `人力資源強化策略需要持續投入培訓預算，預估每季增加人事費用2-4%。透過系統性培訓提升員工應變能力，預期可減少因應急狀況產生的額外成本支出20-30%。建議${companyContext}建立「員工能力提升指標」與「危機應變成功率」，量化人力投資對營運穩定性的貢獻，確保投資報酬率達到預期目標。`;
    }
  } else if (elements.includes('系統')) {
    if (categoryName.includes('資料') || categoryName.includes('資訊')) {
      analysis = `導入資訊系統應對數據安全風險，系統建置成本預估為年營收2-4%，將於3年內攤提。系統上線後可大幅降低人工作業錯誤率達80%，每月節省資料處理人力成本約佔原成本15-25%。同時強化資安防護能力，避免資料外洩可能造成的高額賠償與商譽損失。${companyContext}應設定「系統自動化率」與「資安事件零發生」目標，確保投資效益最大化。`;
    } else if (categoryName.includes('營運') || categoryName.includes('供應鏈')) {
      analysis = `建置供應鏈管理系統強化營運韌性，初期投資約為年營收3-6%，分2-3年攤提。系統整合後可即時掌握供應商狀況，預期減少缺料停工損失50%以上，每次避免停工可節省營收損失約日營收的8-12%。透過「供應鏈透明度」與「準時交貨率」指標，預估18個月內透過營運效率提升回收系統投資。`;
    } else {
      analysis = `系統升級策略需要一次性大額資本支出，預估占年營收2-5%，將影響當期現金流與折舊費用。但系統效能提升後可顯著改善作業流程，預期減少人工處理時間40-60%，節省的人力成本可於第二年起顯現，預估年節省營業費用3-8%。建議追蹤「系統處理效率」與「人力成本節省額度」確保投資回收達標。`;
    }
  } else if (elements.includes('設備')) {
    if (categoryName.includes('實體風險') || categoryName.includes('氣候')) {
      analysis = `因應極端氣候風險升級防護設備，預估設備投資額約為年營收5-10%，將增加固定資產折舊負擔。然而強化設備可避免天災造成的營運中斷，每次避免停業損失相當於日營收20-40%。透過設備升級提升營運韌性，預期可維持98%以上的營運穩定率，確保${companyContext}在極端氣候下仍能正常獲利，建議設定「設備抗災能力指標」追蹤投資效益。`;
    } else if (categoryName.includes('能源') || categoryName.includes('效率')) {
      analysis = `導入節能設備優化能源使用效率，設備採購成本約為年營收3-7%，透過5-7年折舊攤提。新設備預期節能效果達25-35%，以目前能源成本計算，每年可節省能源費用約為總能源支出的30%，相當於營業費用減少1-2%。${companyContext}可設定「能源使用效率指標」與「碳排放減少量」，預估3-4年透過節能效益回收設備投資成本。`;
    } else {
      analysis = `設備更新投資將產生顯著的固定資產增加與折舊費用，預估投資金額為年營收4-8%。新設備投入後預期生產效率提升30-50%，單位產品成本下降15-25%，有助於提升毛利率2-4%。透過「設備稼動率」與「單位成本改善率」監控，預期2-3年內透過效率提升與成本節省回收設備投資，對長期獲利能力產生正面影響。`;
    }
  } else if (elements.includes('外部')) {
    if (categoryName.includes('法規') || categoryName.includes('合規')) {
      analysis = `聘請外部合規顧問協助法規因應，顧問費用預估每月增加營業費用0.5-1.5%，為持續性支出。專業顧問協助可大幅縮短法規適應期，避免因不熟悉法規造成的違規罰款與業務停擺風險。預期透過專業指導，合規作業效率提升60%以上，減少內部摸索成本，同時確保${companyContext}在法規變動下維持正常營運與獲利能力。`;
    } else if (categoryName.includes('市場') || categoryName.includes('商機')) {
      analysis = `與外部夥伴合作開發新市場機會，合作費用包含權利金與分潤約佔新業務營收10-20%。透過外部專業資源快速進入新市場，預期可縮短自主開發時程50%以上，提前6-12個月產生營收貢獻。合作模式降低自主投資風險，預估新業務可為${companyContext}帶來15-30%的營收成長，建議設定「合作業務貢獻度」與「市場進入速度」指標追蹤成效。`;
    } else {
      analysis = `外部專業服務支援策略執行，服務費用約為專案預算15-25%，屬一次性或階段性支出。專業團隊協助可避免內部試錯成本，預期縮短專案執行時程30-40%，提前實現策略效益。透過知識轉移提升內部能力，長期可減少對外部依賴，建議${companyContext}設定「專案成功率」與「知識內化程度」指標評估外部合作效益。`;
    }
  } else if (elements.includes('流程')) {
    if (categoryName.includes('營運') || categoryName.includes('效率')) {
      analysis = `營運流程重整優化作業效率，改善期間需投入內部人力約3-6個月專案時間，相當於人力成本增加5-8%。流程標準化完成後預期作業週期時間縮短35-50%，減少重複作業與錯誤率，每月可節省營業費用2-4%。${companyContext}透過「流程標準化完成度」與「作業效率提升率」監控，預期6-9個月內透過效率改善回收流程改善投入成本。`;
    } else if (categoryName.includes('風險') || categoryName.includes('控制')) {
      analysis = `建立風險控制流程強化營運穩定性，流程建置需投入專案人力2-4個月，短期增加人事成本。完善的風險控制機制可減少異常事件發生頻率70%以上，避免因突發狀況造成的營收損失，每次成功預防風險事件可節省潛在損失相當於週營收5-15%。建議${companyContext}設定「風險事件發生率」與「應變處理時間」指標量化流程改善效益。`;
    } else {
      analysis = `流程改善策略主要為內部資源重新配置，需要2-5個月的專案投入期，影響短期人力調度。流程優化後預期整體作業效率提升20-40%，減少無效作業時間，釋出人力資源投入核心業務。透過「流程效率指標」與「人力資源運用率」追蹤，預期4-8個月內實現流程改善帶來的成本節省與效率提升效益。`;
    }
  } else {
    analysis = `${strategyName}執行將對${companyContext}損益結構產生階段性影響。初期策略投入成本預估為年營收1-3%，主要影響當期營業費用。策略效益發揮後預期可改善營運效率15-30%，透過成本節省與收入優化，預估6-12個月內對獲利能力產生正面貢獻。建議依據${categoryName}特性設定對應績效指標，確保策略投資回收達到預期目標。`;
  }
  
  return analysis;
};

const generateDetailedCashFlowAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string,
  industryText: string,
  sizeText: string
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    if (categoryName.includes('技術') || categoryName.includes('數位')) {
      analysis = `數位轉型人才培訓需要分階段投入，預估前3個月每月增加現金流出8-15%，主要用於外部訓練課程與內部導師費用。培訓期間因學習曲線影響，短期生產力可能下降10-20%。但第4個月起員工數位技能提升，預期作業自動化程度提高，每月可節省加班費與外包費用約佔人力成本5-10%。${companyContext}建議預留6個月營運資金緩衝，確保轉型期間現金流穩定。`;
    } else if (categoryName.includes('合規') || categoryName.includes('法規')) {
      analysis = `合規培訓投入相對平穩，每季固定增加現金流出3-6%用於認證課程與法規更新訓練。培訓投資可避免違規罰款風險，以同業違規案例推估，每次避免違規可節省相當於月營收2-8%的罰款支出。同時合規能力提升有助於爭取政府補助與優惠貸款，預期每年可增加額外資金來源相當於年營收1-3%。建議${companyContext}將合規培訓列為固定預算項目。`;
    } else {
      analysis = `人力強化策略採分期投入模式，每月穩定增加現金流出2-5%用於培訓與能力建置。人員技能提升後可承接更複雜業務，預期客單價提升15-25%，回款週期維持不變下，每月營運現金流可改善3-8%。透過「人均產值」與「現金回收天數」監控，預期8-12個月後現金流狀況顯著改善，建議預留3-6個月週轉金因應投入期需求。`;
    }
  } else if (elements.includes('系統')) {
    if (categoryName.includes('自動化') || categoryName.includes('效率')) {
      analysis = `自動化系統建置需要大額前期投入，預估第1季現金流出增加50-80%，包含軟硬體採購與導入服務費。第2-3季為系統整合期，每月持續投入維護費約佔總投資5-8%。系統穩定運行第4季起，自動化作業可減少人工成本20-35%，每月現金節省相當於原人力支出的25-40%。${companyContext}建議準備12個月現金流預算，並評估分期付款或設備融資方案。`;
    } else if (categoryName.includes('資安') || categoryName.includes('資料')) {
      analysis = `資安系統投資集中於前2季，現金流出約為年營收4-8%，包含資安軟體授權與防護設備。每月維護費用約佔系統投資2-4%，為持續性現金流出。強化資安防護可避免資料外洩造成的巨額賠償，以同業案例推估，每次成功防護可避免相當於年營收10-30%的潛在損失。建議${companyContext}評估資安保險降低現金流風險，並預留應急資金因應突發狀況。`;
    } else {
      analysis = `系統升級投資前期現金流壓力較大，預估前6個月累計流出相當於年營收3-7%。系統導入後作業效率提升，預期應收帳款週轉天數縮短15-25%，加速現金回收。同時減少人工錯誤造成的重工成本，每月可節省營運現金支出5-12%。建議${companyContext}與銀行協商短期週轉額度，確保系統建置期間資金無虞。`;
    }
  } else if (elements.includes('設備')) {
    if (categoryName.includes('環保') || categoryName.includes('節能')) {
      analysis = `節能設備採購需要大額資本支出，建議分2-3期付款減緩現金流壓力，每期支付約為總投資的35-50%。設備安裝調試期間可能影響正常營運，預估2-4週內現金流入減少10-20%。新設備投入後節能效果顯著，每月電力費用可節省25-40%，以${companyContext}平均能源成本計算，預估12-18個月回收設備投資現金流出。建議評估政府節能補助降低初期投入負擔。`;
    } else if (categoryName.includes('生產') || categoryName.includes('製程')) {
      analysis = `生產設備更新投資金額較大，建議採設備融資方案，首付30-40%，餘款分36-60期攤還，可有效分散現金流壓力。新設備產能提升30-50%，預期每月產品出貨量增加，現金流入改善20-35%。同時設備自動化程度提高，每月可節省人工成本15-25%。${companyContext}透過產能與成本雙重改善，預估24-36個月內設備投資現金流可完全回收。`;
    } else {
      analysis = `設備投資採分階段執行策略，第1階段投入60%資金進行核心設備更新，第2階段投入40%進行週邊配套。分階段投入可降低現金流衝擊，同時確保設備效益逐步顯現。預期設備投入後營運效率提升25-40%，現金週轉速度加快，每月營運現金流改善10-20%。建議${companyContext}預留設備維護基金，確保長期穩定運作。`;
    }
  } else if (elements.includes('外部')) {
    if (categoryName.includes('諮詢') || categoryName.includes('顧問')) {
      analysis = `專業顧問服務採專案制付費，預估每月固定支出增加5-12%，付款條件通常為按月或按階段給付。顧問協助可大幅縮短內部摸索時間，預期專案執行週期縮短40-60%，間接節省內部人力成本相當於專案預算20-30%。透過專業指導避免決策錯誤，預估可避免潛在損失相當於月營收5-15%。${companyContext}建議將顧問費列為專案必要成本，確保策略執行品質。`;
    } else if (categoryName.includes('合作') || categoryName.includes('聯盟')) {
      analysis = `策略聯盟合作採分潤模式，前期需投入保證金約為合作預算10-20%，後續按業績分潤15-30%。合作模式可快速進入新市場，預期3-6個月內產生營收貢獻，現金流入改善10-25%。分潤制度降低固定成本壓力，現金流風險相對可控。建議${companyContext}建立合作業績追蹤機制，確保現金流回收符合預期目標。`;
    } else {
      analysis = `外部資源整合需要階段性投入，每季現金流出增加8-15%用於合作費用與整合成本。外部專業能力補強可提升服務品質，預期客戶滿意度提升帶動續約率增加20-35%，穩定現金流來源。同時外部合作可分攤風險，避免自主投資造成的大額現金流出。建議${companyContext}評估多元合作模式，優化現金流管理效益。`;
    }
  } else if (elements.includes('流程')) {
    if (categoryName.includes('數位化') || categoryName.includes('自動化')) {
      analysis = `流程數位化改善主要為人力時間投入，預估2-4個月專案期間每月人力成本增加10-15%。數位化流程建立後可大幅提升作業效率，預期處理時間縮短50-70%，間接加速客戶收款週期，每月現金回收提前3-7天。同時減少紙本作業與重複確認成本，每月可節省營運支出2-5%。${companyContext}透過流程優化預期6-10個月內現金流管理效率顯著提升。`;
    } else if (categoryName.includes('標準化') || categoryName.includes('制度')) {
      analysis = `制度標準化建置需要內部人力密集投入，預估3-5個月期間相當於增加15-25%人力成本。標準化流程完成後可減少異常處理與重工情況，預期每月可節省額外支出相當於營業費用5-10%。同時標準作業縮短新人培訓期，減少培訓成本與生產力損失，每位新進員工可節省培訓成本20-40%。建議${companyContext}將標準化視為長期投資，持續優化現金流效益。`;
    } else {
      analysis = `流程改善專案採內部主導模式，主要現金流出為專案人力機會成本，預估佔總人力成本8-12%。流程優化後營運效率提升，預期客戶服務週期縮短30-45%，加速現金流週轉。同時減少流程冗餘與等待時間，每月可提升營運現金流效率5-15%。透過持續改善機制，${companyContext}可建立長期現金流管理優勢。`;
    }
  } else {
    analysis = `${strategyName}執行需要階段性現金投入，預估前6個月累計現金流出相當於月營收15-30%。策略效益發揮後預期營運效率改善，現金週轉加速10-25%，每月營運現金流可改善5-15%。建議${companyContext}準備充足營運資金，並建立現金流監控機制，確保策略執行期間財務穩定。同時評估外部融資支援，降低現金流壓力風險。`;
  }
  
  return analysis;
};

const generateDetailedBalanceSheetAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string,
  industryText: string,
  sizeText: string
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    analysis = `人力投資策略對資產負債表影響相對溫和，培訓費用可考慮遞延費用處理，分12-24個月攤提，避免單期費用衝擊過大。人力資本提升雖無法直接反映於帳面資產，但透過員工技能認證與專業證照可視為無形資產增值。${companyContext}建議建立人力資本評估機制，將重要員工培訓投資列入人力資產管理。長期而言，專業人才培育可提升企業智慧財產價值，間接增強資產品質與股東權益內涵。`;
  } else if (elements.includes('系統')) {
    if (categoryName.includes('數位') || categoryName.includes('資訊')) {
      analysis = `數位系統投資將顯著增加無形資產科目，軟體授權與開發成本按3-5年攤銷，硬體設備按5-8年提列折舊。系統建置如需要銀行融資，將增加長期負債約佔投資額60-80%，需重新評估負債比例與利息負擔。數位資產可提升企業估值，特別是數據處理與分析能力的建立，可視為${companyContext}重要競爭資產。建議定期評估系統資產減損風險，確保帳面價值合理性。`;
    } else if (categoryName.includes('自動化') || categoryName.includes('智能')) {
      analysis = `智能化系統投資兼具有形與無形資產特性，設備部分按機械設備折舊，軟體部分按無形資產攤銷。總投資額預估影響固定資產增加20-40%，如採融資購置需增加相應長期負債。自動化系統可提升資產使用效率，預期總資產週轉率改善15-25%。${companyContext}需評估資產負債比例變化對財務結構的影響，必要時考慮增資強化股東權益。`;
    } else {
      analysis = `系統升級投資主要影響固定資產與無形資產科目，預估增加資產總值5-15%。如採分期付款將產生應付款項，影響流動負債結構。系統資產可改善營運效率，預期資產報酬率提升10-20%。建議${companyContext}建立資產管理制度，定期檢視系統資產效益與折舊政策的合理性，確保資產配置最佳化。`;
    }
  } else if (elements.includes('設備')) {
    if (categoryName.includes('環保') || categoryName.includes('綠能')) {
      analysis = `綠能設備投資將大幅增加固定資產規模，預估佔總資產15-30%，按10-15年提列折舊。設備融資將增加長期負債，需評估償債能力與資產擔保價值。綠能設備可享有政府補助與稅務優惠，實際投資負擔約為帳面值70-85%。此類資產具環保價值，有助於提升企業ESG評等與品牌價值。${companyContext}建議將綠能投資視為長期策略資產管理。`;
    } else if (categoryName.includes('安全') || categoryName.includes('防護')) {
      analysis = `安全防護設備投資主要增加機械設備科目，按5-10年折舊攤提。此類設備通常無法產生直接收益，但可避免災害損失，應視為風險控制資產。如需要保險搭配，將增加預付費用科目。防護設備可降低資產減損風險，有助於維持資產價值穩定。建議${companyContext}定期評估防護效益，確保資產投資與風險控制效果相符。`;
    } else {
      analysis = `生產設備更新將汰換舊有資產，需辦理除帳並認列處分損益。新設備投資增加固定資產30-60%，大幅改變資產結構。設備融資增加長期負債，資產負債比例需重新平衡。新設備效率提升可改善資產週轉率，預期固定資產報酬率提升20-40%。${companyContext}需建立設備資產管理制度，優化資產配置效益。`;
    }
  } else if (elements.includes('外部')) {
    if (categoryName.includes('合資') || categoryName.includes('投資')) {
      analysis = `策略投資合作將產生長期股權投資科目，按持股比例認列投資收益。合資可能需要資金投入，影響現金與其他資產結構。投資收益可改善獲利能力，間接增強保留盈餘與股東權益。如為重大投資需評估對資產負債比例的影響，必要時考慮增資或融資調整財務結構。${companyContext}建議建立投資管理制度，定期評估投資效益與風險。`;
    } else if (categoryName.includes('服務') || categoryName.includes('外包')) {
      analysis = `外部服務採購主要影響營業費用，對資產負債表直接影響有限。服務費用如採預付方式將產生預付費用科目，按服務期間攤銷。外部專業服務可提升營運效率，間接改善資產使用效益。長期服務合約可能產生合約負債，需按會計準則適當處理。建議${companyContext}建立服務採購管理制度，優化外部資源配置。`;
    } else {
      analysis = `外部合作策略對資產負債表影響視合作模式而定，一般以營業費用科目處理，不直接影響資產負債結構。合作如涉及權利金或保證金將產生相應資產或負債科目。外部資源整合可提升營運能力，間接增強企業價值與股東權益。建議${companyContext}依合作性質適當會計處理，確保財務報表合規性。`;
    }
  } else if (elements.includes('流程')) {
    analysis = `流程改善主要為人力時間投入，對資產負債表直接影響較小。流程標準化可能涉及軟體系統或設備投資，需按性質分別處理。流程優化提升營運效率，可改善資產週轉率與投資報酬率。標準化制度建立可視為企業內部管理制度資產，雖不入帳但具實質價值。${companyContext}透過流程改善可提升整體資產運用效率，間接增強財務體質與競爭力。`;
  } else {
    analysis = `${strategyName}對${companyContext}資產負債結構影響需視具體執行內容而定。一般而言，策略投入可能影響資產配置與負債結構，需要定期檢視財務比例的合理性。策略執行如能改善營運效率，將有助於提升資產報酬率與股東權益報酬率。建議建立策略投資管理制度，追蹤投資效益對財務結構的影響，確保資本配置最佳化。`;
  }
  
  return analysis;
};

const generateStrategyFeasibilityAnalysis = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string,
  industryText: string,
  sizeText: string
): string => {
  let analysis = '';
  
  if (elements.includes('人力')) {
    if (categoryName.includes('技術') && isRisk) {
      analysis = `人力培訓策略適合應對技術風險，因為${companyContext}可透過內部人才培育建立技術能力，相較於外部採購技術服務更具成本效益與可控性。技術人才培育雖需時間累積，但可建立持續性競爭優勢，避免對外部技術依賴風險。以${industryText}特性而言，內部技術團隊更了解業務需求，培訓投資報酬率通常優於外購方案。實施關鍵在於選對培訓方向與建立學習激勵機制，確保人才留任。`;
    } else if (categoryName.includes('法規') && isRisk) {
      analysis = `面對法規風險採用人力培訓策略具高度可行性，因為合規能力需要深度理解與持續更新，內部培訓比外部委託更能確保執行品質。${companyContext}透過建立內部合規專家可長期受益，避免持續依賴外部顧問的高昂成本。法規培訓具標準化特性，訓練成本相對可控，且培訓後員工可同時提升專業能力與合規意識，一舉兩得。成功關鍵在於建立持續學習機制與定期更新訓練內容。`;
    } else if (!isRisk) {
      analysis = `人力投資策略適合把握市場機會，因為${companyContext}可透過人才升級快速提升服務品質與創新能力，相較於設備投資更具彈性與適應性。人力資本投資可同時服務多個市場機會，投資效益具擴散效果。以${sizeText}企業資源條件，人力培訓投資門檻相對較低，風險可控且易於調整。實施重點在於精準識別關鍵技能需求，建立人才發展路徑，確保培訓投資轉化為競爭優勢。`;
    } else {
      analysis = `人力強化策略對${companyContext}具高可行性，投資門檻低且可彈性調整規模。相較於大額設備投資，人力培訓風險較低且可逐步見效。${industryText}特性需要專業人才支撐，人力投資可同時提升多項能力指標。成功關鍵在於建立完整培訓體系與績效評估機制，確保人力投資產生預期效益。建議採階段性實施，持續優化培訓內容與方法。`;
    }
  } else if (elements.includes('系統')) {
    if (categoryName.includes('效率') && !isRisk) {
      analysis = `系統投資策略最適合把握效率提升機會，因為${companyContext}可透過自動化與數位化大幅改善營運效率，投資效益明確且可量化。系統一旦建置完成可持續發揮效益，不像人力需要持續投入。以${industryText}作業特性，系統化可消除人工錯誤與提升處理速度，競爭優勢顯著。實施風險主要在於系統選型與整合，建議選擇有經驗的系統廠商，採分階段導入降低實施風險。`;
    } else if (categoryName.includes('資安') && isRisk) {
      analysis = `系統強化策略是應對資安風險的最佳選擇，因為技術問題需要技術解決方案，人為防護無法達到系統性保護效果。${companyContext}透過資安系統投資可建立多層防護，相較於事後補救更具成本效益。資安系統具專業性，內部建置比外部委託更能確保持續性與客製化需求。實施關鍵在於選擇適合的資安方案與建立維護機制，確保防護效果持續有效。`;
    } else if (isRisk) {
      analysis = `系統升級策略適合控制營運風險，因為系統化管理可減少人為錯誤與提升作業穩定性。${companyContext}透過系統建置可建立標準化流程，降低營運風險發生機率。雖然初期投資較大，但系統穩定性高且可長期使用，總體成本效益優於人工管理。實施重點在於需求分析與系統整合，建議採用成熟技術方案，確保系統穩定可靠。`;
    } else {
      analysis = `系統投資策略對${companyContext}具中高度可行性，可大幅提升營運效率與競爭力。系統建置需要專業技術與充足預算，建議評估內部IT能力與財務條件。系統效益明確且可持續，適合作為中長期競爭優勢建立工具。成功關鍵在於選擇合適系統方案與完善的專案管理，確保系統導入順利且發揮預期效益。`;
    }
  } else if (elements.includes('設備')) {
    if (categoryName.includes('生產') && !isRisk) {
      analysis = `設備投資策略最適合把握產能擴張機會，因為${companyContext}可透過設備升級直接提升生產能力與產品品質，市場機會轉換效率最高。設備投資效益明確且可量化，相較於其他策略更容易評估投資報酬率。以${industryText}產業特性，設備現代化是競爭力提升的關鍵因素。實施風險主要在於設備選型與市場變化，建議充分評估市場需求穩定性，選擇技術成熟且維護便利的設備。`;
    } else if (categoryName.includes('安全') && isRisk) {
      analysis = `設備強化策略是應對安全風險的必要選擇，因為安全防護需要實體設備支撐，無法僅靠管理制度達成。${companyContext}透過安全設備投資可根本性降低風險發生機率，相較於風險轉移策略更具主動性。安全設備通常具長期使用價值，一次投資可長期受益。實施重點在於風險評估與設備規格選擇，確保防護效果符合實際需求與法規要求。`;
    } else {
      analysis = `設備投資策略需要${companyContext}具備充足資金與技術能力，投資門檻相對較高但效益明確。設備投資可建立長期競爭優勢，適合有穩定市場需求的企業。投資風險主要在於技術變化與市場波動，建議採用成熟技術與彈性配置。成功關鍵在於精準的需求分析與完善的維護計畫，確保設備投資發揮最大效益。`;
    }
  } else if (elements.includes('外部')) {
    if (categoryName.includes('專業') && isRisk) {
      analysis = `外部合作策略適合應對專業性風險，因為${companyContext}可快速取得專業能力，避免內部學習的時間成本與試錯風險。專業服務提供者具豐富經驗，可提供最佳實務方案。相較於內部建置，外部合作可分散風險且成本相對可控。實施關鍵在於合作夥伴選擇與合約管理，確保服務品質與知識轉移效果，避免過度依賴外部資源。`;
    } else if (categoryName.includes('市場') && !isRisk) {
      analysis = `外部合作策略最適合把握市場機會，因為${companyContext}可借助合作夥伴的市場資源與通路，快速進入新市場。合作模式可分攤風險與成本，相較於自主開發更具效率。外部夥伴的專業能力與資源可補強內部不足，提升市場機會掌握成功率。實施重點在於合作模式設計與利益分配機制，確保雙方長期合作意願與共同利益最大化。`;
    } else {
      analysis = `外部資源整合策略對${companyContext}具中度可行性，可快速補強內部能力不足。外部合作成本相對可控，風險分散效果佳。合作模式具彈性，可依需求調整合作深度與範圍。成功關鍵在於合作夥伴評選與關係管理，建立互信基礎與有效溝通機制，確保合作效益最大化。`;
    }
  } else if (elements.includes('流程')) {
    if (categoryName.includes('效率') && !isRisk) {
      analysis = `流程改善策略最適合把握效率提升機會，因為${companyContext}可透過內部流程優化直接改善營運效率，投資成本低且效益持續。流程改善具高度客製化特性，可完全符合企業需求。相較於外部解決方案，內部流程改善更具持續性與可控性。實施風險低，主要為變革管理挑戰。成功關鍵在於員工參與與持續改善機制，確保流程優化效果可持續發揮。`;
    } else if (categoryName.includes('風險') && isRisk) {
      analysis = `流程控制策略適合應對管理風險，因為${companyContext}可透過制度建立與流程標準化降低人為風險。流程改善成本低且可逐步實施，風險控制效果明確。相較於技術方案，流程控制更注重人員執行與制度落實。實施關鍵在於流程設計合理性與執行力確保，建立監控機制與持續改善文化，確保風險控制效果。`;
    } else {
      analysis = `流程改善策略對${companyContext}具高度可行性，主要依賴內部資源與管理能力。流程優化投資門檻低，可彈性調整實施範圍與進度。改善效益可持續發揮，且具累積效果。成功關鍵在於變革管理與員工參與，建立持續改善機制與績效評估制度，確保流程改善帶來實質效益。`;
    }
  } else {
    analysis = `${strategyName}對${companyContext}的可行性需依具體策略內容與企業資源條件評估。一般而言，策略選擇應考量投資能力、執行難度、效益大小與風險程度等因素。建議採用多元評估標準，包含財務可行性、技術可行性與營運可行性，確保策略選擇符合企業現況與發展目標。實施時應建立階段性目標與檢核機制，確保策略執行效果符合預期。`;
  }
  
  return analysis;
};

const generateKPIImpact = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string
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
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string
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
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string
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
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string
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

const generateAnalysisMethodology = (
  isRisk: boolean,
  categoryName: string,
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string
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
  subcategoryName: string,
  strategyName: string,
  companyContext: string,
  elements: string[],
  scenarioDescription: string
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
- 機會成本：內部人力投入其他專案的潛在收益

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
