
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
      businessDescription,
      hasCarbonInventory,
      hasInternationalOperations,
      annualRevenueRange,
      mainEmissionSource
    } = await req.json();

    const cacheKey = `${categoryType}_${categoryName}_${subcategoryName}_${industry}_${companySize}`;

    console.log('查詢情境描述快取:', { categoryType, categoryName, subcategoryName, industry, companySize });

    // 首先檢查快取表中是否已有數據
    const { data: cachedData, error: cacheError } = await supabase
      .from('tcfd_scenario_cache')
      .select('scenario_description')
      .eq('cache_key', cacheKey)
      .single();

    if (cachedData && !cacheError) {
      console.log('找到快取情境描述');
      return new Response(JSON.stringify({ 
        success: true, 
        scenario_description: cachedData.scenario_description,
        source: 'cache'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('快取未找到，開始生成新情境描述');

    // 如果沒有快取，生成新的情境描述
    const scenarioDescription = await generateScenarioWithLLM(
      categoryType, 
      categoryName, 
      subcategoryName, 
      industry, 
      companySize,
      businessDescription,
      hasCarbonInventory,
      hasInternationalOperations,
      annualRevenueRange,
      mainEmissionSource
    );

    if (scenarioDescription) {
      // 儲存到快取表
      const { error: insertError } = await supabase
        .from('tcfd_scenario_cache')
        .insert({
          cache_key: cacheKey,
          category_type: categoryType,
          category_name: categoryName,
          subcategory_name: subcategoryName,
          industry: industry,
          company_size: companySize,
          scenario_description: scenarioDescription
        });

      if (insertError) {
        console.error('儲存情境描述快取失敗:', insertError);
      } else {
        console.log('情境描述已儲存到快取');
      }

      return new Response(JSON.stringify({ 
        success: true, 
        scenario_description: scenarioDescription,
        source: 'generated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('情境描述生成失敗');

  } catch (error) {
    console.error('情境描述快取API錯誤:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateScenarioWithLLM(
  categoryType: string,
  categoryName: string,
  subcategoryName: string,
  industry: string,
  companySize: string,
  businessDescription?: string,
  hasCarbonInventory?: boolean,
  hasInternationalOperations?: boolean,
  annualRevenueRange?: string,
  mainEmissionSource?: string
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

  const systemPrompt = `你是專業的TCFD氣候風險評估顧問，擅長為不同產業企業設計貼近實際的氣候情境。`;

  const prompt = `
作為TCFD氣候風險評估專家，請為以下企業生成一個具體的${categoryType === 'risk' ? '氣候風險' : '氣候機會'}情境描述：

企業背景：
- 產業：${industryText}
- 企業規模：${sizeText}
- 業務描述：${businessDescription || '未提供'}
- 是否有碳盤查：${hasCarbonInventory ? '是' : '否'}
- 是否有國際業務：${hasInternationalOperations ? '是' : '否'}
- 年營收規模：${annualRevenueRange || '未提供'}
- 主要排放源：${mainEmissionSource || '未提供'}

${categoryType === 'risk' ? '風險' : '機會'}類別：${categoryName}
子類別：${subcategoryName || ''}

請生成一個100-150字的情境描述，要求：
1. 貼近該企業的實際營運情況
2. 模擬企業可能面臨的具體${categoryType === 'risk' ? '風險' : '機會'}情境
3. 描述要具體、可行，能讓企業管理層理解
4. 使用繁體中文
5. 避免過於技術性的術語

請直接提供情境描述，不要包含其他說明文字。
`;

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
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 請求失敗: ${response.status}`);
    }

    const data = await response.json();
    const scenarioDescription = data.choices[0]?.message?.content?.trim();

    if (!scenarioDescription) {
      throw new Error('無法生成情境描述');
    }

    return scenarioDescription;
  } catch (error) {
    console.error('LLM情境描述生成失敗:', error);
    throw error;
  }
}
