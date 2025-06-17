
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embeddings for RAG detection
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}

// Check if question is related to RAG content
async function checkRagRelevance(question: string): Promise<{ isRelevant: boolean; matchCount: number }> {
  try {
    const queryEmbedding = await generateEmbedding(question);
    
    const { data, error } = await supabase.rpc('search_document_chunks', {
      query_embedding: JSON.stringify(queryEmbedding),
      similarity_threshold: 0.7,
      match_count: 3
    });

    if (error) {
      console.error('Error checking RAG relevance:', error);
      return { isRelevant: false, matchCount: 0 };
    }

    return { 
      isRelevant: data && data.length > 0, 
      matchCount: data ? data.length : 0 
    };
  } catch (error) {
    console.error('Error in RAG relevance check:', error);
    return { isRelevant: false, matchCount: 0 };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, ragMode } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ 
        questions: [
          '企業有哪些常見的減碳方法？',
          '如何制定有效的減碳路徑圖？',
          '再生能源憑證(REC)如何幫助企業減碳?'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get recent conversation context (last 3-5 messages)
    const recentMessages = messages.slice(-6);
    const conversationContext = recentMessages
      .map(msg => `${msg.type}: ${msg.content}`)
      .join('\n');

    // Get the last user question for RAG relevance check
    const lastUserMessage = recentMessages
      .filter(msg => msg.type === 'user')
      .pop();

    let ragRelevance = { isRelevant: false, matchCount: 0 };
    if (lastUserMessage && !ragMode) {
      ragRelevance = await checkRagRelevance(lastUserMessage.content);
    }

    // Create context-aware prompt for question generation
    const systemPrompt = `你是一個智能問題推薦系統，專門為減碳教育對話生成後續問題。

你的任務是分析對話脈絡，生成 4-6 個相關的後續問題，幫助用戶深入學習。

問題生成策略：
1. **話題延續**：基於當前討論的主題，生成更深入的問題
2. **橫向擴展**：提供相關但不同角度的問題  
3. **實務應用**：將理論轉化為實際應用場景
4. **漸進式深度**：從基礎概念逐步引導到進階應用

問題類型標記：
- 🟢 基礎概念問題
- 🔵 進階技術問題
- ⚙️ 實務應用問題
- 📊 數據分析問題

${ragMode ? '' : ragRelevance.isRelevant ? 
  `\n**重要**：用戶的問題與已上傳的文件內容相關（匹配度：${ragRelevance.matchCount}個相關片段），請在其中1-2個問題前加上"💡建議切換到文件模式："前綴，並生成針對文件內容的深度問題。` : 
  ''
}

請分析對話內容，理解用戶的學習進程和關注點，生成既相關又能引導深入學習的問題。
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
          { role: 'user', content: `對話脈絡：\n${conversationContext}\n\n請基於此對話生成智能後續問題。` }
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
        '企業減碳有哪些具體的實施步驟？',
        '如何評估減碳措施的效益？',
        '減碳過程中常遇到哪些挑戰？'
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating contextual questions:', error);
    return new Response(JSON.stringify({ 
      questions: [
        '企業減碳策略如何制定？',
        '碳足跡計算的關鍵要素是什麼？',
        '綠色轉型對企業的影響有哪些？'
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
