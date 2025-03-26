-- REMOVE AND RECREATE THE TABLE COMPLETELY
-- Drop the existing table if it exists 
DROP TABLE IF EXISTS mind_states;

-- Create a clean table with no foreign key constraints
CREATE TABLE mind_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT to avoid implicit references
  user_name TEXT NOT NULL,
  user_class TEXT,
  feeling TEXT NOT NULL,
  feeling_descriptions TEXT[] NOT NULL,
  impact_factors TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security completely for now
ALTER TABLE mind_states DISABLE ROW LEVEL SECURITY;

-- Add a comment to explain this is temporary
COMMENT ON TABLE mind_states IS 'MindState entries from users - RLS temporarily disabled for debugging';
