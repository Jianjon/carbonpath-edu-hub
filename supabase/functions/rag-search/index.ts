
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

// Generate embeddings using OpenAI
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

// Search for relevant document chunks
async function searchRelevantChunks(query: string, topK: number = 4): Promise<any[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  // Use SQL function for vector similarity search
  const { data, error } = await supabase.rpc('search_document_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    similarity_threshold: 0.75,
    match_count: topK
  });

  if (error) {
    console.error('Error searching chunks:', error);
    // Fallback: get most recent chunks if vector search fails
    const { data: fallbackData } = await supabase
      .from('document_chunks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(topK);
    return fallbackData || [];
  }

  return data || [];
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

    console.log(`RAG Search query: ${query}`);

    // Search for relevant document chunks
    const relevantChunks = await searchRelevantChunks(query);
    console.log(`Found ${relevantChunks.length} relevant chunks`);

    // Prepare context from relevant chunks
    const context = relevantChunks
      .map(chunk => chunk.chunk_text)
      .join('\n\n---\n\n');

    // Prepare messages for OpenAI
    const systemPrompt = `你是一位專業的節能技術助理，主要任務是根據上傳的文件（PDF 經由 RAG 處理）回答問題。

你的回應原則如下：
1. 優先使用文件內容回答問題，若有直接來自文件的段落，應加以引用或摘要。
2. 你可以適度補充常識性知識或基本定義（例如什麼是節能、什麼是空調效率），但必須回到專業內容，並鼓勵使用者深入查詢文件段落。
3. 不得進行與節能無關的閒聊、開玩笑或預測性對話（例如：問今天幾點、你喜歡什麼電影等）。
4. 回應風格需保持清晰、專業、具引導性，每次回答建議控制在100–250字，若資訊量較大，可簡要摘要並鼓勵使用者進一步查詢。
5. 若問題與文件內容無關，請適度回應常識後引導回文件內容，或說明：「這超出我的回答範圍，建議參考相關文件或提出更明確問題。」
6. 格式要求：請勿使用 Markdown 的粗體或斜體語法。請用換行來區隔段落，並可以用「【】」符號來突顯標題，例如「【這是一個標題】」。

相關文件內容：
${context || '目前沒有相關的文件內容可供參考。'}

你的目標是成為一位節能顧問，協助使用者理解文件，並進一步掌握節能技術或政策措施。`;

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
        max_tokens: 500
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
    console.error('Error in RAG search:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
