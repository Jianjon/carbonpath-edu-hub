
-- Step 1: Drop insecure public access policies

-- Drop policies on storage.objects
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;

-- Drop policies on document_chunks
DROP POLICY IF EXISTS "Anyone can insert document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Anyone can update document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Anyone can delete document chunks" ON public.document_chunks;

-- Drop policies on document_processing
DROP POLICY IF EXISTS "Anyone can manage processing status" ON public.document_processing;


-- Step 2: Re-create secure, admin-only RLS policies

-- Policies for storage.objects in the 'documents' bucket
CREATE POLICY "Admins can upload documents"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'documents' AND
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT TO authenticated USING (
    bucket_id = 'documents' AND
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'documents' AND
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );
  
CREATE POLICY "Admins can update documents"
  ON storage.objects FOR UPDATE TO authenticated USING (
    bucket_id = 'documents' AND
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
  );

-- Policies for document_chunks (securing mutations)
CREATE POLICY "Admins can insert document chunks" 
  ON public.document_chunks FOR INSERT WITH CHECK ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update document chunks" 
  ON public.document_chunks FOR UPDATE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can delete document chunks" 
  ON public.document_chunks FOR DELETE USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

-- Policies for document_processing (securing all actions for admins)
CREATE POLICY "Admins can manage processing status" 
  ON public.document_processing FOR ALL USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

