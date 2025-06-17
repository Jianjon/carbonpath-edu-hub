
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ 
        questions: [
          '企業減碳策略如何制定？',
          '溫室氣體盤查的重要性為何？',
          '產品碳足跡計算方式？',
          '循環經濟如何降低碳排？',
          '再生能源的減碳效益？',
          'ESG報告書的核心要素？'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 獲取最近對話內容
    const recentMessages = messages.slice(-6);
    const conversationContext = recentMessages
      .map(msg => `${msg.type}: ${msg.content}`)
      .join('\n');

    // 創建情境化問題生成提示
    const systemPrompt = `你是ESG智能問題推薦系統，專門為ESG永續發展對話生成後續問題。

你的任務是分析對話脈絡，生成 4-6 個相關的ESG專業問題，幫助用戶深入學習。

ESG專業領域包括：
- 節能減碳策略與技術
- 溫室氣體盤查與管理  
- 產品碳足跡計算
- 循環經濟應用
- 再生能源發展
- ESG永續發展策略
- 環境法規與政策

問題生成策略：
1. **話題延續**：基於當前討論的ESG主題，生成更深入的問題
2. **橫向擴展**：提供相關但不同角度的ESG問題  
3. **實務應用**：將理論轉化為實際ESG應用場景
4. **漸進式深度**：從基礎ESG概念逐步引導到進階應用

問題類型分類：
- 🟢 節能減碳類問題
- 🔵 盤查管理類問題  
- 🟡 碳足跡類問題
- 🟣 循環經濟類問題

請分析對話內容，理解用戶的ESG學習進程和關注點，生成既相關又能引導深入學習的專業問題。
回傳格式：{ "questions": ["問題一", "問題二", ...] }`;

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
          { role: 'user', content: `ESG對話脈絡：\n${conversationContext}\n\n請基於此對話生成ESG智能後續問題。` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const jsonResponse = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ 
      questions: jsonResponse.questions || [
        '企業ESG策略如何制定？',
        '碳中和目標實現路徑？',
        '永續供應鏈管理方法？',
        'ESG風險評估與管理？',
        '綠色金融與永續投資？',
        '循環經濟商業模式？'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating contextual questions:', error);
    return new Response(JSON.stringify({ 
      questions: [
        '企業永續發展策略？',
        '碳管理系統建置？',
        'ESG績效評估方法？',
        '永續報告書撰寫？',
        '綠色轉型挑戰？',
        '淨零排放實施計畫？'
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
