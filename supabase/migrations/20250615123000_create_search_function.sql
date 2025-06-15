
-- Create the search function for vector similarity search
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
