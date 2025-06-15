
-- Create the documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  true, 
  52428800, -- 50MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf'];

-- Drop the old policy if it exists, to avoid errors on re-run
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create a policy that allows all operations on the documents bucket
CREATE POLICY "Public Access"
ON storage.objects FOR ALL
USING (bucket_id = 'documents');
