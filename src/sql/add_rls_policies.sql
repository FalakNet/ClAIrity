-- This script adds Row Level Security policies to protect user data

-- Enable RLS on the table
ALTER TABLE public.anxious_summaries ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own entries
CREATE POLICY "Users can view their own entries" 
ON public.anxious_summaries
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Policy to allow users to insert their own entries
CREATE POLICY "Users can insert their own entries" 
ON public.anxious_summaries
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);
