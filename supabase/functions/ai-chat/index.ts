
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
                content: 'You are CarbonPath, an intelligent assistant specializing in carbon reduction strategies, carbon fees, and carbon credits. Provide professional, concise, and helpful answers in Traditional Chinese. Your persona is knowledgeable and supportive.' 
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
