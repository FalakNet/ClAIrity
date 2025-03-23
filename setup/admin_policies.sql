-- Grant admin access to anxious_summaries table
CREATE POLICY "Admins can access all anxious summaries" 
ON public.anxious_summaries
FOR ALL 
TO authenticated
USING (
  public.is_admin()
);

-- Grant admin access to happiness_index table
CREATE POLICY "Admins can access happiness index" 
ON public.happiness_index
FOR ALL 
TO authenticated
USING (
  public.is_admin()
);

-- If you need admin access to read auth.users, you'll need to use the service role
-- since RLS can't be applied directly to auth schema tables
