
-- Berlin districts enum
CREATE TYPE public.berlin_district AS ENUM (
  'Mitte', 'Friedrichshain-Kreuzberg', 'Pankow', 'Charlottenburg-Wilmersdorf',
  'Spandau', 'Steglitz-Zehlendorf', 'Tempelhof-Schöneberg', 'Neukölln',
  'Treptow-Köpenick', 'Marzahn-Hellersdorf', 'Lichtenberg', 'Reinickendorf'
);

-- Age range enum
CREATE TYPE public.baby_age_group AS ENUM (
  '0-6 months', '6-12 months', '1-2 years', '2-3 years', '3+ years'
);

-- Activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  address TEXT,
  district berlin_district NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  age_groups baby_age_group[] NOT NULL DEFAULT '{}',
  is_free BOOLEAN NOT NULL DEFAULT true,
  price_info TEXT,
  registration_required BOOLEAN NOT NULL DEFAULT false,
  registration_url TEXT,
  category TEXT,
  image_url TEXT,
  source TEXT,
  source_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Public can read approved activities
CREATE POLICY "Anyone can view approved activities"
  ON public.activities FOR SELECT
  USING (is_approved = true);

-- Admin role setup
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admins can do everything with activities
CREATE POLICY "Admins can manage all activities"
  ON public.activities FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can view roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for common queries
CREATE INDEX idx_activities_start_time ON public.activities (start_time);
CREATE INDEX idx_activities_district ON public.activities (district);
CREATE INDEX idx_activities_approved ON public.activities (is_approved);
