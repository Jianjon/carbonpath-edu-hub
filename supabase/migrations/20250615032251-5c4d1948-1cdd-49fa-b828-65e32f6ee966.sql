
-- Create RLS policies for the documents bucket
create policy "Admins can upload documents."
  on storage.objects for insert to authenticated with check (
    bucket_id = 'documents' and
    (select is_admin from public.profiles where id = auth.uid())
  );

create policy "Admins can view all documents."
  on storage.objects for select to authenticated using (
    bucket_id = 'documents' and
    (select is_admin from public.profiles where id = auth.uid())
  );

create policy "Admins can delete documents."
  on storage.objects for delete to authenticated using (
    bucket_id = 'documents' and
    (select is_admin from public.profiles where id = auth.uid())
  );
