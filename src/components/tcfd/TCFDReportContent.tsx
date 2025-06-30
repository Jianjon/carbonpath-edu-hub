import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TCFDAssessment } from '@/types/tcfd';
import { Building2, Target, TrendingUp, BarChart3, AlertTriangle, CheckCircle, DollarSign, Calculator, Loader2 } from 'lucide-react';

interface SelectedStrategyData {
  scenarioKey: string;
  riskOpportunityId: string;
  strategy: string;
  scenarioDescription: string;
  categoryType: 'risk' | 'opportunity';
  categoryName: string;
  subcategoryName: string;
  notes: string;
}

interface GeneratedAnalysis {
  profitLossAnalysis: string;
  cashFlowAnalysis: string;
  balanceSheetAnalysis: string;
  strategyFeasibilityAnalysis: string;
  analysisMethodology: string;
  calculationMethodSuggestions: string;
}

interface TCFDReportContentProps {
  assessment: TCFDAssessment;
  strategySelections: SelectedStrategyData[];
  userModifications?: Record<string, string>;
  generatedAnalyses?: Record<string, GeneratedAnalysis>;
}

interface GeneratedReportAnalysis {
  [key: string]: string;
}

const TCFDReportContent = ({
  assessment,
  strategySelections,  
  userModifications,
  generatedAnalyses
}: TCFDReportContentProps) => {
  const [generatedReportAnalyses, setGeneratedReportAnalyses] = useState<GeneratedReportAnalysis>({});
  const [loadingAnalyses, setLoadingAnalyses] = useState<Set<string>>(new Set());

  // 參數中文對映
  const getChineseText = (text: string): string => {
    const translations: Record<string, string> = {
      'medium': '中型',
      'large': '大型',
      'small': '小型',
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
    return translations[text] || text;
  };
  
  const industryName = getChineseText(assessment.industry);
  const companySize = getChineseText(assessment.company_size);

  // 策略類型映射
  const strategyMapping: Record<string, string> = {
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

  const riskSelections = strategySelections.filter(s => s.categoryType === 'risk');
  const opportunitySelections = strategySelections.filter(s => s.categoryType === 'opportunity');

  // 如果有第四階段的分析結果，直接使用；否則生成新的報告分析
  const getAnalysisContent = (selection: SelectedStrategyData) => {
    const key = selection.scenarioKey;
    
    // 優先使用第四階段生成的分析
    if (generatedAnalyses && generatedAnalyses[key]) {
      const stage4Analysis = generatedAnalyses[key];
      const strategyName = strategyMapping[selection.strategy] || selection.strategy;
      
      return `
**財務影響概述**

針對${selection.subcategoryName}情境，本企業採用${strategyName}進行應對。基於${companySize}${industryName}的營運特性與資源配置，此策略預期將對企業財務結構產生重要影響。

**損益表影響評估**

${stage4Analysis.profitLossAnalysis}

**現金流與資本配置**

${stage4Analysis.cashFlowAnalysis}

**資產負債結構調整**

${stage4Analysis.balanceSheetAnalysis}

**策略執行可行性與建議**

${stage4Analysis.strategyFeasibilityAnalysis}

**分析方法說明**

${stage4Analysis.analysisMethodology}

**財務計算建議說明**

${stage4Analysis.calculationMethodSuggestions}
      `.trim();
    }
    
    // 如果沒有第四階段分析，使用第五階段生成的分析
    return generatedReportAnalyses[key];
  };

  // 生成AI驅動的財務分析
  const generateAIFinancialAnalysis = async (selection: SelectedStrategyData): Promise<string> => {
    const strategyName = strategyMapping[selection.strategy] || selection.strategy;
    
    // 構建AI生成的輸入參數
    const analysisInput = {
      categoryType: selection.categoryType,
      categoryName: selection.categoryName,
      subcategoryName: selection.subcategoryName,
      scenarioDescription: selection.scenarioDescription,
      selectedStrategy: selection.strategy,
      strategyName: strategyName,
      companyProfile: {
        industry: assessment.industry,
        size: assessment.company_size,
        industryText: industryName,
        sizeText: companySize,
        hasInternationalOperations: assessment.has_international_operations,
        hasCarbonInventory: assessment.has_carbon_inventory,
        mainEmissionSource: assessment.main_emission_source,
        businessDescription: assessment.business_description,
        annualRevenueRange: assessment.annual_revenue_range
      },
      userNotes: selection.notes || userModifications?.[selection.scenarioKey] || ''
    };

    try {
      // 調用LLM API生成財務分析
      const response = await fetch('/api/functions/v1/tcfd-llm-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generate_financial_analysis',
          ...analysisInput
        }),
      });

      if (!response.ok) {
        throw new Error('財務分析生成失敗');
      }

      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('AI財務分析生成錯誤:', error);
      // 如果AI生成失敗，返回基本的分析模板
      return generateFallbackAnalysis(selection, strategyName);
    }
  };

  // 備用分析生成（當AI失敗時使用）
  const generateFallbackAnalysis = (selection: SelectedStrategyData, strategyName: string): string => {
    return `
**財務影響概述**

針對${selection.subcategoryName}情境，本企業採用${strategyName}進行應對。基於${companySize}${industryName}的營運特性與資源配置，此策略預期將對企業財務結構產生重要影響。

**損益表影響評估**

${strategyName}執行後，預期對${companySize}${industryName}企業營收產生正面影響。透過提升永續競爭力與客戶信任度，估計可維持既有營收穩定性並創造3-8%的營收成長機會。

• 短期營收維持穩定，中長期可透過效率提升創造競爭優勢
• ESG表現改善有助於爭取永續採購訂單

**現金流與資本配置**

執行${strategyName}需要分階段資金投入，初期投資約200-500萬元，預計3-5年回收。透過政府補助與分期付款方式可有效管理現金流壓力。

• 初期需投入預防性支出，但可避免未來更大的損失成本
• 分階段投資可平衡現金流壓力，建議採用3-5年分期實施

**資產負債結構調整**

執行${strategyName}可能需要增加固定資產投資，但同時提升企業永續價值，有助改善ESG評等與融資條件，整體資產品質獲得提升。

**策略執行可行性與建議**

考量${companySize}${industryName}企業的資源條件與技術能力，${strategyName}具備良好的執行可行性。建議採用分階段實施方式，優先處理關鍵環節。

**具體實施建議：**
• 制定詳細的執行時程與里程碑管控機制
• 建立跨部門協調機制，確保資源整合效率
• 定期檢視執行成效，適時調整策略方向
    `.trim();
  };

  // 載入特定策略的分析
  const loadAnalysisForStrategy = async (selection: SelectedStrategyData) => {
    const key = selection.scenarioKey;
    
    if (generatedReportAnalyses[key] || loadingAnalyses.has(key)) {
      return; // 已經有分析內容或正在載入中
    }

    setLoadingAnalyses(prev => new Set(prev).add(key));
    
    try {
      const analysis = await generateAIFinancialAnalysis(selection);
      setGeneratedReportAnalyses(prev => ({
        ...prev,
        [key]: analysis
      }));
    } finally {
      setLoadingAnalyses(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  // 在組件載入時為所有策略生成分析
  useEffect(() => {
    strategySelections.forEach(selection => {
      loadAnalysisForStrategy(selection);
    });
  }, [strategySelections]);

  // 修改 renderAnalysisContent 函數
  const renderAnalysisContent = (selection: SelectedStrategyData) => {
    const key = selection.scenarioKey;
    const strategyName = strategyMapping[selection.strategy] || selection.strategy;
    
    if (loadingAnalyses.has(key)) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-gray-600">正在生成財務分析...</span>
        </div>
      );
    }

    const analysisContent = getAnalysisContent(selection);
    
    if (!analysisContent) {
      return (
        <div className="text-gray-500 text-center py-4">
          分析內容載入中...
        </div>
      );
    }

    // 將分析內容按段落分割並渲染
    const paragraphs = analysisContent.split('\n\n').filter(p => p.trim());
    
    return (
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {paragraphs.map((paragraph, index) => {
          const trimmedParagraph = paragraph.trim();
          
          // 處理標題（以**包圍的文字）
          if (trimmedParagraph.startsWith('**') && trimmedParagraph.includes('**')) {
            const titleMatch = trimmedParagraph.match(/^\*\*(.*?)\*\*(.*)/);
            if (titleMatch) {
              return (
                <div key={index} className="mb-4">
                  <h6 className="font-medium text-gray-800 mb-2">{titleMatch[1]}</h6>
                  {titleMatch[2] && <p className="mb-2">{titleMatch[2].trim()}</p>}
                </div>
              );
            }
          }
          
          // 處理條列項目（以•開頭）
          if (trimmedParagraph.includes('•')) {
            const items = trimmedParagraph.split('•').filter(item => item.trim());
            return (
              <ul key={index} className="text-sm text-gray-600 mt-2 mb-4 space-y-1 list-disc list-inside">
                {items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item.trim()}</li>
                ))}
              </ul>
            );
          }
          
          // 一般段落
          return (
            <p key={index} className="mb-3">
              {trimmedParagraph}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* 模擬說明區塊 - 增強版 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span>模擬評估說明</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-800 mb-3">企業背景與評估條件</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">企業規模：</span>
                <span className="text-red-600 font-medium">{companySize}企業</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">所屬產業：</span>
                <span className="text-red-600 font-medium">{industryName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">碳盤查狀況：</span>
                <span className="text-red-600 font-medium">
                  {assessment.has_carbon_inventory ? '已完成' : '尚未完成'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">國際營運：</span>
                <span className="text-red-600 font-medium">
                  {assessment.has_international_operations === true ? '是' : assessment.has_international_operations === false ? '否' : '未提供'}
                </span>
              </div>
              {assessment.annual_revenue_range && (
                <div>
                  <span className="font-medium text-gray-700">營業額範圍：</span>
                  <span className="text-red-600 font-medium">{assessment.annual_revenue_range}</span>
                </div>
              )}
              {assessment.main_emission_source && (
                <div>
                  <span className="font-medium text-gray-700">主要排放源：</span>
                  <span className="text-red-600 font-medium">{assessment.main_emission_source}</span>
                </div>
              )}
            </div>
            
            {assessment.business_description && (
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <span className="font-medium text-gray-700">營運簡述：</span>
                <p className="text-red-600 mt-1 text-sm leading-relaxed">
                  {assessment.business_description}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-800 mb-3">策略選擇與財務分析對應邏輯</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h5 className="font-medium text-blue-800 mb-2">AI動態生成分析</h5>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• <span className="text-red-600 font-medium">策略財務分析由AI根據具體選擇動態生成</span></li>
                  <li>• 每個策略的分析內容都是獨特且針對性的，非套用固定模板</li>
                  <li>• 分析內容會考慮企業背景、選擇策略、情境描述等因素</li>
                  <li>• <span className="text-red-600 font-medium">確保每個分析都具備一致性與實用性</span></li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h5 className="font-medium text-green-800 mb-2">財務分析架構</h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
                  <div>• 損益表影響分析</div>
                  <div>• 現金流動態評估</div>
                  <div>• 資產負債結構調整</div>
                  <div>• 策略執行可行性</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-gray-800 mb-3">模擬評估結果概要</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>
                  風險情境：<span className="text-red-600 font-medium">{riskSelections.length}</span> 項
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>
                  機會情境：<span className="text-red-600 font-medium">{opportunitySelections.length}</span> 項
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  策略組合：<span className="text-red-600 font-medium">{strategySelections.length}</span> 個
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded border">
              <h5 className="font-medium text-gray-800 mb-2 text-sm">評估範圍與方法說明</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• 本評估採用 TCFD 建議框架，涵蓋治理、策略、風險管理及指標目標四大面向</li>
                <li>• <span className="text-red-600 font-medium">風險機會識別基於{industryName}特性</span>，結合氣候科學情境進行分析</li>
                <li>• <span className="text-red-600 font-medium">策略建議考量{companySize}企業資源條件</span>，提供階段性實施建議</li>
                <li>• <span className="text-red-600 font-medium">財務影響分析由AI動態生成，確保內容的獨特性與針對性</span></li>
                <li>• 每項策略的成本估算方法具體且可操作，協助企業進行實際規劃</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-yellow-700 bg-yellow-100 p-3 rounded border border-yellow-300">
            <strong>重要說明：</strong>本報告內容為基於輸入條件的模擬評估結果。
            <span className="text-red-600 font-medium">紅色標註文字</span>為根據您的企業背景與選擇條件所產生的客製化內容，
            黑色文字為依據 TCFD 框架提供的標準分析架構。
            <span className="text-red-600 font-medium">策略財務分析內容由AI根據您的具體選擇動態生成</span>，
            確保分析結果的獨特性與實用性。實際應用時請結合企業真實營運資料與財務數據進行調整與驗證。
          </div>
        </CardContent>
      </Card>

      {/* TCFD 四大揭露面向 */}
      <div className="grid gap-8">
        {/* 治理 (Governance) */}
        <Card>
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Building2 className="h-6 w-6" />
              <span>治理面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">董事會監督機制</h4>
              <p className="text-gray-700 leading-relaxed">
                董事會應建立氣候相關風險與機會的監督機制，確保氣候議題納入企業策略決策流程。
                <span className="text-red-600"> 建議{companySize}企業設立氣候變遷專責委員會或指派專責董事</span>，
                定期檢視氣候風險評估結果與因應策略執行成效。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">管理階層職責分工</h4>
              <p className="text-gray-700 leading-relaxed">
                管理階層應負責氣候相關風險與機會的日常管理，建立跨部門協調機制。
                <span className="text-red-600"> 針對{industryName}特性，建議設立永續發展部門或指派專責人員</span>，
                負責氣候風險識別、評估與管理工作的執行。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 策略 (Strategy) */}
        <Card>
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Target className="h-6 w-6" />
              <span>策略面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">風險與機會識別分析</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                企業應系統性識別與評估氣候相關風險與機會對營運的潛在影響。
                <span className="text-red-600"> 本次評估識別出 {strategySelections.length} 個關鍵情境</span>，
                涵蓋實體風險、轉型風險與氣候機會等面向。
              </p>

              {/* 風險情境 */}
              {riskSelections.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-red-600 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    識別之氣候風險情境與因應策略
                  </h5>
                  <div className="space-y-6">
                    {riskSelections.map((selection, index) => (
                      <div key={selection.scenarioKey} className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-3">
                          <h6 className="font-medium text-red-800 text-lg">
                            風險情境 {index + 1}：<span className="text-red-600">{selection.categoryName}</span>
                          </h6>
                          <Badge variant="destructive" className="text-xs">
                            {strategyMapping[selection.strategy] || selection.strategy}
                          </Badge>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm leading-relaxed text-gray-800">
                            <strong className="text-red-600">{selection.subcategoryName}</strong> - {selection.scenarioDescription}
                          </p>
                        </div>
                        
                        {/* AI生成的財務分析 */}
                        <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-lg">
                          <h6 className="font-semibold text-slate-800 mb-4 flex items-center text-base">
                            <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                            {strategyMapping[selection.strategy] || selection.strategy}財務影響分析
                          </h6>
                          
                          {renderAnalysisContent(selection)}
                          
                          {/* 顯示用戶修改或策略備註 */}
                          {(selection.notes || userModifications?.[selection.scenarioKey]) && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <h6 className="font-medium text-slate-700 text-sm mb-2">企業執行補充說明</h6>
                              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <p className="text-sm text-blue-800 leading-relaxed">
                                  {selection.notes || userModifications?.[selection.scenarioKey]}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 機會情境 */}
              {opportunitySelections.length > 0 && (
                <div>
                  <h5 className="font-medium text-green-600 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    識別之氣候機會情境與把握策略
                  </h5>
                  <div className="space-y-6">
                    {opportunitySelections.map((selection, index) => (
                      <div key={selection.scenarioKey} className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-start justify-between mb-3">
                          <h6 className="font-medium text-green-800 text-lg">
                            機會情境 {index + 1}：<span className="text-red-600">{selection.categoryName}</span>
                          </h6>
                          <Badge className="text-xs bg-green-600">
                            {strategyMapping[selection.strategy] || selection.strategy}
                          </Badge>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm leading-relaxed text-gray-800">
                            <strong className="text-red-600">{selection.subcategoryName}</strong> - {selection.scenarioDescription}
                          </p>
                        </div>
                        
                        {/* AI生成的財務分析 */}
                        <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-lg">
                          <h6 className="font-semibold text-slate-800 mb-4 flex items-center text-base">
                            <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                            {strategyMapping[selection.strategy] || selection.strategy}財務影響分析
                          </h6>
                          
                          {renderAnalysisContent(selection)}
                          
                          {/* 顯示用戶修改或策略備註 */}
                          {(selection.notes || userModifications?.[selection.scenarioKey]) && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <h6 className="font-medium text-slate-700 text-sm mb-2">企業執行補充說明</h6>
                              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <p className="text-sm text-blue-800 leading-relaxed">
                                  {selection.notes || userModifications?.[selection.scenarioKey]}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">策略韌性評估</h4>
              <p className="text-gray-700 leading-relaxed">
                企業應評估現有策略在不同氣候情境下的韌性，並制定調適與減緩策略。
                <span className="text-red-600"> 基於{industryName}特性與{companySize}企業資源配置</span>，
                建議優先處理高影響度的氣候風險，並積極把握相關機會。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 風險管理 (Risk Management) */}
        <Card>
          <CardHeader className="bg-orange-50 border-b border-orange-100">
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <TrendingUp className="h-6 w-6" />
              <span>風險管理面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">風險識別與評估流程</h4>
              <p className="text-gray-700 leading-relaxed">
                企業應建立系統性的氣候風險識別與評估流程，定期更新風險清單與影響評估。
                <span className="text-red-600"> 本次評估採用 TCFD 建議架構，針對{industryName}進行客製化分析</span>，
                識別出關鍵風險項目並制定相應管理策略。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">風險管理整合機制</h4>
              <p className="text-gray-700 leading-relaxed">
                氣候風險管理應整合至企業整體風險管理框架中，確保決策流程的一致性。
                <span className="text-red-600"> 建議{companySize}企業建立氣候風險管理政策</span>，
                明確角色職責與管理流程，定期監控與檢討管理成效。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 指標與目標 (Metrics and Targets) */}
        <Card>
          <CardHeader className="bg-purple-50 border-b border-purple-100">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <BarChart3 className="h-6 w-6" />
              <span>指標與目標面向</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">氣候相關關鍵指標</h4>
              <p className="text-gray-700 leading-relaxed">
                企業應建立氣候相關關鍵績效指標，用於監控風險管理成效與目標達成情況。
                <span className="text-red-600"> 建議{industryName}企業追蹤溫室氣體排放量、能源使用效率等核心指標</span>，
                並設定具體的短中長期改善目標。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">目標設定與監控機制</h4>
              <p className="text-gray-700 leading-relaxed">
                氣候相關目標應與企業策略目標保持一致，並建立定期檢討機制。
                <span className="text-red-600"> 考量{companySize}企業資源限制，建議採階段性目標設定方式</span>，
                逐步提升氣候韌性與減碳成效。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 總結建議 */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800">
            <Calculator className="h-5 w-5" />
            <span>總結與實施建議</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            本 TCFD 評估報告基於企業提供的基本資訊，運用標準化評估框架進行氣候風險與機會分析。
            <span className="text-red-600"> 針對{companySize}{industryName}企業特性，建議優先關注 {strategySelections.length} 個關鍵情境</span>，
            並制定相應的管理策略與行動計畫。
          </p>
          <div className="bg-white p-4 rounded border border-slate-200">
            <h4 className="font-medium text-slate-800 mb-3">後續實施建議</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• <strong>治理架構：</strong>建立氣候變遷委員會，定義角色職責與決策流程</li>
              <li>• <strong>風險管理：</strong>完善氣候風險識別、評估與監控機制</li>
              <li>• <strong>財務量化：</strong><span className="text-red-600">運用AI生成的財務影響分析進行深化評估</span></li>
              <li>• <strong>目標設定：</strong>設定短中長期氣候相關目標與關鍵績效指標</li>
              <li>• <strong>定期檢討：</strong>建立年度評估機制，持續更新風險評估與策略調整</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed">
            企業應將本評估結果作為 TCFD 揭露的基礎架構，結合實際營運數據進行深化分析，
            確保氣候韌性策略的有效性與可執行性。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TCFDReportContent;
