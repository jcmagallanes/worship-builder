import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { Plus, Music, Search, X, Share2, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react'
import SongCard from './components/SongCard'
import SongModal from './components/SongModal'
import ExportMenu from './components/ExportMenu'
import ShareModal from './components/ShareModal'
import ViewOnlyBanner from './components/ViewOnlyBanner'
import { getSet, subscribeToSet, isSupabaseConfigured } from './utils/supabase'

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

// ── Parse hash-based routing ──────────────────────────────────
function parseRoute() {
  const hash = window.location.hash // e.g. #/set/uuid?edit=token
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

export default function App() {
  const route = parseRoute()
  const isSharedView = !!route?.setId
  const canEdit = !isSharedView || !!route?.editToken

  const [songs, setSongs] = useState([])
  const [setTitle, setSetTitle] = useState('Sunday Morning Set')
  const [editingTitle, setEditingTitle] = useState(false)
  const [shareState, setShareState] = useState(null) // { setId, editToken }
  const [modal, setModal] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudError, setCloudError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [online, setOnline] = useState(navigator.onLine)
  const [remoteUpdated, setRemoteUpdated] = useState(false)

  // Online status
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Load data
  useEffect(() => {
    if (isSharedView) {
      // Load from cloud
      setCloudLoading(true)
      getSet(route.setId)
        .then(data => {
          setSongs(data.songs || [])
          setSetTitle(data.title || 'Worship Set')
          setLastUpdated(data.updated_at)
          if (route.editToken) {
            setShareState({ setId: route.setId, editToken: route.editToken })
          }
        })
        .catch(e => setCloudError(e.message))
        .finally(() => setCloudLoading(false))
    } else {
      // Load from local
      const data = loadLocal()
      setSongs(data.songs || DEMO_SONGS)
      setSetTitle(data.setTitle || 'Sunday Morning Set')
      setShareState(data.shareState || null)
    }
  }, [])

  // Realtime subscription for shared view
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

  // Save local (only for local mode)
  useEffect(() => {
    if (!isSharedView) {
      saveLocal({ songs, setTitle, shareState })
    }
  }, [songs, setTitle, shareState, isSharedView])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = ({ active, over }) => {
    if (!canEdit) return
    if (over && active.id !== over.id) {
      setSongs(s => {
        const oldIdx = s.findIndex(x => x.id === active.id)
        const newIdx = s.findIndex(x => x.id === over.id)
        return arrayMove(s, oldIdx, newIdx)
      })
    }
  }

  const handleSave = (song) => {
    setSongs(s =>
      s.find(x => x.id === song.id)
        ? s.map(x => x.id === song.id ? song : x)
        : [...s, song]
    )
    setModal(null)
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
    // Update URL to edit link
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
        <p className="font-display font-bold text-lg">Set not found</p>
        <p className="text-sm text-gray-500">{cloudError}</p>
        <a href={window.location.pathname} className="btn-primary mt-2">Go to My Sets</a>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#f5f3ef]">
      {/* View-only banner */}
      {isSharedView && !canEdit && <ViewOnlyBanner setTitle={setTitle} updatedAt={lastUpdated} />}

      {/* Realtime update toast */}
      {remoteUpdated && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#241e16] text-white text-xs font-medium px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse no-print">
          <RefreshCw size={12} /> Set updated by worship leader
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-black/8 sticky top-0 z-40 no-print">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-[#241e16] rounded-xl flex items-center justify-center shrink-0">
                <Music size={15} className="text-white" />
              </div>
              {canEdit && editingTitle ? (
                <input
                  autoFocus
                  className="font-display font-bold text-base bg-transparent border-b-2 border-[#241e16] outline-none w-48"
                  value={setTitle}
                  onChange={e => setSetTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                />
              ) : (
                <button
                  onClick={() => canEdit && setEditingTitle(true)}
                  className="font-display font-bold text-base text-left truncate max-w-[160px]"
                >
                  {setTitle}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Online indicator */}
              <div title={online ? 'Online' : 'Offline'}>
                {online
                  ? <Wifi size={14} className="text-green-400" />
                  : <WifiOff size={14} className="text-amber-400" />
                }
              </div>
              {/* Share button — only in edit/local mode */}
              {canEdit && (
                <button
                  onClick={() => setShowShare(true)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2.5 rounded-xl border transition-all active:scale-95 ${shareState?.setId ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-black/15 hover:bg-black/3'}`}
                >
                  <Share2 size={14} />
                  {shareState?.setId ? 'Shared' : 'Share'}
                </button>
              )}
              <ExportMenu songs={songs} setTitle={setTitle} />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">{songs.length} songs</span>
            {praiseCount > 0 && <span className="tag-praise text-[10px]">🔥 {praiseCount} praise</span>}
            {worshipCount > 0 && <span className="tag-worship text-[10px]">🕊 {worshipCount} worship</span>}
            {shareState?.setId && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                ☁ synced
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-28">
        {/* Search & Filter */}
        <div className="flex gap-2 mb-4 no-print">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9 text-sm"
              placeholder="Search songs…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-white border border-black/10 rounded-xl p-1">
            {['all', 'praise', 'worship'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterType === t ? 'bg-[#241e16] text-white' : 'text-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Song list */}
        {filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-3">🎵</div>
            <p className="font-display font-bold text-lg text-gray-700">
              {songs.length === 0 ? 'No songs yet' : 'No songs match'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {songs.length === 0 ? 'Add your first song to get started' : 'Try a different search or filter'}
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
              {filteredSongs.map((song, i) => (
                <div key={song.id} className="relative">
                  {deleteConfirm === song.id && (
                    <div className="absolute inset-0 z-10 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center gap-3 px-4">
                      <span className="text-sm text-red-600 font-medium">Delete "{song.title}"?</span>
                      <button onClick={() => handleDelete(song.id)} className="bg-red-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">Delete</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-sm text-gray-500 font-medium px-3 py-1.5 rounded-lg hover:bg-black/5">Cancel</button>
                    </div>
                  )}
                  <SongCard
                    song={song}
                    index={songs.findIndex(s => s.id === song.id)}
                    onEdit={canEdit ? (s) => setModal({ mode: 'edit', song: s }) : null}
                    onDelete={canEdit ? handleDelete : null}
                    readOnly={!canEdit}
                  />
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* FAB - only in edit mode */}
      {canEdit && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 no-print">
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-2 bg-[#241e16] text-white font-semibold px-6 py-3.5 rounded-2xl shadow-2xl shadow-black/30 active:scale-95 transition-all hover:bg-[#3f3526]"
          >
            <Plus size={18} />
            Add Song
          </button>
        </div>
      )}

      {/* Modals */}
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
    </div>
  )
}
