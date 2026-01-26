# PlantSis - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase (First Time Only)

1. Create account at https://supabase.com
2. Create new project named "plant-sis"
3. Go to Project Settings → API
4. Copy your credentials

### 3. Configure Environment

Create `.env.local`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database

Copy the SQL from `SETUP.md` → "Create Database Tables" section and run it in Supabase SQL Editor.

### 5. Run the App
```bash
npm run dev
```

Visit: http://localhost:5173

---

## 📱 Test on Your Phone

```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
hostname -I             # Linux

# Start server with network access
npm run dev -- --host

# On phone: visit http://YOUR_IP:5173
```

---

## 🔑 Key Features Working Now

- ✅ Welcome screen with app intro
- ✅ User signup and login
- ✅ Session persistence
- ✅ Home screen (plant list - empty for now)
- ✅ Profile screen
- ✅ Mobile-responsive design
- ✅ PWA manifest and service worker

---

## 📖 Project Structure

```
plant-sis/
├── src/
│   ├── pages/          # Main screens
│   │   ├── Welcome.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── Home.tsx
│   │   ├── Profile.tsx
│   │   └── ...
│   ├── lib/            # Supabase client, utils
│   ├── hooks/          # useAuth, etc.
│   ├── types/          # TypeScript types
│   └── constants/      # App config, messages
├── public/             # Static assets
└── vite.config.ts      # Build config
```

---

## 🎯 Current Status

**Phase 1: Foundation & Setup** ✅ COMPLETE

**Next: Phase 2 - Supabase Setup**
- Set up your Supabase project
- Create database tables
- Configure storage bucket
- Test authentication flow

See `SETUP.md` for detailed instructions.

---

## 💡 Helpful Tips

**Hot Reload:**
The dev server auto-reloads when you save files!

**TypeScript Errors:**
Check the terminal for helpful type hints.

**Tailwind CSS:**
Use built-in classes like `btn-primary`, `input-field`, etc.

**Debug:**
Open browser DevTools (F12) → Console tab

---

## 🆘 Common Issues

**Q: "Supabase credentials not found" warning**
A: Create `.env.local` with your Supabase credentials (see Step 3)

**Q: Build fails with TypeScript errors**
A: Run `npm install` again, then `npm run build`

**Q: Changes not showing**
A: Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

**Q: Port 5173 already in use**
A: Kill Vite processes: `pkill -f vite`

---

## 📚 Learn More

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

Happy building! 🌿
