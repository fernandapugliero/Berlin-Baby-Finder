-- Kindercafés / KidsCorner venues table
CREATE TABLE public.kindercafes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text,
  district public.berlin_district NOT NULL,
  latitude double precision,
  longitude double precision,
  website_url text,
  google_maps_url text,
  image_url text,
  features text[] DEFAULT '{}',
  is_approved boolean NOT NULL DEFAULT false,
  is_sponsored boolean NOT NULL DEFAULT false,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kindercafes ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved kindercafes
CREATE POLICY "Anyone can view approved kindercafes"
ON public.kindercafes FOR SELECT
USING (is_approved = true);

-- Admins can manage all
CREATE POLICY "Admins can manage kindercafes"
ON public.kindercafes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can submit
CREATE POLICY "Users can submit kindercafes"
ON public.kindercafes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Storage bucket for kindercafe photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('kindercafe-photos', 'kindercafe-photos', true);

-- Anyone can view photos
CREATE POLICY "Public read kindercafe photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'kindercafe-photos');

-- Authenticated users can upload photos
CREATE POLICY "Auth users upload kindercafe photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kindercafe-photos');

-- Admins can delete photos
CREATE POLICY "Admins delete kindercafe photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'kindercafe-photos' AND public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_kindercafes_updated_at
  BEFORE UPDATE ON public.kindercafes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();