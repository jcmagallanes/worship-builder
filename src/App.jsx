import React, { useState, useEffect, useMemo } from 'react'
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  Plus, Search, X, Share2, Loader2, RefreshCw,
  Presentation, Download, ListMusic, SlidersHorizontal,
  ChevronDown, Check
} from 'lucide-react'
import SongCard from './components/SongCard'
import SongModal from './components/SongModal'
import ExportMenu from './components/ExportMenu'
import ShareModal from './components/ShareModal'
import ViewOnlyBanner from './components/ViewOnlyBanner'
import PresentationMode from './components/PresentationMode'
import { getSet, subscribeToSet } from './utils/supabase'

const STORAGE_KEY = 'worship_set_builder_v2'

const DEMO_SONGS = [
  {
    id: 1, title: 'Way Maker', artist: 'Sinach', type: 'worship',
    originalKey: 'Bb', performKey: 'G', tempo: '72', timeSignature: '4/4',
    chords: 'Verse:\nG  D  Em  C\n\nChorus:\nG  D  Em  C\n\nBridge:\nEm  C  G  D',
    notes: 'Key change from Bb to G for our team. Big build on last chorus.',
    progressions: [
      { id: 11, label: 'Verse', pattern: '1-5-6m-4' },
      { id: 12, label: 'Chorus', pattern: '1-5-6m-4' },
      { id: 13, label: 'Bridge', pattern: '6m-4-1-5' },
    ],
    youtubeLinks: [{ id: 101, label: 'Leeland Live', url: 'https://www.youtube.com/watch?v=iY6YZYZ-KaA' }],
    spotifyLinks: [],
  },
  {
    id: 2, title: 'Reckless Love', artist: 'Cory Asbury', type: 'worship',
    originalKey: 'A', performKey: 'A', tempo: '68', timeSignature: '4/4',
    chords: 'Verse:\nA  E  F#m  D\n\nChorus:\nD  A  E  F#m  D  A  E',
    notes: 'Slow build. Has a run at the end of the bridge.',
    progressions: [
      { id: 21, label: 'Verse', pattern: '1-5-6m-4' },
      { id: 22, label: 'Chorus', pattern: '4-1-5-6m-4-1-5' },
    ],
    youtubeLinks: [], spotifyLinks: [],
  },
  {
    id: 3, title: 'Shout to the Lord', artist: 'Darlene Zschech', type: 'praise',
    originalKey: 'E', performKey: 'D', tempo: '80', timeSignature: '4/4',
    chords: 'Verse:\nD  A  Bm  G\n\nChorus:\nD  A  G  D',
    notes: 'Dropped a step — plays easier in D.',
    progressions: [
      { id: 31, label: 'Verse', pattern: '1-5-6m-4' },
      { id: 32, label: 'Chorus', pattern: '1-5-4-1' },
    ],
    youtubeLinks: [], spotifyLinks: [],
  },
  {
    id: 4, title: 'Trading My Sorrows', artist: 'Darrell Evans', type: 'praise',
    originalKey: 'G', performKey: 'G', tempo: '120', timeSignature: '4/4',
    chords: 'Verse:\nG  D  Em  C\n\nChorus:\nG  D  C  G',
    notes: 'High energy opener.',
    progressions: [
      { id: 41, label: 'Verse', pattern: '1-5-6m-4' },
      { id: 42, label: 'Chorus', pattern: '1-5-4-1' },
    ],
    youtubeLinks: [], spotifyLinks: [],
  },
  {
    id: 5, title: 'Holy Spirit', artist: 'Bryan & Katie Torwalt', type: 'worship',
    originalKey: 'C', performKey: 'C', tempo: '65', timeSignature: '4/4',
    chords: 'Verse:\nC  G  Am  F\n\nChorus:\nF  C  G  Am  F  C  G',
    notes: 'Meditative feel. Let the chorus breathe.',
    progressions: [
      { id: 51, label: 'Verse', pattern: '1-5-6m-4' },
      { id: 52, label: 'Chorus', pattern: '4-1-5-6m-4-1-5' },
    ],
    youtubeLinks: [], spotifyLinks: [],
  },
]

