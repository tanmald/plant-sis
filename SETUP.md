# PlantSis Setup Guide

## ✅ Phase 1: Foundation & Setup - COMPLETE!

You now have a fully configured React + TypeScript + Tailwind CSS PWA foundation!

### What's Been Set Up

1. **Project Structure**
   - Vite build system with React and TypeScript
   - Tailwind CSS for styling
   - PWA plugin with service worker configuration
   - Organized folder structure for scalability

2. **Routing & Pages**
   - Welcome screen with brand messaging
   - Login and Signup pages
   - Home page (plant list)
   - Profile page
   - Placeholder pages for AddPlant, PlantDetail, CheckIn

3. **Authentication**
   - Supabase client configured
   - Auth context and hooks
   - Protected route system
   - Session persistence

4. **Design System**
   - Brand colors defined
   - Custom Tailwind utilities
   - Reusable button and input styles
   - Mobile-first responsive design

5. **Developer Tools**
   - Git repository initialized
   - TypeScript configuration
   - ESLint for code quality
   - Build scripts configured

---

## 🚀 Next Step: Phase 2 - Supabase Setup

To continue development, you need to:

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign up (free tier)
2. Click "New Project"
3. Fill in:
   - **Project name**: `plant-sis`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to you
4. Click "Create new project" (takes ~2 minutes)

### 2. Get Your API Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon)
2. Click on **API** in the sidebar
3. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### 3. Update Environment Variables

Edit `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run this script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plants table
CREATE TABLE plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table
CREATE TABLE check_ins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,
  check_in_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responses JSONB NOT NULL,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plant identifications table
CREATE TABLE plant_identifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
```

### 5. Set Up Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Name: `plant-photos`
4. Make it **Public** (so users can view their photos)
5. Click "Create bucket"

6. Add storage policy:
   - Click on the bucket → "Policies" tab
   - Click "New Policy"
   - Select "Custom policy"
   - Add this:

```sql
-- Allow users to upload photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'plant-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'plant-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'plant-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 6. Test the App

```bash
npm run dev
```

Open http://localhost:5173

You should now be able to:
- ✅ See the Welcome screen
- ✅ Create an account (Signup)
- ✅ Log in
- ✅ See the Home screen (empty state)
- ✅ Navigate to Profile

---

## 📱 Test on Mobile

1. Find your computer's local IP:
   ```bash
   # On macOS
   ipconfig getifaddr en0

   # On Linux
   hostname -I
   ```

2. Start dev server with host access:
   ```bash
   npm run dev -- --host
   ```

3. On your phone (connected to same WiFi):
   - Open browser
   - Visit `http://YOUR_LOCAL_IP:5173`
   - The app should load!

---

## 🎯 What's Next

After setting up Supabase:

1. **Test Authentication**
   - Sign up with a test account
   - Log in and out
   - Verify session persists on refresh

2. **Phase 3: Core Plant Management**
   - Build "Add Plant" form
   - Implement photo upload
   - Create plant detail screen
   - Build plant list with real data

3. **Phase 4: AI Plant ID**
   - Set up OpenAI API
   - Create Vercel serverless function
   - Build AI identification flow

---

## 🐛 Troubleshooting

**"Supabase credentials not found" warning:**
- Make sure `.env.local` exists with correct values
- Restart dev server after adding credentials

**TypeScript errors:**
- Run `npm install` again
- Check that all dependencies are installed

**Build errors:**
- Clear build cache: `rm -rf dist node_modules/.vite`
- Reinstall: `npm install`
- Rebuild: `npm run build`

**Port already in use:**
- Stop other Vite processes: `pkill -f vite`
- Or use a different port: `npm run dev -- --port 3000`

---

## 📚 Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev -- --host    # Start with network access
npm run build            # Build for production
npm run preview          # Preview production build

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git log --oneline        # View commit history

# Supabase
# Coming soon: Supabase CLI commands
```

---

## 🎉 Congratulations!

You've successfully completed **Phase 1: Foundation & Setup**!

Your PlantSis PWA has:
- ✅ Modern React + TypeScript + Tailwind CSS setup
- ✅ PWA configuration with service workers
- ✅ Routing system with protected routes
- ✅ Authentication UI (login/signup)
- ✅ Design system with brand colors
- ✅ Mobile-first responsive layout
- ✅ Git repository initialized

**Next:** Set up your Supabase project and move to Phase 2!
