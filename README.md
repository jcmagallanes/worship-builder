# 🎵 Worship Set Builder

A mobile-first app for worship leaders to plan and organize their song sets.

## Features

- ✅ Add, edit, delete songs with Praise / Worship tags
- ✅ Drag-and-drop reordering
- ✅ Chord charts per song
- ✅ Key change indicator (original key → perform key)
- ✅ Tempo & time signature
- ✅ Number system progressions (e.g. Verse: 1-4-5-1)
- ✅ Performance notes
- ✅ YouTube & Spotify links with embedded player
- ✅ Export to **PDF**, **DOCX**, **XLSX**
- ✅ Search & filter by type
- ✅ Data persists via localStorage
- ✅ Mobile-first, works on desktop too

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- @dnd-kit (drag and drop)
- jsPDF + jspdf-autotable (PDF export)
- docx (Word export)
- SheetJS/xlsx (Excel export)
- file-saver

## Getting Started

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Then deploy the `dist/` folder to Netlify or any static host.

### Netlify (recommended)

1. Push to GitHub
2. Connect repo in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `dist`

Or use the included `netlify.toml` for auto-config.

## Usage

- Tap **Add Song** to create a new song
- Fill in title, artist, type (Praise/Worship), key, tempo, chords, progressions, and links
- **Key Change** is automatically flagged if Perform Key ≠ Original Key
- Drag the ≡ handle to reorder songs
- Tap **Show details** on a card to see chords, progressions, and media
- Use the **Export** button to download PDF, DOCX, or XLSX