function parseRoute() {
  const hash = window.location.hash
  const match = hash.match(/^#\/set\/([a-f0-9-]+)/)
  if (match) {
    const setId = match[1]
    const params = new URLSearchParams(hash.split('?')[1] || '')
    const editToken = params.get('edit') || null
    return { setId, editToken }
  }
  return null
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { songs: DEMO_SONGS, setTitle: 'Sunday Morning Set', shareState: null }
}

function saveLocal(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
}

// Filter sheet component — slides up from bottom
function FilterSheet({ filterType, setFilterType, onClose }) {
  const options = [
    { id: 'all', label: 'All Songs', emoji: '🎵' },
    { id: 'praise', label: 'Praise only', emoji: '🔥' },
    { id: 'worship', label: 'Worship only', emoji: '🕊' },
  ]
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl pb-safe">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-black/15 rounded-full" />
        </div>
        <div className="px-4 pb-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Filter by type</p>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { setFilterType(opt.id); onClose() }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-1 transition-all active:scale-[0.98]"
              style={{ background: filterType === opt.id ? '#f5f3ef' : 'transparent' }}
            >
              <span className="flex items-center gap-3 text-base font-medium text-[#241e16]">
                <span className="text-xl">{opt.emoji}</span>
                {opt.label}
              </span>
              {filterType === opt.id && <Check size={18} className="text-[#241e16]" />}
            </button>
          ))}
        </div>
        <div className="px-4 pb-6 pt-2 border-t border-black/6">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#f5f3ef] text-[#241e16] font-semibold text-base active:scale-[0.98] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const route = parseRoute()
  const isSharedView = !!route?.setId
  const canEdit = !isSharedView || !!route?.editToken

  const [songs, setSongs] = useState([])
  const [setTitle, setSetTitle] = useState('Sunday Morning Set')
  const [editingTitle, setEditingTitle] = useState(false)
  const [shareState, setShareState] = useState(null)
  const [modal, setModal] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudError, setCloudError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [remoteUpdated, setRemoteUpdated] = useState(false)
  const [presentationIdx, setPresentationIdx] = useState(null)

  // Load data
  useEffect(() => {
    if (isSharedView) {
      setCloudLoading(true)
      getSet(route.setId)
        .then(data => {
          setSongs(data.songs || [])
          setSetTitle(data.title || 'Worship Set')
          setLastUpdated(data.updated_at)
          if (route.editToken) setShareState({ setId: route.setId, editToken: route.editToken })
        })
        .catch(e => setCloudError(e.message))
        .finally(() => setCloudLoading(false))
    } else {
      const data = loadLocal()
      setSongs(data.songs || DEMO_SONGS)
      setSetTitle(data.setTitle || 'Sunday Morning Set')
      setShareState(data.shareState || null)
    }
  }, [])

  // Realtime subscription
  useEffect(() => {
    if (!isSharedView || !route?.setId) return
    const unsub = subscribeToSet(route.setId, (updated) => {
      setSongs(updated.songs || [])
      setSetTitle(updated.title || 'Worship Set')
      setLastUpdated(updated.updated_at)
      setRemoteUpdated(true)
      setTimeout(() => setRemoteUpdated(false), 3000)
    })
    return unsub
  }, [isSharedView])

  // Persist local
  useEffect(() => {
    if (!isSharedView) saveLocal({ songs, setTitle, shareState })
  }, [songs, setTitle, shareState, isSharedView])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!canEdit || !over || active.id === over.id) return
    setSongs(s => {
      const oi = s.findIndex(x => x.id === active.id)
      const ni = s.findIndex(x => x.id === over.id)
      return arrayMove(s, oi, ni)
    })
  }

  const handleSave = (song) => {
    setSongs(s => s.find(x => x.id === song.id) ? s.map(x => x.id === song.id ? song : x) : [...s, song])
    setModal(null)
  }

  const handleDuplicate = (song) => {
    const copy = {
      ...song,
      id: Date.now(),
      title: `${song.title} (copy)`,
      progressions: (song.progressions || []).map(p => ({ ...p, id: Date.now() + Math.random() })),
      youtubeLinks: (song.youtubeLinks || []).map(l => ({ ...l, id: Date.now() + Math.random() })),
      spotifyLinks: (song.spotifyLinks || []).map(l => ({ ...l, id: Date.now() + Math.random() })),
    }
    setSongs(s => {
      const idx = s.findIndex(x => x.id === song.id)
      const next = [...s]
      next.splice(idx + 1, 0, copy)
      return next
    })
  }

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      setSongs(s => s.filter(x => x.id !== id))
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(c => c === id ? null : c), 3000)
    }
  }

  const handleShareStateChange = (state) => {
    setShareState(state)
    if (state?.setId && state?.editToken) {
      window.history.replaceState(null, '', `#/set/${state.setId}?edit=${state.editToken}`)
    }
  }

  const filteredSongs = useMemo(() => songs.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.artist?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || s.type === filterType
    return matchSearch && matchType
  }), [songs, search, filterType])

  const praiseCount = songs.filter(s => s.type === 'praise').length
  const worshipCount = songs.filter(s => s.type === 'worship').length

  if (cloudLoading) {
    return (
      <div className="min-h-dvh bg-[#f5f3ef] flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#241e16]" />
        <p className="text-sm text-gray-500">Loading set…</p>
      </div>
    )
  }

  if (cloudError) {
    return (
      <div className="min-h-dvh bg-[#f5f3ef] flex flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-4xl">😕</p>
        <p className="font-bold text-lg">Set not found</p>
        <p className="text-sm text-gray-500">{cloudError}</p>
        <a href={window.location.pathname} className="btn-primary mt-2">Go to My Sets</a>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#f5f3ef]">

      {/* View-only banner */}
      {isSharedView && !canEdit && <ViewOnlyBanner setTitle={setTitle} updatedAt={lastUpdated} />}

      {/* Live update toast */}
      {remoteUpdated && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#241e16] text-white text-sm font-medium px-5 py-3 rounded-full flex items-center gap-2 shadow-xl no-print">
          <RefreshCw size={14} className="animate-spin" /> Updated by worship leader
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="bg-white sticky top-0 z-40 no-print" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">

          {/* Row 1: Title + action icons */}
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* Set title */}
            <div className="flex-1 min-w-0">
              {canEdit && editingTitle ? (
                <input
                  autoFocus
                  className="font-bold text-xl bg-transparent border-b-2 border-[#241e16] outline-none w-full"
                  value={setTitle}
                  onChange={e => setSetTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                />
              ) : (
                <button
                  onClick={() => canEdit && setEditingTitle(true)}
                  className="text-left w-full"
                >
                  <h1 className="font-bold text-xl text-[#241e16] truncate leading-tight">
                    {setTitle}
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>{songs.length} songs</span>
                    {praiseCount > 0 && <span>· 🔥 {praiseCount}</span>}
                    {worshipCount > 0 && <span>· 🕊 {worshipCount}</span>}
                    {shareState?.setId && <span className="text-green-500">· ☁ synced</span>}
                  </p>
                </button>
              )}
            </div>

            {/* Icon action buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Present */}
              {songs.length > 0 && (
                <button
                  onClick={() => setPresentationIdx(0)}
                  className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-[#f5f3ef] active:scale-90 transition-all"
                  title="Present"
                >
                  <Presentation size={20} className="text-[#241e16]" />
                </button>
              )}
              {/* Share */}
              {canEdit && (
                <button
                  onClick={() => setShowShare(true)}
                  className={`w-10 h-10 flex items-center justify-center rounded-2xl active:scale-90 transition-all ${shareState?.setId ? 'text-green-600 bg-green-50' : 'hover:bg-[#f5f3ef] text-[#241e16]'}`}
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
              )}
              {/* Export */}
              <ExportMenu songs={songs} setTitle={setTitle} iconOnly />
            </div>
          </div>

          {/* Row 2: Search + filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                className="input-field pl-10 pr-9 h-11"
                placeholder="Search songs…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilter(true)}
              className={`h-11 px-3.5 rounded-xl flex items-center gap-1.5 font-semibold text-sm border transition-all active:scale-95 ${
                filterType !== 'all'
                  ? 'bg-[#241e16] text-white border-transparent'
                  : 'bg-white border-black/10 text-gray-500'
              }`}
            >
              <SlidersHorizontal size={15} />
              {filterType === 'all' ? 'Filter' : filterType === 'praise' ? '🔥' : '🕊'}
            </button>
          </div>
        </div>
      </header>

      {/* ── SONG LIST ─────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-32">
        {filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">🎵</div>
            <p className="font-bold text-xl text-gray-700">
              {songs.length === 0 ? 'No songs yet' : 'No songs match'}
            </p>
            <p className="text-base text-gray-400 mt-1">
              {songs.length === 0 ? 'Tap + to add your first song' : 'Try a different search or filter'}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={filteredSongs.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {filteredSongs.map((song) => (
                <div key={song.id} className="relative">
                  {deleteConfirm === song.id && (
                    <div className="absolute inset-0 z-10 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center gap-3 px-4">
                      <span className="text-sm text-red-600 font-semibold">Delete "{song.title}"?</span>
                      <button onClick={() => handleDelete(song.id)} className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-xl active:scale-95">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-sm text-gray-500 font-medium px-3 py-2 rounded-xl hover:bg-black/5">Cancel</button>
                    </div>
                  )}
                  <SongCard
                    song={song}
                    index={songs.findIndex(s => s.id === song.id)}
                    onEdit={canEdit ? (s) => setModal({ mode: 'edit', song: s }) : null}
                    onDelete={canEdit ? handleDelete : null}
                    onDuplicate={canEdit ? handleDuplicate : null}
                    onPresent={(idx) => setPresentationIdx(idx)}
                    readOnly={!canEdit}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* ── BOTTOM FAB ────────────────────────────────────── */}
      {canEdit && (
        <div className="fixed bottom-0 left-0 right-0 z-40 no-print">
          {/* Safe area gradient */}
          <div className="bg-gradient-to-t from-[#f5f3ef] via-[#f5f3ef]/95 to-transparent pt-6 pb-6 px-4 flex justify-center"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={() => setModal({ mode: 'add' })}
              className="flex items-center gap-2.5 bg-[#241e16] text-white font-bold text-base px-8 py-4 rounded-2xl shadow-2xl shadow-black/25 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={2.5} />
              Add Song
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS & OVERLAYS ─────────────────────────────── */}
      {modal && (
        <SongModal
          song={modal.song}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {showShare && (
        <ShareModal
          songs={songs}
          setTitle={setTitle}
          shareState={shareState}
          onShareStateChange={handleShareStateChange}
          onClose={() => setShowShare(false)}
        />
      )}

      {showFilter && (
        <FilterSheet
          filterType={filterType}
          setFilterType={setFilterType}
          onClose={() => setShowFilter(false)}
        />
      )}

      {presentationIdx !== null && songs.length > 0 && (
        <PresentationMode
          songs={filteredSongs.length > 0 ? filteredSongs : songs}
          initialIndex={presentationIdx}
          onClose={() => setPresentationIdx(null)}
        />
      )}
    </div>
  )
}
