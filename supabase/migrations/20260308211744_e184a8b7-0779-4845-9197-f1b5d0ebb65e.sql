-- Allow authenticated users to insert new activities (community submissions)
CREATE POLICY "Authenticated users can submit activities"
ON public.activities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add submitted_by column to track who submitted
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;