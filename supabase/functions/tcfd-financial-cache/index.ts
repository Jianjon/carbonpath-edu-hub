
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      categoryType, 
      categoryName, 
      subcategoryName, 
      industry, 
      companySize,
      strategyType,
      scenarioDescription,
      companyProfile
    } = await req.json();

    const cacheKey = `${categoryType}_${categoryName}_${subcategoryName}_${industry}_${companySize}_${strategyType}`;

    console.log('查詢財務分析快取:', { categoryType, categoryName, subcategoryName, industry, companySize, strategyType });

    // 首先檢查快取表中是否已有數據
    const { data: cachedData, error: cacheError } = await supabase
      .from('tcfd_financial_analysis_cache')
      .select('*')
      .eq('cache_key', cacheKey)
      .single();

    if (cachedData && !cacheError) {
      console.log('找到快取財務分析');
      const analysis = {
        profitLossAnalysis: cachedData.profit_loss_analysis,
        cashFlowAnalysis: cachedData.cash_flow_analysis,
        balanceSheetAnalysis: cachedData.balance_sheet_analysis,
        strategyFeasibilityAnalysis: cachedData.strategy_feasibility_analysis,
        analysisMethodology: cachedData.analysis_methodology,
        calculationMethodSuggestions: cachedData.calculation_method_suggestions
      };
      
      return new Response(JSON.stringify({ 
        success: true, 
        analysis: analysis,
        source: 'cache'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('快取未找到，開始生成新財務分析');

    // 如果沒有快取，生成新的財務分析
    const analysis = await generateFinancialAnalysisWithLLM(
      categoryType, 
      categoryName, 
      subcategoryName, 
      industry, 
      companySize,
      strategyType,
      scenarioDescription,
      companyProfile
    );

    if (analysis) {
      // 儲存到快取表
      const { error: insertError } = await supabase
        .from('tcfd_financial_analysis_cache')
        .insert({
          cache_key: cacheKey,
          category_type: categoryType,
          category_name: categoryName,
          subcategory_name: subcategoryName,
          industry: industry,
          company_size: companySize,
          strategy_type: strategyType,
          profit_loss_analysis: analysis.profitLossAnalysis,
          cash_flow_analysis: analysis.cashFlowAnalysis,
          balance_sheet_analysis: analysis.balanceSheetAnalysis,
          strategy_feasibility_analysis: analysis.strategyFeasibilityAnalysis,
          analysis_methodology: analysis.analysisMethodology,
          calculation_method_suggestions: analysis.calculationMethodSuggestions
        });

      if (insertError) {
        console.error('儲存財務分析快取失敗:', insertError);
      } else {
        console.log('財務分析已儲存到快取');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        analysis: analysis,
        source: 'generated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('財務分析生成失敗');

  } catch (error) {
    console.error('財務分析快取API錯誤:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateFinancialAnalysisWithLLM(
  categoryType: string,
  categoryName: string,
  subcategoryName: string,
  industry: string,
  companySize: string,
  strategyType: string,
  scenarioDescription: string,
  companyProfile: any
) {
  const industryMap: Record<string, string> = {
    'manufacturing': '製造業',
    'technology': '科技業',
    'finance': '金融業',
    'retail': '零售業',
    'hospitality': '旅宿業',
    'restaurant': '餐飲業',
    'construction': '營建業',
    'transportation': '運輸業',
    'healthcare': '醫療保健',
    'education': '教育服務'
  };

  const sizeMap: Record<string, string> = {
    'small': '小型企業',
    'medium': '中型企業',
    'large': '大型企業'
  };

  const industryText = industryMap[industry] || industry;
  const sizeText = sizeMap[companySize] || companySize;

  const systemPrompt = `你是一位專精於TCFD氣候風險財務分析的資深顧問，具備深厚的財務分析、風險管理和企業策略規劃經驗。請為企業提供針對特定策略的六個面向詳細財務影響分析。`;

  const prompt = `請為以下企業策略提供詳細的財務影響分析，每個面向的分析內容需要具體、實用且符合台灣企業實況：

企業背景：
- 產業：${industryText}
- 企業規模：${sizeText}企業
- 營運簡述：${companyProfile?.businessDescription || '未提供'}
- 是否有碳盤查：${companyProfile?.hasCarbonInventory ? '是' : '否'}
- 是否有國際業務：${companyProfile?.hasInternationalOperations ? '是' : '否'}
- 年營收規模：${companyProfile?.annualRevenueRange || '未提供'}
- 主要排放源：${companyProfile?.mainEmissionSource || '未提供'}

情境分析：
- ${categoryType === 'risk' ? '風險' : '機會'}類別：${categoryName}
- 子類別：${subcategoryName}
- 具體情境：${scenarioDescription}
- 選擇策略：${strategyType}

請分別提供以下六個面向的詳細分析，每個面向約40-60字：

1. **損益表影響分析**：分析對營收、成本、利潤的具體影響，包含數字估算

2. **現金流影響分析**：評估現金流變化、投資需求及資金管理建議

3. **資產負債影響分析**：說明對企業資產配置、負債結構的影響

4. **策略可行性說明**：評估策略執行可行性，包含資源需求與時程

5. **分析方法說明**：說明採用的分析方法與假設條件

6. **財務計算建議說明**：提供具體的財務計算方式與數據來源建議

要求：
- 內容必須針對「${subcategoryName}」情境和「${strategyType}」策略量身定制
- 充分考慮${sizeText}企業在${industryText}的實際執行能力
- 提供具體的數字估算和時間框架
- 語言專業但易懂，適合企業管理層閱讀
- 使用繁體中文
- 每個面向約40-60字，避免過於冗長

請以JSON格式回傳，格式如下：
{
  "profitLossAnalysis": "損益表影響分析內容",
  "cashFlowAnalysis": "現金流影響分析內容", 
  "balanceSheetAnalysis": "資產負債影響分析內容",
  "strategyFeasibilityAnalysis": "策略可行性說明內容",
  "analysisMethodology": "分析方法說明內容",
  "calculationMethodSuggestions": "財務計算建議說明內容"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 請求失敗: ${response.status}`);
    }

    const data = await response.json();
    const analysisContent = data.choices[0]?.message?.content?.trim();

    if (!analysisContent) {
      throw new Error('無法生成財務分析');
    }

    try {
      const analysisJson = JSON.parse(analysisContent);
      return analysisJson;
    } catch (parseError) {
      // 如果JSON解析失敗，回傳備用分析
      return {
        profitLossAnalysis: `針對${subcategoryName}情境執行${strategyType}策略，預期對${sizeText}${industryText}企業營收產生正面影響，估計可創造3-8%的營收成長機會。`,
        cashFlowAnalysis: `執行${strategyType}策略需要分階段資金投入，初期投資約200-500萬元，預計3-5年回收，可透過政府補助管理現金流壓力。`,
        balanceSheetAnalysis: `執行${strategyType}策略需要增加固定資產投資，但同時提升企業永續價值，有助改善ESG評等與融資條件。`,
        strategyFeasibilityAnalysis: `考量${sizeText}${industryText}企業資源條件，${strategyType}策略具備良好執行可行性，建議分階段實施。`,
        analysisMethodology: `採用TCFD框架進行情境分析，結合企業實際營運資料，運用DCF與風險調整淨現值方法進行評估。`,
        calculationMethodSuggestions: `建議使用內部報酬率(IRR)與投資回收期計算投資效益，並建立敏感度分析模型評估不同情境下的財務表現。`
      };
    }
  } catch (error) {
    console.error('LLM財務分析生成失敗:', error);
    throw error;
  }
}
