-- Add student_name column to anxious_summaries table
ALTER TABLE public.anxious_summaries ADD COLUMN student_name TEXT;

-- Update existing records to copy user to student_name if needed
UPDATE public.anxious_summaries 
SET student_name = user 
WHERE student_name IS NULL AND user IS NOT NULL;
