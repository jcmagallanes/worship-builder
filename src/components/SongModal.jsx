import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, GripVertical, ArrowRight, Music, Youtube, Headphones, Hash } from 'lucide-react'
import { COMMON_KEYS } from '../utils/transposeKey'

const TIME_SIGS = ['4/4', '3/4', '6/8', '2/4', '12/8', '5/4']

function LinkInput({ link, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-start mb-2">
      <div className="flex-1 space-y-1.5">
        <input
          className="input-field text-sm"
          placeholder="Label (e.g. Live Version, Acoustic)"
          value={link.label}
          onChange={e => onChange({ ...link, label: e.target.value })}
        />
        <input
          className="input-field text-sm"
          placeholder="URL (YouTube or Spotify)"
          value={link.url}
          onChange={e => onChange({ ...link, url: e.target.value })}
        />
      </div>
      <button onClick={onRemove} className="mt-2 p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function ProgressionRow({ prog, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-center mb-2">
      <input
        className="input-field text-sm w-24 shrink-0"
        placeholder="Section"
        value={prog.label}
        onChange={e => onChange({ ...prog, label: e.target.value })}
        title="e.g. Intro, Verse, Chorus, Bridge"
      />
      <input
        className="input-field text-sm flex-1"
        placeholder="e.g. 1-4-5-1  or  1-6-4-5"
        value={prog.pattern}
        onChange={e => onChange({ ...prog, pattern: e.target.value })}
      />
      <button onClick={onRemove} className="p-2 text-red-400 hover:bg-red-50 rounded-lg shrink-0">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export default function SongModal({ song, onSave, onClose }) {
  const isEdit = !!song?.id

  const [form, setForm] = useState({
    title: '',
    artist: '',
    type: 'praise',
    originalKey: 'G',
    performKey: 'G',
    tempo: '',
    timeSignature: '4/4',
    chords: '',
    notes: '',
    youtubeLinks: [],
    spotifyLinks: [],
    progressions: [],
    ...song,
  })

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const keyChanged = form.performKey && form.originalKey && form.performKey !== form.originalKey

  // Links
  const addLink = (type) => {
    const key = type === 'youtube' ? 'youtubeLinks' : 'spotifyLinks'
    set(key, [...(form[key] || []), { id: Date.now(), label: '', url: '' }])
  }
  const updateLink = (type, id, val) => {
    const key = type === 'youtube' ? 'youtubeLinks' : 'spotifyLinks'
    set(key, form[key].map(l => l.id === id ? val : l))
  }
  const removeLink = (type, id) => {
    const key = type === 'youtube' ? 'youtubeLinks' : 'spotifyLinks'
    set(key, form[key].filter(l => l.id !== id))
  }

  // Progressions
  const addProg = () => set('progressions', [...(form.progressions || []), { id: Date.now(), label: '', pattern: '' }])
  const updateProg = (id, val) => set('progressions', form.progressions.map(p => p.id === id ? val : p))
  const removeProg = (id) => set('progressions', form.progressions.filter(p => p.id !== id))

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({ ...form, id: form.id || Date.now() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl max-h-[92dvh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-black/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/8">
          <h2 className="font-display font-bold text-lg">{isEdit ? 'Edit Song' : 'Add Song'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="section-label">Song Info</div>
            <input
              className="input-field font-medium"
              placeholder="Song title *"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              autoFocus
            />
            <input
              className="input-field"
              placeholder="Artist / Band"
              value={form.artist}
              onChange={e => set('artist', e.target.value)}
            />
            {/* Type toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => set('type', 'praise')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.type === 'praise' ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-[#f5f3ef] border-transparent text-gray-400'}`}
              >
                🔥 Praise
              </button>
              <button
                onClick={() => set('type', 'worship')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.type === 'worship' ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-[#f5f3ef] border-transparent text-gray-400'}`}
              >
                🕊 Worship
              </button>
            </div>
          </div>

          {/* Key & Tempo */}
          <div className="space-y-3">
            <div className="section-label">Key & Tempo</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Original Key</label>
                <select className="input-field" value={form.originalKey} onChange={e => set('originalKey', e.target.value)}>
                  {COMMON_KEYS.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                  Perform In
                  {keyChanged && <span className="text-amber-500 text-xs font-bold">⚠ Changed</span>}
                </label>
                <select
                  className={`input-field ${keyChanged ? 'border-amber-300 bg-amber-50 text-amber-700 font-semibold' : ''}`}
                  value={form.performKey}
                  onChange={e => set('performKey', e.target.value)}
                >
                  {COMMON_KEYS.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>

            {keyChanged && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <span className="text-amber-500 text-sm">⚠️</span>
                <span className="text-sm text-amber-700 font-medium">
                  Key change: <strong>{form.originalKey}</strong>
                  <ArrowRight size={12} className="inline mx-1" />
                  <strong>{form.performKey}</strong>
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tempo (BPM)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 120"
                  value={form.tempo}
                  onChange={e => set('tempo', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Time Signature</label>
                <select className="input-field" value={form.timeSignature} onChange={e => set('timeSignature', e.target.value)}>
                  {TIME_SIGS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Chords */}
          <div className="space-y-2">
            <div className="section-label flex items-center gap-1.5">
              <Music size={11} /> Chords
            </div>
            <textarea
              className="input-field font-mono text-sm resize-none"
              rows={5}
              placeholder={`Verse:\nC  G  Am  F\n\nChorus:\nF  C  G  Am`}
              value={form.chords}
              onChange={e => set('chords', e.target.value)}
            />
            <p className="text-xs text-gray-400">Type chord charts section by section</p>
          </div>

          {/* Progressions */}
          <div className="space-y-2">
            <div className="section-label flex items-center gap-1.5">
              <Hash size={11} /> Number System / Progressions
            </div>
            <p className="text-xs text-gray-400 -mt-1 mb-2">Label each section and write the numeric progression (e.g. Intro: 1-4-5-1)</p>
            {(form.progressions || []).map(prog => (
              <ProgressionRow
                key={prog.id}
                prog={prog}
                onChange={val => updateProg(prog.id, val)}
                onRemove={() => removeProg(prog.id)}
              />
            ))}
            <button
              onClick={addProg}
              className="flex items-center gap-1.5 text-sm text-[#241e16] font-medium hover:bg-black/5 px-3 py-2 rounded-xl transition-all"
            >
              <Plus size={14} /> Add Progression
            </button>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <div className="section-label">Performance Notes</div>
            <textarea
              className="input-field text-sm resize-none"
              rows={3}
              placeholder="e.g. Has a key run after bridge, big build on last chorus, use capo 2..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* YouTube Links */}
          <div className="space-y-2">
            <div className="section-label flex items-center gap-1.5">
              <Youtube size={11} className="text-red-500" /> YouTube Links
            </div>
            {(form.youtubeLinks || []).map(link => (
              <LinkInput
                key={link.id}
                link={link}
                onChange={val => updateLink('youtube', link.id, val)}
                onRemove={() => removeLink('youtube', link.id)}
              />
            ))}
            <button
              onClick={() => addLink('youtube')}
              className="flex items-center gap-1.5 text-sm text-[#241e16] font-medium hover:bg-black/5 px-3 py-2 rounded-xl transition-all"
            >
              <Plus size={14} /> Add YouTube Link
            </button>
          </div>

          {/* Spotify Links */}
          <div className="space-y-2">
            <div className="section-label flex items-center gap-1.5">
              <Headphones size={11} className="text-green-500" /> Spotify Links
            </div>
            {(form.spotifyLinks || []).map(link => (
              <LinkInput
                key={link.id}
                link={link}
                onChange={val => updateLink('spotify', link.id, val)}
                onRemove={() => removeLink('spotify', link.id)}
              />
            ))}
            <button
              onClick={() => addLink('spotify')}
              className="flex items-center gap-1.5 text-sm text-[#241e16] font-medium hover:bg-black/5 px-3 py-2 rounded-xl transition-all"
            >
              <Plus size={14} /> Add Spotify Link
            </button>
          </div>

          <div className="h-2" />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-black/8 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="btn-primary flex-1 disabled:opacity-40"
          >
            {isEdit ? 'Save Changes' : 'Add Song'}
          </button>
        </div>
      </div>
    </div>
  )
}
