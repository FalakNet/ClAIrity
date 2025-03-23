-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS "Admins can view all entries" ON public.anxious_summaries;

-- Create a simpler admin_users table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Disable RLS on admin_users table to avoid recursive checks
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- Create a function to check if a user is admin (without causing recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple direct check without policy recursion
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new policy for anxious_summaries that uses our function
CREATE POLICY "Users can view own entries or admins can view all" 
ON public.anxious_summaries
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR public.is_admin()
);
