
-- Allow anonymous users to also submit activities
DROP POLICY IF EXISTS "Authenticated users can submit activities" ON public.activities;
CREATE POLICY "Anyone can submit activities"
  ON public.activities
  FOR INSERT
  TO public
  WITH CHECK (true);
