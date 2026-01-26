# Phase 3: Testing Guide

## 🎉 Phase 3 Complete: Core Plant Management

You can now add, view, and manage plants with photos!

---

## 🧪 How to Test

### 1. Start the Dev Server

```bash
npm run dev
```

Visit: http://localhost:5173

---

### 2. Test Add Plant Flow

**Scenario: Add plant without photo**

1. Log in to your account
2. Click the big **+** button (center of bottom nav)
3. Fill in the form:
   - **Name**: "Monty" (or any name you like)
   - **Species**: Leave blank or add "Monstera"
   - **Location**: "Living room, near east window"
   - **Light**: Select "Indirect"
   - **Proximity**: Select "Near window"
4. Click "Save Plant"
5. ✅ You should be redirected to the Plant Detail page
6. ✅ Plant shows with default 🌱 emoji (no photo)

**Scenario: Add plant with photo**

1. Click the **+** button again
2. Click "Add Photo" (the camera icon area)
3. Choose:
   - On mobile: Takes a photo with camera
   - On desktop: Opens file picker
4. Select/take a photo
5. ✅ Photo preview shows with "X" button to remove
6. ✅ Image is automatically compressed
7. Fill in plant details
8. Click "Save Plant"
9. ✅ Plant saved with photo
10. ✅ Photo shows on Plant Detail page

---

### 3. Test Plant List (Home)

1. Navigate to Home (bottom left icon)
2. ✅ See all your plants in a grid
3. ✅ Plants with photos show thumbnails
4. ✅ Plants without photos show 🌱 emoji
5. Click on any plant card
6. ✅ Opens Plant Detail page

---

### 4. Test Plant Detail Page

1. Open any plant from the list
2. Verify:
   - ✅ Hero image shows (or emoji if no photo)
   - ✅ Plant name displays prominently
   - ✅ Species name shows (if added)
   - ✅ Location, light, proximity info accurate
   - ✅ "Added" date is correct
   - ✅ "Start Check-In" button present
   - ✅ Photo timeline shows all photos (if multiple)
   - ✅ "Check-In History" placeholder visible

---

### 5. Test Delete Plant

1. On Plant Detail page
2. Click "Delete" (top right, red text)
3. ✅ Confirmation dialog appears
4. Click "OK"
5. ✅ Redirected to Home
6. ✅ Plant removed from list
7. ✅ Photo deleted from storage

---

### 6. Test Photo Upload

**Image Compression Test:**

1. Add a plant with a large photo (e.g., 5MB+ from phone)
2. ✅ Upload is fast (compressed before upload)
3. ✅ Photo quality is good (not too degraded)
4. ✅ Photo displays correctly

**Multiple Photos Test:**

1. Add a plant with a photo
2. Go to Plant Detail
3. (Photos are view-only for now - editing coming soon)

---

### 7. Test Edge Cases

**Empty state:**
1. Delete all plants
2. ✅ Home shows "Add your first plant" empty state
3. ✅ "Add Plant" button works

**Long plant name:**
1. Add plant with very long name (50 characters)
2. ✅ Name truncates with "..." in grid view
3. ✅ Full name shows on detail page

**No species name:**
1. Add plant without species
2. ✅ Species field not shown on detail page

**Photo upload error:**
1. Try uploading a very large file (>10MB)
2. ✅ Compression handles it gracefully
3. ✅ Or shows error if too large

---

## 📱 Mobile Testing

**Test on your phone:**

1. Find your computer's IP:
   ```bash
   ipconfig getifaddr en0
   ```

2. Visit `http://YOUR_IP:5173` on phone

3. Test camera capture:
   - ✅ Tapping "Add Photo" opens camera
   - ✅ Can switch between front/back camera
   - ✅ Photo preview works
   - ✅ Touch targets are big enough

4. Test navigation:
   - ✅ Bottom nav works smoothly
   - ✅ Back buttons navigate correctly
   - ✅ No horizontal scroll

---

## 🐛 Known Limitations (Phase 3)

These are expected and will be addressed later:

- ❌ Can't add multiple photos during plant creation (only first photo)
- ❌ Can't edit plant info after creation
- ❌ Can't add more photos to existing plant
- ❌ No AI plant identification yet
- ❌ No check-in functionality yet
- ❌ "Start Check-In" button goes to placeholder page
- ❌ Status always shows "💚 Healthy" (not dynamic yet)

---

## ✅ What Should Work

**Add Plant:**
- ✅ Form validation works
- ✅ Photo upload with compression
- ✅ Saves to Supabase database
- ✅ Photo saves to Supabase storage
- ✅ Redirects to detail page

**Plant Detail:**
- ✅ Shows all plant info
- ✅ Displays hero photo
- ✅ Photo timeline (if multiple photos exist)
- ✅ Delete functionality
- ✅ Back navigation

**Home:**
- ✅ Grid layout responsive
- ✅ Shows plant thumbnails
- ✅ Empty state if no plants
- ✅ Loading state

**General:**
- ✅ Authentication required
- ✅ Only shows user's own plants
- ✅ Mobile responsive
- ✅ Fast performance

---

## 🎯 Success Criteria

Before moving to Phase 4, verify:

- [ ] Can create account and log in
- [ ] Can add plant without photo
- [ ] Can add plant with photo
- [ ] Plants appear on home screen
- [ ] Can view plant details
- [ ] Can delete plant
- [ ] Photos display correctly
- [ ] No console errors (check F12 → Console)
- [ ] Works on mobile device

---

## 🔍 Debugging Tips

**Photo not showing:**
- Check Supabase Storage → plant-photos bucket
- Verify photo uploaded successfully
- Check browser Network tab for 404s
- Verify storage policies are correct

**Can't add plant:**
- Check browser console for errors
- Verify you're logged in
- Check Supabase → Authentication → Users
- Verify database tables exist

**Database errors:**
- Check Supabase → Database → Table Editor
- Verify Row Level Security policies
- Check user_id matches auth.uid()

**Build errors:**
- Run `npm install` again
- Clear cache: `rm -rf node_modules/.vite dist`
- Rebuild: `npm run build`

---

## 🚀 Next: Phase 4 - AI Plant Identification

After testing Phase 3, we'll add:
- OpenAI GPT-4 Vision integration
- AI-powered plant species identification
- Confidence scoring
- Usage tracking (3 free IDs/month)

---

## 💡 Test Scenarios to Try

**Real-world usage:**
1. Add 3-5 of your actual plants with photos
2. Use real names you'll remember
3. Add accurate light/location info
4. Take photos from different angles
5. Navigate between plants
6. Delete one, add it back
7. Test on your phone while standing near your plants

**This will help validate the UX and catch any issues!**

---

Happy testing! 🌿

Report any bugs or issues you find - we'll fix them before Phase 4.
