
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
      companySize 
    } = await req.json();

    const cacheKey = `${categoryType}_${categoryName}_${subcategoryName}_${industry}_${companySize}`;

    console.log('查詢策略快取:', { categoryType, categoryName, subcategoryName, industry, companySize });

    // 首先檢查快取表中是否已有數據
    const { data: cachedData, error: cacheError } = await supabase
      .from('tcfd_strategy_cache')
      .select('strategies')
      .eq('cache_key', cacheKey)
      .single();

    if (cachedData && !cacheError) {
      console.log('找到快取策略');
      return new Response(JSON.stringify({ 
        success: true, 
        strategies: cachedData.strategies,
        source: 'cache'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('快取未找到，開始生成新策略');

    // 如果沒有快取，生成新的策略
    const strategies = await generateStrategiesWithLLM(
      categoryType, 
      categoryName, 
      subcategoryName, 
      industry, 
      companySize
    );

    if (strategies) {
      // 儲存到快取表
      const { error: insertError } = await supabase
        .from('tcfd_strategy_cache')
        .insert({
          cache_key: cacheKey,
          category_type: categoryType,
          category_name: categoryName,
          subcategory_name: subcategoryName,
          industry: industry,
          company_size: companySize,
          strategies: strategies
        });

      if (insertError) {
        console.error('儲存快取失敗:', insertError);
      } else {
        console.log('策略已儲存到快取');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        strategies: strategies,
        source: 'generated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('策略生成失敗');

  } catch (error) {
    console.error('策略快取API錯誤:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateStrategiesWithLLM(
  categoryType: string,
  categoryName: string,
  subcategoryName: string,
  industry: string,
  companySize: string
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

  // 生成情境描述
  const scenarioDescription = generateScenarioDescription(
    categoryType, 
    categoryName, 
    subcategoryName, 
    industryText, 
    sizeText
  );

  const strategiesSection = categoryType === 'risk' ? 
    `"risk_strategies": {
      "mitigate": {
        "title": "減緩策略",
        "description": "針對「${subcategoryName}」風險的具體減緩措施，考慮${sizeText}在${industryText}的實際能力和特性（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "cost_estimate": "實施成本估算（依企業規模調整）",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該情境的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_effect": "針對該特定風險的預期效果描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      },
      "transfer": {
        "title": "轉移策略",
        "description": "針對「${subcategoryName}」風險的具體轉移作法，適合${sizeText}在${industryText}的應用（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "cost_estimate": "實施成本估算",
        "feasibility_score": 1-5,
        "feasibility_reason":  "針對該情境的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_effect": "針對該特定風險的預期效果描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      },
      "accept": {
        "title": "接受策略",
        "description": "針對「${subcategoryName}」風險的具體接受作法，考慮${sizeText}的風險承受能力（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "cost_estimate": "實施成本估算",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該情境的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_effect": "針對該特定風險的預期效果描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      },
      "control": {
        "title": "控制策略",
        "description": "針對「${subcategoryName}」風險的具體控制作法，適合${industryText}的監控與管理機制（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "cost_estimate": "實施成本估算",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該情境的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_effect": "針對該特定風險的預期效果描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      }
    }` :
    `"opportunity_strategies": {
      "evaluate_explore": {
        "title": "評估探索策略",
        "description": "針對「${subcategoryName}」機會的具體評估探索作法，適合${sizeText}在${industryText}的應用（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "investment_estimate": "投資成本估算（依企業規模調整）",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_benefits": "針對該特定機會的預期效益描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      },
      "capability_building": {
        "title": "能力建設策略",
        "description": "針對「${subcategoryName}」機會的具體能力建設作法，考慮${sizeText}的資源配置（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "investment_estimate": "投資成本估算",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_benefits": "針對該特定機會的預期效益描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      },
      "business_transformation": {
        "title": "商業轉換策略",
        "description": "針對「${subcategoryName}」機會的具體商業轉換作法，適合${industryText}的轉型路徑（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "investment_estimate": "投資成本估算",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_benefits": "針對該特定機會的預期效益描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      },
      "cooperation_participation": {
        "title": "合作參與策略",
        "description": "針對「${subcategoryName}」機會的具體合作參與作法，考慮${sizeText}的合作能力（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "investment_estimate": "投資成本估算",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_benefits": "針對該特定機會的預期效益描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      },
      "aggressive_investment": {
        "title": "積極投入策略",
        "description": "針對「${subcategoryName}」機會的具體積極投入作法，適合有充足資源的${sizeText}（150-200字）",
        "specific_actions": ["具體行動1", "具體行動2", "具體行動3", "具體行動4"],
        "investment_estimate": "投資成本估算",
        "feasibility_score": 1-5,
        "feasibility_reason": "針對該機會的可行性評分理由（80字內）",
        "implementation_timeline": "預估實施時間",
        "expected_benefits": "針對該特定機會的預期效益描述",
        "key_success_factors": ["成功關鍵因素1", "成功關鍵因素2", "成功關鍵因素3"]
      }
    }`;

  const systemPrompt = `你是一位專精於氣候風險管理、財務分析和策略規劃的 TCFD 專業顧問。請根據具體的風險/機會情境、企業規模、產業特性提供量身定制的管理策略建議。每個策略都必須針對該特定情境設計，而非通用模板。`;

  const prompt = `針對以下${categoryType === 'risk' ? '風險' : '機會'}情境，請提供專屬且完整的管理策略建議：

情境分類: ${categoryName} - ${subcategoryName}
情境描述: ${scenarioDescription}
產業: ${industryText}
企業規模: ${sizeText}

請按照以下 JSON 格式提供詳細回應，所有策略內容都必須針對「${subcategoryName}」這個特定情境以及${sizeText}在${industryText}的特性量身定制：

{
  "scenario_summary": "一句話概括「${subcategoryName}」情境的背景與${categoryType === 'risk' ? '風險' : '機會'}重點（80字內）",
  ${strategiesSection}
}

重要要求：
1. 所有策略建議必須針對「${subcategoryName}」這個具體情境
2. 充分考慮${sizeText}在${industryText}的實際執行能力和資源限制
3. 策略內容要具體實用，提供可執行的行動方案
4. 所有內容專業且實用，符合 TCFD 報告標準

請直接提供 JSON 格式的回應：`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 請求失敗: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return JSON.parse(generatedContent);
  } catch (error) {
    console.error('LLM策略生成失敗:', error);
    throw error;
  }
}

function generateScenarioDescription(
  categoryType: string,
  categoryName: string,
  subcategoryName: string,
  industryText: string,
  sizeText: string
): string {
  const isRisk = categoryType === 'risk';

  if (isRisk && categoryName.includes('政策')) {
    return `${sizeText}在${industryText}面臨政策法規趨嚴的轉型壓力，特別是${subcategoryName}相關要求將直接影響營運合規成本。監管機構逐步提高環境標準，企業需投入資源進行制度調整與技術升級。法規遵循失敗將面臨罰款風險，同時可能影響客戶信任度與市場競爭力。合規成本上升將壓縮獲利空間，需要重新評估營運模式的可持續性。此情境要求企業在成本控制與風險管理間找到平衡點，制定前瞻性的應對策略以維持營運穩定性。`;
  }

  if (!isRisk && categoryName.includes('市場')) {
    return `${sizeText}在${industryText}正面臨市場需求轉向永續產品服務的機會窗口，${subcategoryName}相關需求快速成長為新的營收來源。消費者環保意識提升促使採購決策改變，願意為永續價值支付溢價。競爭對手積極布局永續市場，搶佔先機者將獲得品牌差異化優勢。此機會窗口具有時效性，延遲進入將錯失市場定位良機。企業需要快速建立永續能力與產品組合，才能有效轉換市場機會為實際營收成長動能。`;
  }

  return `${sizeText}在${industryText}面向遭遇${categoryName}相關的${subcategoryName}挑戰，需要建立系統性應對機制。此情境將對企業營運模式產生結構性影響，需要跨部門協調與資源重新配置。管理團隊必須在短期成本投入與長期競爭力維持間做出平衡決策。延遲應對將增加後續調整的複雜度與成本，主動因應則有機會轉危為安並建立競爭優勢。企業應制定階段性目標與執行計畫，確保在變動環境中維持營運韌性與持續發展能力。`;
}
