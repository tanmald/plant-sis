# Phase 2: Supabase Setup - Checklist

## ✅ Already Complete

- [x] Supabase project created
- [x] Environment variables configured
- [x] Database tables created (plants, plant_photos, check_ins, etc.)
- [x] Row Level Security policies set up
- [x] User profile trigger created
- [x] Authentication enabled

## 🔄 To Do: Storage Bucket Setup

### Create plant-photos Bucket

1. Go to: https://supabase.com/dashboard/project/szmpzaftvaabjgpugjhm/storage/buckets

2. Click "Create a new bucket"
   - Name: `plant-photos`
   - Public: **ON** ✅
   - Click "Create"

3. Add Storage Policies:
   - Click bucket → "Policies" → "New Policy"
   - Choose "For full customization"
   - Paste this SQL:

```sql
-- Allow authenticated users to upload their photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'plant-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to view their photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'plant-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'plant-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to view photos (optional, for sharing)
CREATE POLICY "Anyone can view public photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'plant-photos');
```

---

## 🧪 Testing Authentication

Your dev server is running at: **http://localhost:5173**

### Test Signup Flow

1. Open http://localhost:5173
2. Click "Let's Start"
3. Fill in:
   - Email: your-test-email@gmail.com
   - Password: testpassword123
   - Confirm password: testpassword123
4. Click "Create Account"
5. You should be redirected to Home screen
6. Check your Supabase Dashboard → Authentication → Users
   - Your new user should appear!

### Test Login/Logout

1. Click Profile icon (bottom right)
2. Click "Log Out"
3. Click "I already have an account"
4. Enter your credentials
5. Click "Log In"
6. You should see Home screen again

### Test Session Persistence

1. While logged in, refresh the page (Cmd/Ctrl + R)
2. You should stay logged in
3. Close tab and reopen http://localhost:5173
4. You should still be logged in

---

## 🎯 What Works Now

After completing the storage bucket:

✅ **Authentication**
- Sign up with email/password
- Log in/out
- Session persistence
- Protected routes

✅ **Database**
- User profiles auto-created on signup
- Plants table ready for data
- Check-ins table ready
- All relationships and policies working

✅ **UI/UX**
- Welcome screen
- Login/signup forms with validation
- Home screen (empty state)
- Profile screen
- Bottom navigation
- Mobile responsive

---

## 🔜 Next: Phase 3 - Core Plant Management

Once storage is set up, you're ready for Phase 3:

1. Build "Add Plant" form
2. Implement photo upload
3. Create plant list with real data
4. Build plant detail screen

---

## 🐛 Common Issues

**"User already registered" error**
- Use a different email or delete the test user in Supabase Dashboard

**Not redirected after signup**
- Check browser console for errors (F12)
- Verify .env.local has correct credentials

**Changes not showing**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Storage policies not working**
- Make sure bucket is marked as "Public"
- Verify policy SQL ran without errors
- Check Supabase logs for permission errors

---

## ✅ Completion Checklist

Before moving to Phase 3:

- [ ] Storage bucket created
- [ ] Storage policies added
- [ ] Can create an account
- [ ] Can log in/out
- [ ] Session persists on refresh
- [ ] User profile created in database
- [ ] No console errors

---

## 📸 Test Storage (Optional)

After creating bucket, run this test:

```bash
node -e "
import('@supabase/supabase-js').then(async ({ createClient }) => {
  const supabase = createClient(
    'https://szmpzaftvaabjgpugjhm.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bXB6YWZ0dmFhYmpncHVnamhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzODI3MDcsImV4cCI6MjA4NDk1ODcwN30.hF9sMg-bS44Wcpw01QtEF9JPSb6f19KP3IvuHSPuMDo'
  );
  const { data } = await supabase.storage.listBuckets();
  console.log('Buckets:', data.map(b => b.name));
  process.exit(0);
});
"
```

Should output: `Buckets: [ 'plant-photos' ]`

---

🎉 **You're almost done with Phase 2!** Just need to create that storage bucket.
