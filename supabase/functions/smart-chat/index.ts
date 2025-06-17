
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

// 生成嵌入向量
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

// 搜尋相關文件片段
async function searchRelevantChunks(query: string, topK: number = 4): Promise<any[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const { data, error } = await supabase.rpc('search_document_chunks', {
      query_embedding: JSON.stringify(queryEmbedding),
      similarity_threshold: 0.75,
      match_count: topK
    });

    if (error) {
      console.error('Error searching chunks:', error);
      // 退回機制：獲取最新文件片段
      const { data: fallbackData } = await supabase
        .from('document_chunks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(topK);
      return fallbackData || [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchRelevantChunks:', error);
    return [];
  }
}

// 檢查問題是否與ESG/碳管理相關
function isESGRelated(query: string): boolean {
  const esgKeywords = [
    '減碳', '碳', '溫室氣體', 'ESG', '永續', '節能', '綠能', '再生能源',
    '碳足跡', '碳盤查', '碳管理', '循環經濟', '環保', '氣候', '排放',
    '永續發展', '綠色', '清潔能源', '能源效率', '碳中和', '淨零',
    '碳費', '碳稅', '碳權', '碳交易', '環境', '生態', '可持續'
  ];
  
  return esgKeywords.some(keyword => query.includes(keyword));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    console.log(`Smart Chat query: ${query}`);

    // 檢查是否為ESG相關問題
    if (!isESGRelated(query)) {
      const rejectResponse = "很抱歉，我只能回答ESG永續發展、碳管理、節能減碳等相關的專業問題。請提出與環境永續、碳管理、節能減碳相關的問題，我很樂意為您解答！";
      
      return new Response(JSON.stringify({ 
        reply: rejectResponse,
        sources_count: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. 先搜尋RAG文件
    const relevantChunks = await searchRelevantChunks(query);
    console.log(`Found ${relevantChunks.length} relevant chunks`);

    // 2. 準備內容
    const hasRelevantDocs = relevantChunks.length > 0;
    const context = relevantChunks
      .map(chunk => chunk.chunk_text)
      .join('\n\n---\n\n');

    // 3. 準備系統提示
    const systemPrompt = `你是CarbonPath的ESG智能顧問，專精於ESG永續發展、碳管理、節能減碳等領域。

你的專業範圍包括：
- 企業減碳策略與實施
- 溫室氣體盤查與管理
- 產品碳足跡計算
- 循環經濟應用
- 再生能源與節能技術
- ESG永續發展策略
- 環境法規與政策

回應原則：
1. ${hasRelevantDocs ? '優先基於提供的文件內容回答，確保準確性和專業性' : '基於專業知識提供準確的ESG和碳管理建議'}
2. 保持專業、清晰、實用的回應風格
3. 適度補充相關背景知識和實際應用建議
4. 每次回答控制在150-300字
5. 不使用Markdown格式，用換行區隔段落，用「【】」標註重點
6. 只回答ESG、永續發展、碳管理相關問題

${hasRelevantDocs ? `相關文件內容：\n${context}` : ''}

請基於專業知識和${hasRelevantDocs ? '文件內容' : '通用ESG知識'}提供有價值的回答。`;

    // 4. 調用OpenAI API
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
          ...messages.map((msg: { type: string, content: string }) => ({
            role: msg.type === 'bot' ? 'assistant' : 'user',
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 600
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

    const botResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      reply: botResponse,
      sources_count: relevantChunks.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
