
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

const defaultQuestions = [
    '如何制定企業減碳目標？',
    '碳費計算方式是什麼？',
    '自願性碳權有哪些類型？',
    '範疇三排放如何盤查？',
    'SBTi目標設定流程？',
    '碳中和與淨零的差別？'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Fetch recent document chunks from the database
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('chunk_text')
      .order('created_at', { ascending: false })
      .limit(10);

    if (chunksError) throw chunksError;

    if (!chunks || chunks.length === 0) {
      // If no documents, return default questions
      return new Response(JSON.stringify({ questions: defaultQuestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Prepare the context for OpenAI
    const context = chunks.map(chunk => chunk.chunk_text).join('\n\n---\n\n');

    // 3. Create a prompt to generate questions
    const systemPrompt = `你是一個聰明的助理，你的任務是根據提供的文件內容，生成 6 個簡潔、相關且適合初學者的常見問題。
你的目標是幫助使用者快速了解文件的核心主題。
請只回傳一個 JSON 物件，格式如下：{ "questions": ["問題一", "問題二", ...] }。不要包含任何其他的文字或解釋。`;

    // 4. Call OpenAI API
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
          { role: 'user', content: `這是文件內容的摘錄，請基於此生成問題：\n\n${context}` }
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('OpenAI API Error:', errorBody);
        throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error("Invalid response structure from OpenAI");
    }

    const jsonResponse = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ questions: jsonResponse.questions || defaultQuestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating quick questions:', error);
    return new Response(JSON.stringify({ questions: defaultQuestions }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
