
-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing document chunks and embeddings
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_name TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX ON public.document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Create index for document lookup
CREATE INDEX ON public.document_chunks (document_name);

-- Enable RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing chunks
CREATE POLICY "Anyone can view document chunks" 
  ON public.document_chunks 
  FOR SELECT 
  USING (true);

-- Create policy for inserting chunks (admin only)
CREATE POLICY "Admins can insert document chunks" 
  ON public.document_chunks 
  FOR INSERT 
  WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create policy for updating chunks (admin only)
CREATE POLICY "Admins can update document chunks" 
  ON public.document_chunks 
  FOR UPDATE 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create policy for deleting chunks (admin only)
CREATE POLICY "Admins can delete document chunks" 
  ON public.document_chunks 
  FOR DELETE 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Create table for tracking document processing status
CREATE TABLE public.document_processing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  chunks_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for processing table
ALTER TABLE public.document_processing ENABLE ROW LEVEL SECURITY;

-- Create policies for processing table
CREATE POLICY "Anyone can view processing status" 
  ON public.document_processing 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage processing status" 
  ON public.document_processing 
  FOR ALL 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));
