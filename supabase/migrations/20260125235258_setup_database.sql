-- Plants table
CREATE TABLE plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_name TEXT NOT NULL,
  species_name TEXT,
  species_common_name TEXT,
  location TEXT NOT NULL,
  light_type TEXT CHECK (light_type IN ('direct', 'indirect', 'low')),
  proximity_to_window TEXT CHECK (proximity_to_window IN ('on_sill', 'near', 'far')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plant photos table
CREATE TABLE plant_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  check_in_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responses JSONB NOT NULL,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plant identifications table
CREATE TABLE plant_identifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  identified_species TEXT,
  confidence_score FLOAT,
  ai_provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  plants_count INTEGER DEFAULT 0,
  ai_ids_used_this_month INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_identifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Plants policies
CREATE POLICY "Users can view their own plants"
  ON plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plants"
  ON plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON plants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON plants FOR DELETE
  USING (auth.uid() = user_id);

-- Plant photos policies
CREATE POLICY "Users can view photos of their plants"
  ON plant_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_photos.plant_id
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos for their plants"
  ON plant_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_photos.plant_id
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos of their plants"
  ON plant_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_photos.plant_id
      AND plants.user_id = auth.uid()
    )
  );

-- Check-ins policies
CREATE POLICY "Users can view check-ins for their plants"
  ON check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = check_ins.plant_id
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert check-ins for their plants"
  ON check_ins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = check_ins.plant_id
      AND plants.user_id = auth.uid()
    )
  );

-- Plant identifications policies
CREATE POLICY "Users can view identifications for their plants"
  ON plant_identifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_identifications.plant_id
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert identifications for their plants"
  ON plant_identifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM plants
      WHERE plants.id = plant_identifications.plant_id
      AND plants.user_id = auth.uid()
    )
  );

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update plants_count
CREATE OR REPLACE FUNCTION public.update_plants_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE user_profiles
    SET plants_count = plants_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE user_profiles
    SET plants_count = plants_count - 1
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update plants count
CREATE TRIGGER on_plant_change
  AFTER INSERT OR DELETE ON plants
  FOR EACH ROW EXECUTE FUNCTION public.update_plants_count();
