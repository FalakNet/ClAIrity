-- This script updates existing anxious_summaries records with user_id values
-- based on matching email or username from auth.users

-- Update records where the user field contains an email that matches a user in auth.users
UPDATE public.anxious_summaries AS a
SET user_id = u.id
FROM auth.users AS u
WHERE 
  a.user_id IS NULL AND
  a.user = u.email;

-- Update records where the user field might contain a name that matches in metadata
UPDATE public.anxious_summaries AS a
SET user_id = u.id
FROM auth.users AS u
WHERE 
  a.user_id IS NULL AND
  (
    a.user = u.raw_user_meta_data->>'full_name' OR
    a.user = u.raw_user_meta_data->>'name'
  );

-- Finally, for any remaining records without a user_id but with the same user value,
-- we'll set them to have the same user_id (for consistency)
WITH matched_users AS (
  SELECT DISTINCT ON (user) 
    user, 
    user_id
  FROM public.anxious_summaries
  WHERE user_id IS NOT NULL
)
UPDATE public.anxious_summaries AS a
SET user_id = m.user_id
FROM matched_users AS m
WHERE 
  a.user_id IS NULL AND
  a.user = m.user;

-- Count remaining unmatched records
SELECT COUNT(*) AS unmatched_records
FROM public.anxious_summaries
WHERE user_id IS NULL;
