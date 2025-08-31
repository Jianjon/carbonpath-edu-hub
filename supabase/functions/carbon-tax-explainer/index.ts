
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey || openAIApiKey.trim() === '') {
    console.error('OPENAI_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'missing_openai_api_key' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { annualEmissions, feeRateOption, customFeeRate, reductionPercentage, hasOffset, offsetAmount, savings } = await req.json();

    const feeRate = feeRateOption === 'custom' && customFeeRate ? customFeeRate : parseInt(feeRateOption, 10);
    const reductionValue = Array.isArray(reductionPercentage) ? reductionPercentage[0] : reductionPercentage;

    const prompt = `
      你是一位專業的 ESG 與節能顧問。請根據以下碳費模擬數據，為使用者提供一段簡短（約 100-150 字）、清晰且具行動導向的總結與建議。

      回應原則：
      1. 開頭先總結節省的金額，強調減碳的效益。
      2. 點出關鍵的減碳手段（節能措施）。
      3. 如果使用者有使用碳權，可以多加鼓勵。
      4. 語氣需專業、正面且具鼓勵性。
      5. 請勿使用 Markdown 的粗體或斜體語法。請用換行來區隔段落，並可以用「【】」符號來突顯標題，例如「【您的減碳潛力分析】」。

      模擬數據如下：
      - 年排放量: ${annualEmissions?.toLocaleString()} 噸 CO₂e
      - 碳費費率: ${feeRate?.toLocaleString()} 元/噸
      - 透過節能措施減碳: ${reductionValue}%
      - 使用碳權抵繳: ${hasOffset === 'yes' ? `${offsetAmount?.toLocaleString() || 0} 噸` : '無'}
      - 預計每年可節省碳費: ${savings?.toLocaleString()} 元

      請生成您的建議。
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: '你是一位專業的 ESG 與節能顧問。' }, { role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const explanation = data.choices[0].message.content;

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in carbon-tax-explainer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
