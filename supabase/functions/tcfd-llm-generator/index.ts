
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, categoryType, categoryName, subcategoryName, industry, scenarioDescription, userScore } = await req.json();

    console.log('Request type:', type);
    console.log('Request data:', { categoryType, categoryName, subcategoryName, industry, scenarioDescription, userScore });

    let prompt = '';
    let systemPrompt = '';

    if (type === 'scenario') {
      // 情境生成 Prompt
      systemPrompt = `你是一位熟悉氣候相關財務揭露（TCFD）的專業顧問。請根據 TCFD 官方框架，為特定產業生成具體且實用的氣候情境描述。`;
      
      prompt = `請為以下條件生成一個具體的氣候${categoryType === 'risk' ? '風險' : '機會'}情境描述：

類型: ${categoryType === 'risk' ? '風險' : '機會'}
分類: ${categoryName}
子分類: ${subcategoryName}
產業: ${industry}

請生成一段 100-150 字的具體情境描述，需要：
1. 符合 TCFD 框架要求
2. 針對${industry}的實際營運情況
3. 描述具體的氣候變化如何影響業務運作
4. 語氣專業中立，避免過度誇大或輕描淡寫
5. 包含可能的時間框架和影響範圍

請直接提供情境描述內容，不需要額外說明：`;

    } else if (type === 'strategy') {
      // 策略與財務分析生成 Prompt
      systemPrompt = `你是一位專精於氣候風險管理和財務影響分析的 TCFD 顧問。請根據情境描述和影響評分，提供詳細的財務影響分析和策略建議。`;
      
      prompt = `針對以下風險/機會情境，請提供詳細的策略與財務分析：

情境描述: ${scenarioDescription}
影響評分: ${userScore}/3 分（${userScore === 3 ? '高度影響' : userScore === 2 ? '中度影響' : '輕度影響'}）
產業: ${industry}

請按照以下 JSON 格式提供回應：
{
  "detailed_description": "對該情境的深入分析說明（150-200字）",
  "financial_impact_pnl": "對損益表的具體影響分析（80-100字）",
  "financial_impact_cashflow": "對現金流的影響分析（80-100字）",
  "financial_impact_balance_sheet": "對資產負債表的影響分析（80-100字）",
  "strategy_avoid": "避免策略的具體作法與預期效益（100字左右）",
  "strategy_mitigate": "減緩策略的具體作法與預期效益（100字左右）",
  "strategy_transfer": "轉移策略的具體作法與預期效益（100字左右）",
  "strategy_accept": "承擔策略的具體作法與預期效益（100字左右）"
}

請確保：
1. 所有建議具體可行，適合${industry}
2. 財務影響分析要具體量化或描述影響程度
3. 每種策略都要包含具體的執行方式和預期成效
4. 語氣專業，符合 TCFD 報告標準

請直接提供 JSON 格式的回應：`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API request failed:', response.status, response.statusText);
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = data.choices[0].message.content;

    if (type === 'strategy') {
      try {
        // 嘗試解析 JSON 回應
        const parsedContent = JSON.parse(generatedContent);
        return new Response(JSON.stringify({ 
          success: true, 
          content: parsedContent 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        // 如果無法解析 JSON，返回錯誤
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to parse strategy analysis response',
          raw_content: generatedContent
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // 情境生成直接返回文字內容
      return new Response(JSON.stringify({ 
        success: true, 
        content: generatedContent 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in tcfd-llm-generator function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
