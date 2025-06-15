
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create the search function in the database
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION search_document_chunks(
          query_embedding vector(1536),
          similarity_threshold float DEFAULT 0.75,
          match_count int DEFAULT 4
        )
        RETURNS TABLE (
          id uuid,
          document_name text,
          chunk_text text,
          chunk_index int,
          similarity float
        )
        LANGUAGE sql STABLE
        AS $$
          SELECT
            id,
            document_name,
            chunk_text,
            chunk_index,
            1 - (embedding <=> query_embedding) as similarity
          FROM document_chunks
          WHERE 1 - (embedding <=> query_embedding) > similarity_threshold
          ORDER BY embedding <=> query_embedding
          LIMIT match_count;
        $$;
      `
    });

    if (error) {
      console.error('Error creating search function:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
