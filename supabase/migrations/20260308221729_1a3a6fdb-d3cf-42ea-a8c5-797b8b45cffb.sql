
CREATE TABLE public.crawler_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  hidden boolean NOT NULL DEFAULT false,
  paused_until timestamp with time zone DEFAULT NULL,
  title_override text DEFAULT NULL,
  description_override text DEFAULT NULL,
  age_override text DEFAULT NULL,
  district_override text DEFAULT NULL,
  notes text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.crawler_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage overrides"
  ON public.crawler_overrides
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read overrides"
  ON public.crawler_overrides
  FOR SELECT
  TO anon, authenticated
  USING (true);
