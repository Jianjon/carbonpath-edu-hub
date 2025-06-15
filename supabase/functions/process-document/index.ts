
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import pdf from "npm:pdf-parse@1.1.1";
import { Buffer } from "node:buffer";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use pdf-parse to extract text from a PDF buffer
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  // pdf-parse expects a Buffer, so we convert ArrayBuffer to Buffer
  const buffer = Buffer.from(fileBuffer);
  const data = await pdf(buffer);
  return data.text;
}

// Split text into chunks with overlap
function chunkText(text: string, chunkSize: number = 1500, overlap: number = 200): string[] {
  const chunks: string[] = [];
  if (!text) {
    return chunks;
  }
  // Normalize whitespace and trim
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  let i = 0;
  while (i < normalizedText.length) {
    chunks.push(normalizedText.substring(i, i + chunkSize));
    i += chunkSize - overlap;
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
    
    if (!text || text.length < 50) {
      await supabase
        .from('document_processing')
        .update({
          status: 'failed',
          error_message: 'No readable text found in document',
          updated_at: new Date().toISOString()
        })
        .eq('document_name', documentName);
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
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        // We can decide to continue or stop on chunk error. Let's continue.
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
    
    // Check if req.json() can be parsed, otherwise documentName will be undefined.
    let documentName: string | undefined;
    try {
      const body = await req.json();
      documentName = body.documentName;
    } catch (_) {
      // Ignore parsing error if body is empty or already consumed
    }
    
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
