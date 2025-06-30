import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, ...params } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let result;
    
    switch (type) {
      case 'generate_scenario_description':
        result = await generateScenarioDescription(params, openaiApiKey);
        break;
      case 'comprehensive_scenario_analysis':
        result = await generateComprehensiveScenarioAnalysis(params, openaiApiKey);
        break;
      case 'generate_financial_analysis':
        result = await generateFinancialAnalysis(params, openaiApiKey);
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateFinancialAnalysis(params: any, openaiApiKey: string) {
  const {
    categoryType,
    categoryName,
    subcategoryName,
    scenarioDescription,
    selectedStrategy,
    strategyName,
    companyProfile,
    userNotes
  } = params;

  const systemPrompt = `你是一位專精於TCFD氣候風險財務分析的專業顧問，具備深厚的財務分析、風險管理和策略規劃經驗。請為企業提供針對特定策略的詳細財務影響分析。`;

  const prompt = `請為以下企業策略提供詳細的財務影響分析，分析內容需要具體、實用且符合台灣企業實況：

企業背景：
- 產業：${companyProfile.industryText}
- 企業規模：${companyProfile.sizeText}企業
- 營運簡述：${companyProfile.businessDescription || '未提供'}
- 是否有碳盤查：${companyProfile.hasCarbonInventory ? '是' : '否'}
- 是否有國際業務：${companyProfile.hasInternationalOperations ? '是' : '否'}
- 年營收規模：${companyProfile.annualRevenueRange || '未提供'}
- 主要排放源：${companyProfile.mainEmissionSource || '未提供'}

情境分析：
- ${categoryType === 'risk' ? '風險' : '機會'}類別：${categoryName}
- 子類別：${subcategoryName}
- 具體情境：${scenarioDescription}
- 選擇策略：${strategyName}

${userNotes ? `企業補充說明：${userNotes}` : ''}

請提供以下四個面向的詳細分析，每個面向約60-80字，總計250-350字：

1. **財務影響概述**：簡要說明此策略對企業整體財務結構的影響

2. **損益表影響評估**：分析對營收、成本、利潤的具體影響，包含數字估算

3. **現金流與資本配置**：評估現金流變化、投資需求及資金管理建議

4. **資產負債結構調整**：說明對企業資產配置、負債結構的影響

5. **策略執行可行性與建議**：提供3-4個具體實施建議

要求：
- 內容必須針對「${subcategoryName}」情境和「${strategyName}」策略量身定制
- 充分考慮${companyProfile.sizeText}在${companyProfile.industryText}的實際執行能力
- 提供具體的數字估算和時間框架
- 語言專業但易懂，適合企業管理層閱讀
- 使用繁體中文

請直接提供分析內容，格式為完整的段落文字，不需要JSON格式。`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const analysisContent = data.choices[0]?.message?.content?.trim();

  if (!analysisContent) {
    throw new Error('無法生成財務分析');
  }

  return { analysis: analysisContent };
}

async function generateScenarioDescription(params: any, openaiApiKey: string) {
  const {
    category_type,
    category_name,
    subcategory_name,
    industry,
    company_size,
    business_description,
    has_carbon_inventory,
    has_international_operations,
    annual_revenue_range,
    main_emission_source
  } = params;

  const companySizeMap: {[key: string]: string} = {
    'small': '小型企業（50人以下）',
    'medium': '中型企業（50-250人）',
    'large': '大型企業（250人以上）'
  };

  const industryMap: {[key: string]: string} = {
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

  const prompt = `
作為TCFD氣候風險評估專家，請為以下企業生成一個具體的${category_type === 'risk' ? '氣候風險' : '氣候機會'}情境描述：

企業背景：
- 產業：${industryMap[industry] || industry}
- 企業規模：${companySizeMap[company_size] || company_size}
- 業務描述：${business_description || '未提供'}
- 是否有碳盤查：${has_carbon_inventory ? '是' : '否'}
- 是否有國際業務：${has_international_operations ? '是' : '否'}
- 年營收規模：${annual_revenue_range || '未提供'}
- 主要排放源：${main_emission_source || '未提供'}

${category_type === 'risk' ? '風險' : '機會'}類別：${category_name}
子類別：${subcategory_name || ''}

請生成一個100-150字的情境描述，要求：
1. 貼近該企業的實際營運情況
2. 模擬企業可能面臨的具體${category_type === 'risk' ? '風險' : '機會'}情境
3. 描述要具體、可行，能讓企業管理層理解
4. 使用繁體中文
5. 避免過於技術性的術語

請直接提供情境描述，不要包含其他說明文字。
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是專業的TCFD氣候風險評估顧問，擅長為不同產業企業設計貼近實際的氣候情境。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const scenarioDescription = data.choices[0]?.message?.content?.trim();

  if (!scenarioDescription) {
    throw new Error('無法生成情境描述');
  }

  return { scenario_description: scenarioDescription };
}

async function generateComprehensiveScenarioAnalysis(params: any, openaiApiKey: string) {
  const {
    categoryType,
    categoryName,
    subcategoryName,
    scenarioDescription,
    userScore,
    industry,
    companySize,
    businessDescription,
    userCustomInputs
  } = params;

  const prompt = `
  作為 TCFD 氣候風險評估專家，請為以下企業生成一份綜合情境分析，包括潛在的財務影響和可行的策略建議。

  企業背景：
  - 產業：${industry}
  - 企業規模：${companySize}
  - 業務描述：${businessDescription || '未提供'}

  情境描述：${scenarioDescription}
  使用者評分：${userScore} (1-5分，分數越高表示情境越可能發生)

  風險/機會類別：${categoryName}
  子類別：${subcategoryName || '未提供'}

  請生成一份詳細的分析報告，包含以下內容：
  1. 情境摘要：簡要概述所評估的情境。
  2. 財務影響分析：
     - 損益表影響：描述情境對企業損益表的潛在影響，包括收入、成本和利潤。
     - 現金流量影響：描述情境對企業現金流量的潛在影響，包括營運、投資和融資活動。
     - 資產負債表影響：描述情境對企業資產負債表的潛在影響，包括資產、負債和權益。
  3. 策略建議：
     - 針對風險情境：
       - 避免策略：描述避免風險發生的策略。
       - 轉移策略：描述將風險轉移給第三方的策略。
       - 減輕策略：描述減輕風險影響的策略。
       - 接受策略：描述接受風險並為其後果做準備的策略。
     - 針對機會情境：
       - 探索策略：描述探索和評估機會的策略。
       - 建設策略：描述建立能力和資源來把握機會的策略。
       - 轉換策略：描述改變業務模式或流程來利用機會的策略。
       - 合作策略：描述與夥伴合作共同把握機會的策略。
       - 投入策略：描述投入資源來實現機會價值的策略。

  報告要求：
  - 語言：繁體中文
  - 風格：專業、簡潔、重點突出
  - 長度：500-800字
  - 避免使用過於技術性的術語

  請直接提供分析報告，不要包含其他說明文字。
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '你是專業的 TCFD 氣候風險評估顧問，擅長為不同產業企業設計貼近實際的氣候情境，並提供可行的策略建議。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const analysis = data.choices[0]?.message?.content?.trim();

  if (!analysis) {
    throw new Error('無法生成綜合情境分析');
  }

  // 解析 LLM 回應
  const parsedAnalysis = parseLLMResponse(analysis);

  return parsedAnalysis;
}

function parseLLMResponse(analysis: string) {
  const sections = analysis.split('\n\n');

  const scenario_summary = sections.find(section => section.startsWith('情境摘要'))?.split('：')[1]?.trim() || '';

  const financial_impact_section = sections.find(section => section.startsWith('財務影響分析'));
  const financial_impact = financial_impact_section ? parseFinancialImpact(financial_impact_section) : null;

  const strategy_section = sections.find(section => section.startsWith('策略建議'));
  const { risk_strategies, opportunity_strategies } = strategy_section ? parseStrategies(strategy_section) : { risk_strategies: null, opportunity_strategies: null };

  return {
    scenario_summary,
    financial_impact,
    risk_strategies,
    opportunity_strategies
  };
}

function parseFinancialImpact(financialImpactSection: string) {
  const impacts = financialImpactSection.split('\n').filter(line => line.includes('影響：'));

  const profit_loss = impacts.find(line => line.includes('損益表影響')) ? parseImpactDetails(impacts.find(line => line.includes('損益表影響'))!) : null;
  const cash_flow = impacts.find(line => line.includes('現金流量影響')) ? parseImpactDetails(impacts.find(line => line.includes('現金流量影響'))!) : null;
  const balance_sheet = impacts.find(line => line.includes('資產負債表影響')) ? parseImpactDetails(impacts.find(line => line.includes('資產負債表影響'))!) : null;

  return {
    profit_loss,
    cash_flow,
    balance_sheet
  };
}

function parseImpactDetails(impactLine: string) {
  const description = impactLine.split('：')[1]?.trim() || '';
  const impact_direction = extractDetail(impactLine, '影響方向');
  const amount_estimate = extractDetail(impactLine, '金額估計');
  const timeframe = extractDetail(impactLine, '時間範圍');
  const key_items = extractKeyItems(impactLine);

  return {
    description,
    impact_direction,
    amount_estimate,
    timeframe,
    key_items
  };
}

function extractDetail(impactLine: string, label: string) {
  const regex = new RegExp(`${label}：(.*?)(?=[；;]|$)`);
  const match = impactLine.match(regex);
  return match ? match[1]?.trim() : '';
}

function extractKeyItems(impactLine: string) {
  const regex = /主要影響項目：(.*?)$/;
  const match = impactLine.match(regex);
  return match ? match[1]?.split(/、|，/).map(item => item.trim()) : [];
}

function parseStrategies(strategySection: string) {
  const strategies = strategySection.split('\n').filter(line => line.includes('策略：') && !line.startsWith('策略建議'));

  const riskStrategies: { [key: string]: any } = {};
  const opportunityStrategies: { [key: string]: any } = {};

  strategies.forEach(strategyLine => {
    const [type, ...rest] = strategyLine.split('策略：');
    const strategyDetails = rest.join('策略：').trim();

    if (type.includes('針對風險情境')) {
      const strategyType = strategyDetails.split('：')[0].trim();
      const strategyDescription = strategyDetails.split('：')[1].trim();
      riskStrategies[strategyType] = { description: strategyDescription };
    } else if (type.includes('針對機會情境')) {
      const strategyType = strategyDetails.split('：')[0].trim();
      const strategyDescription = strategyDetails.split('：')[1].trim();
      opportunityStrategies[strategyType] = { description: strategyDescription };
    }
  });

  return {
    risk_strategies: Object.keys(riskStrategies).length > 0 ? riskStrategies : null,
    opportunity_strategies: Object.keys(opportunityStrategies).length > 0 ? opportunityStrategies : null
  };
}
