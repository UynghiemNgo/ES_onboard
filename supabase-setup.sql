-- =============================================
-- EarthSama Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Access codes table
CREATE TABLE access_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  assigned_to text,
  used_by uuid REFERENCES auth.users(id),
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2. User profiles (linked to Supabase Auth)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  access_code text REFERENCES access_codes(code),
  role text DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at timestamptz DEFAULT now()
);

-- 3. Land submissions
CREATE TABLE submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Owner info
  full_name text NOT NULL,
  email text,
  phone text,
  -- Land details
  land_title text,
  land_type text,
  acreage numeric,
  current_use text,
  -- Location
  region text,
  province text,
  municipality text,
  barangay text,
  lat numeric,
  lng numeric,
  polygon jsonb,
  -- Status
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'in_discussion', 'approved', 'needs_docs')),
  admin_notes text,
  -- Entity
  entity_type text,
  entity_name text,
  -- Tracking
  tracking_code text UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 8)),
  -- Meta
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  submitted_by uuid REFERENCES auth.users(id)
);

-- 4. Insert the 25 access codes
INSERT INTO access_codes (code, assigned_to) VALUES
  ('ES-U2RVT3', 'Uynghiem Ngo'),
  ('ES-RZKMKP', NULL),
  ('ES-LIZGPW', NULL),
  ('ES-EWS99B', NULL),
  ('ES-LIQ82U', NULL),
  ('ES-9WCHOH', NULL),
  ('ES-XMUCX1', NULL),
  ('ES-3LK5KF', NULL),
  ('ES-BH6E5Q', NULL),
  ('ES-6FZEKK', NULL),
  ('ES-4G6IEV', NULL),
  ('ES-T7JVR1', NULL),
  ('ES-DD1A5L', NULL),
  ('ES-56A555', NULL),
  ('ES-O8UMWA', NULL),
  ('ES-XS6NRV', NULL),
  ('ES-ZN5GKB', NULL),
  ('ES-N3IZH2', NULL),
  ('ES-MON47P', NULL),
  ('ES-JAZF7M', NULL),
  ('ES-FRP11A', NULL),
  ('ES-HEDQUM', NULL),
  ('ES-QXH8R2', NULL),
  ('ES-NUHXJ6', NULL),
  ('ES-VSM1RE', NULL);

-- 5. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Auto-update updated_at on submissions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 8. Public lookup function — status only, no sensitive data
CREATE OR REPLACE FUNCTION lookup_submission(p_tracking_code text, p_email text)
RETURNS TABLE (
  id uuid,
  tracking_code text,
  status text,
  submitted_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.tracking_code, s.status, s.submitted_at, s.updated_at
  FROM submissions s
  WHERE upper(s.tracking_code) = upper(p_tracking_code)
    AND lower(s.email) = lower(p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Edit token for re-edit access (sent via link)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS edit_token text UNIQUE DEFAULT upper(substr(md5(random()::text || clock_timestamp()::text), 1, 12));

-- Public function to load submission for editing (by edit token)
CREATE OR REPLACE FUNCTION get_submission_for_edit(p_edit_token text)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  land_title text,
  land_type text,
  acreage numeric,
  current_use text,
  region text,
  province text,
  municipality text,
  barangay text,
  lat numeric,
  lng numeric,
  polygon jsonb,
  entity_type text,
  entity_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.full_name, s.email, s.phone, s.land_title, s.land_type,
         s.acreage, s.current_use, s.region, s.province, s.municipality,
         s.barangay, s.lat, s.lng, s.polygon, s.entity_type, s.entity_name
  FROM submissions s
  WHERE upper(s.edit_token) = upper(p_edit_token);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public function to save edits (by edit token)
CREATE OR REPLACE FUNCTION update_submission_by_token(
  p_edit_token text,
  p_full_name text,
  p_email text,
  p_phone text,
  p_land_title text,
  p_land_type text,
  p_acreage numeric,
  p_current_use text,
  p_region text,
  p_province text,
  p_municipality text,
  p_barangay text,
  p_lat numeric,
  p_lng numeric,
  p_polygon jsonb,
  p_entity_type text,
  p_entity_name text
) RETURNS boolean AS $$
BEGIN
  UPDATE submissions SET
    full_name = p_full_name,
    email = p_email,
    phone = p_phone,
    land_title = p_land_title,
    land_type = p_land_type,
    acreage = p_acreage,
    current_use = p_current_use,
    region = p_region,
    province = p_province,
    municipality = p_municipality,
    barangay = p_barangay,
    lat = p_lat,
    lng = p_lng,
    polygon = p_polygon,
    entity_type = p_entity_type,
    entity_name = p_entity_name
  WHERE upper(edit_token) = upper(p_edit_token);
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a submission (public form, no login needed)
CREATE POLICY "Anyone can submit land" ON submissions
  FOR INSERT WITH CHECK (true);

-- Code holders (admin) can read ALL submissions
CREATE POLICY "Code holders can read submissions" ON submissions
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE access_code IS NOT NULL)
  );

-- Only users who have claimed an access code can update submissions
CREATE POLICY "Code holders can update submissions" ON submissions
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE access_code IS NOT NULL)
  );

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (to link access code)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Authenticated users can check if an access code exists (for validation)
CREATE POLICY "Authenticated can read access codes" ON access_codes
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated users can claim an unclaimed access code
CREATE POLICY "Authenticated users can claim codes" ON access_codes
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND used_by IS NULL
  );
