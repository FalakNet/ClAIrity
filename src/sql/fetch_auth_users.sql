-- This script fetches all users from auth system with their UUIDs and emails

-- If you're using service role key, you can directly query the auth schema
SELECT 
  id as user_id, 
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'name' as name,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Note: This query requires service role access. Run it in the SQL editor in Supabase.
