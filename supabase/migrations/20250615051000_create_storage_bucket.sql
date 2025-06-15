
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Create policy for uploading files (admin only)
CREATE POLICY "Admins can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'documents' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- Create policy for viewing files (public access)
CREATE POLICY "Anyone can view documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

-- Create policy for deleting files (admin only)
CREATE POLICY "Admins can delete documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'documents' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- Create policy for updating files (admin only)
CREATE POLICY "Admins can update documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'documents' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);
