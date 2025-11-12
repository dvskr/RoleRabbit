-- ============================================================
-- TASK 2.1: Install pgvector Extension
-- ============================================================
-- This SQL script installs the pgvector extension for vector similarity search
-- Run this on your PostgreSQL database (Supabase)

-- Check if pgvector is already installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Install pgvector extension
-- Note: On Supabase, this extension is usually available by default
-- If you get an error, you may need to enable it via Supabase dashboard
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Test vector functionality
-- This creates a temporary table to test vector operations
CREATE TEMP TABLE vector_test (
  id SERIAL PRIMARY KEY,
  embedding vector(1536)
);

-- Insert a test vector
INSERT INTO vector_test (embedding) 
VALUES (array_fill(0.1, ARRAY[1536])::vector);

-- Query test (cosine similarity)
SELECT id, embedding <=> array_fill(0.2, ARRAY[1536])::vector AS distance 
FROM vector_test;

-- Clean up test table
DROP TABLE vector_test;

-- Success message
SELECT 'pgvector extension installed and verified!' AS status;

