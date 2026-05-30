# 🎵 Worship Set Builder

A mobile-first PWA for worship leaders to plan, organize, and **share** song sets with their team.

## Features

- ✅ Add / edit / delete songs with Praise 🔥 / Worship 🕊 tags
- ✅ Drag-and-drop reordering
- ✅ Chord charts with key change indicator (⚠ auto-flagged)
- ✅ Tempo & time signature
- ✅ Number system progressions (e.g. `Verse: 1-4-5-1`)
- ✅ Performance notes
- ✅ YouTube & Spotify embedded players
- ✅ Export to **PDF**, **DOCX**, **XLSX**
- ✅ **Cloud sharing via Supabase** — real-time sync
- ✅ **View-only link** for band members
- ✅ **Edit link** for worship leaders
- ✅ **PWA** — installable, works offline
- ✅ localStorage fallback when offline

---

## Setup (5 minutes)

### 1. Supabase (free, no credit card)

1. Go to [supabase.com](https://supabase.com) → Create a free project
2. In your project, go to **SQL Editor** → **New Query**
3. Paste and run the contents of `supabase-setup.sql`
4. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 2. Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase values
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 3. Run locally

```bash
npm install
npm run dev
```

---

## Deploy to GitHub + Netlify

```bash
# Push to GitHub
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/worship-set-builder.git
git push -u origin main
```

**In Netlify:**
1. New Site → Import from GitHub → select your repo
2. Build command: `npm run build`
3. Publish directory: `dist`
4. **Environment variables** → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy!

The `netlify.toml` handles routing automatically. ✓

---

## How Sharing Works

1. Worship leader taps **Share** → **Publish & Get Share Links**
2. Two links are generated:
   - **View link** → `yourapp.netlify.app/#/set/abc123` — read-only for band
   - **Edit link** → `yourapp.netlify.app/#/set/abc123?edit=secret-token` — full edit
3. Band members open the view link and see live updates as the leader edits
4. No login required for either party

---

## Offline / PWA

- On mobile, tap **Add to Home Screen** to install as an app
- On desktop, click the install icon in the browser bar
- Once installed and cached, the app works fully offline
- Changes made offline sync when back online (after re-publishing)

---

## Tech Stack

| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling |
| @dnd-kit | Drag-and-drop |
| @supabase/supabase-js | Cloud sync + realtime |
| vite-plugin-pwa | PWA + service worker |
| jsPDF | PDF export |
| docx | Word export |
| SheetJS | Excel export |
| file-saver | File downloads |
