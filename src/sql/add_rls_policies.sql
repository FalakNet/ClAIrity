-- This script adds Row Level Security policies to protect user data

-- Enable RLS on the table
ALTER TABLE public.anxious_summaries ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view only their own entries
CREATE POLICY "Users can view their own entries" 
ON public.anxious_summaries
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  -- You can add a condition here to allow admin users to see all entries
  -- For example: exists(select 1 from admin_users where user_id = auth.uid())
  FALSE
);

-- Policy to allow users to insert their own entries
CREATE POLICY "Users can insert their own entries" 
ON public.anxious_summaries
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- If you want admin users to see all data, you can add this policy
CREATE POLICY "Admins can view all entries" 
ON public.anxious_summaries
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);
