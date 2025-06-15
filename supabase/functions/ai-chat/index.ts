
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 從 Supabase Secrets 安全地獲取您的 OpenAI API 金鑰
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 處理 CORS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages) {
      return new Response(JSON.stringify({ error: 'messages is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 準備發送給 OpenAI 的請求
    const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
            // 設定 AI 的角色和指示
            { 
                role: 'system', 
                content: '你是一位專業的節能技術助理，主要任務是根據上傳的文件（PDF 經由 RAG 處理）回答問題。\n\n你的回應原則如下：\n1. **優先使用文件內容回答問題**，若有直接來自文件的段落，應加以引用或摘要。\n2. **你可以適度補充常識性知識或基本定義**（例如什麼是節能、什麼是空調效率），但必須**回到專業內容**，並鼓勵使用者深入查詢文件段落。\n3. **不得進行與節能無關的閒聊、開玩笑或預測性對話**（例如：問今天幾點、你喜歡什麼電影等）。\n4. 回應風格需保持**清晰、專業、具引導性**，每次回答建議控制在**100–250字**，若資訊量較大，可簡要摘要並鼓勵使用者進一步查詢。\n5. 若問題與文件內容無關，請適度回應常識後引導回文件內容，或說明：「這超出我的回答範圍，建議參考相關文件或提出更明確問題。」\n\n你的目標是成為一位節能顧問，協助使用者理解文件，並進一步掌握節能技術或政策措施。' 
            },
            // 轉換並包含對話歷史
            ...messages.map((msg: { type: string, content: string }) => ({
                role: msg.type === 'bot' ? 'assistant' : 'user',
                content: msg.content
            }))
        ],
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.error) {
        console.error('OpenAI API Error:', data.error);
        return new Response(JSON.stringify({ error: data.error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const botResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply: botResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

