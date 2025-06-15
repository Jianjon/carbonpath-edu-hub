
-- Remove existing RLS policies for storage.objects
DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update documents" ON storage.objects;

-- Create new policies that allow public access
CREATE POLICY "Anyone can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can delete documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can update documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents');

-- Also remove admin restrictions from document_chunks and document_processing tables
DROP POLICY IF EXISTS "Admins can insert document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Admins can update document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Admins can delete document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Admins can manage processing status" ON public.document_processing;

-- Create new policies for public access
CREATE POLICY "Anyone can insert document chunks" 
ON public.document_chunks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update document chunks" 
ON public.document_chunks 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete document chunks" 
ON public.document_chunks 
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can manage processing status" 
ON public.document_processing 
FOR ALL 
USING (true);
