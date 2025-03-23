-- Create table for storing chat summaries
CREATE TABLE IF NOT EXISTS chat_summaries (
    id SERIAL PRIMARY KEY, -- Auto-incrementing ID for each record
    user_id TEXT NOT NULL, -- User identifier (can be guest or authenticated user)
    summary TEXT NOT NULL, -- Summary of the chat
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of when the summary was created
);

-- Add an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_id ON chat_summaries (user_id);

-- Create table for storing active chats
CREATE TABLE IF NOT EXISTS active_chats (
    user_id TEXT PRIMARY KEY, -- User identifier (unique per user)
    messages JSONB NOT NULL, -- Active chat messages in JSON format
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Last updated timestamp
);

DROP TABLE IF EXISTS anxious_summaries;

CREATE TABLE anxious_summaries (
    id SERIAL PRIMARY KEY,
    user_input TEXT NOT NULL,
    ai_output TEXT NOT NULL,
    severity TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for storing monthly happiness indices
CREATE TABLE IF NOT EXISTS happiness_index (
    id SERIAL PRIMARY KEY,
    month INTEGER NOT NULL, -- Month number (1-12)
    year INTEGER NOT NULL, -- Year (e.g., 2023)
    index_value DECIMAL(4,1) NOT NULL, -- The happiness index value
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a unique constraint to prevent duplicate entries for the same month/year
CREATE UNIQUE INDEX IF NOT EXISTS idx_happiness_month_year ON happiness_index (month, year);