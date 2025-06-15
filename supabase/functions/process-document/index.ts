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

// Simple PDF text extraction (basic implementation)
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  // This is a simplified implementation
  // In production, you might want to use a more robust PDF parser
  const text = new TextDecoder().decode(fileBuffer);
  // Basic text extraction - remove binary data and keep readable text
  return text.replace(/[^\x20-\x7E\u4e00-\u9fff]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Split text into chunks with overlap
function chunkText(text: string, chunkSize: number = 600, overlap: number = 100): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[。！？\n]/);
  
  let currentChunk = '';
  let currentSize = 0;
  
  for (const sentence of sentences) {
    if (currentSize + sentence.length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      // Keep overlap
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 10));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
      currentSize = currentChunk.length;
    } else {
      currentChunk += sentence + '。';
      currentSize = currentChunk.length;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.filter(chunk => chunk.length > 50); // Filter out very short chunks
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentName } = await req.json();
    
    console.log(`Processing document: ${documentName}`);

    // Update processing status
    await supabase
      .from('document_processing')
      .upsert({
        document_name: documentName,
        status: 'processing',
        updated_at: new Date().toISOString()
      });

    // Get file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(documentName);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text from PDF
    const fileBuffer = await fileData.arrayBuffer();
    const text = await extractTextFromPDF(fileBuffer);
    
    if (!text || text.length < 100) {
      throw new Error('No readable text found in document');
    }

    console.log(`Extracted text length: ${text.length}`);

    // Split into chunks
    const chunks = chunkText(text);
    console.log(`Created ${chunks.length} chunks`);

    // Delete existing chunks for this document
    await supabase
      .from('document_chunks')
      .delete()
      .eq('document_name', documentName);

    // Process chunks and generate embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      
      try {
        const embedding = await generateEmbedding(chunk);
        
        await supabase
          .from('document_chunks')
          .insert({
            document_name: documentName,
            chunk_text: chunk,
            chunk_index: i,
            embedding: JSON.stringify(embedding)
          });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
      }
    }

    // Update processing status to completed
    await supabase
      .from('document_processing')
      .update({
        status: 'completed',
        chunks_count: chunks.length,
        updated_at: new Date().toISOString()
      })
      .eq('document_name', documentName);

    console.log(`Document processing completed: ${documentName}`);

    return new Response(JSON.stringify({ 
      success: true, 
      chunks_count: chunks.length,
      message: 'Document processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    
    const { documentName } = await req.json().catch(() => ({}));
    if (documentName) {
      await supabase
        .from('document_processing')
        .update({
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('document_name', documentName);
    }

    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
