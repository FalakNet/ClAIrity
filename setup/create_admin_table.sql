-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create RLS policies for the admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view the admin users table
CREATE POLICY "Admins can view admin users" 
ON public.admin_users
FOR SELECT 
TO authenticated
USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Only allow super admins to insert new admins (you'll need to handle this logic in your app)
CREATE POLICY "Admins can insert new admin users" 
ON public.admin_users
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Only allow admins to update their own records
CREATE POLICY "Admins can update their own records" 
ON public.admin_users
FOR UPDATE 
TO authenticated
USING (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
) 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.admin_users)
);

-- Create an is_admin function for easy checking in other policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add an admin user (replace with your user ID)
-- INSERT INTO public.admin_users (user_id) VALUES ('your-user-id-here');
