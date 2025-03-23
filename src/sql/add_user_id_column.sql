-- Add user_id column to anxious_summaries table if it doesn't already exist

-- First, check if the column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'anxious_summaries' 
    AND column_name = 'user_id'
  ) THEN
    -- Add the column
    ALTER TABLE public.anxious_summaries ADD COLUMN user_id UUID;
    
    -- Create an index for better performance
    CREATE INDEX idx_anxious_summaries_user_id ON public.anxious_summaries(user_id);
  END IF;
END $$;

-- This ensures the column exists without throwing an error if it already does
