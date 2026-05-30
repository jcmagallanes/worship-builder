import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Edit2, Trash2, ChevronDown, ChevronUp,
  Music2, Hash, Youtube, Headphones, ArrowRight, Clock, Gauge
} from 'lucide-react'
import { MediaLink } from './MediaEmbed'

export default function SongCard({ song, index, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  const keyChanged = song.performKey && song.originalKey && song.performKey !== song.originalKey
  const allLinks = [...(song.youtubeLinks || []), ...(song.spotifyLinks || [])]
  const hasDetails = song.chords || (song.progressions?.length > 0) || song.notes || allLinks.length > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`song-card card mb-3 ${isDragging ? 'shadow-2xl scale-[1.02]' : ''}`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        {/* Drag handle */}
        <button
          className="drag-handle mt-0.5 p-1 text-gray-300 hover:text-gray-400 shrink-0 touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>

        {/* Index */}
        <span className="text-sm font-bold text-gray-300 w-5 shrink-0 mt-0.5 text-center">{index + 1}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-display font-bold text-base leading-tight flex-1 min-w-0">{song.title}</h3>
            <span className={song.type === 'praise' ? 'tag-praise' : 'tag-worship'}>
              {song.type === 'praise' ? '🔥' : '🕊'} {song.type}
            </span>
          </div>

          {song.artist && (
            <p className="text-sm text-gray-400 mt-0.5">{song.artist}</p>
          )}

          {/* Meta pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {song.originalKey && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#f5f3ef] text-[#7d6b4c] px-2 py-0.5 rounded-lg font-mono font-semibold">
                {keyChanged ? (
                  <>
                    <span>{song.originalKey}</span>
                    <ArrowRight size={10} />
                    <span className="text-amber-600">{song.performKey}</span>
                    <span className="text-amber-500">⚠</span>
                  </>
                ) : (
                  <span>{song.originalKey}</span>
                )}
              </span>
            )}
            {song.tempo && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#f5f3ef] text-[#7d6b4c] px-2 py-0.5 rounded-lg">
                <Gauge size={10} /> {song.tempo}
              </span>
            )}
            {song.timeSignature && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#f5f3ef] text-[#7d6b4c] px-2 py-0.5 rounded-lg">
                <Clock size={10} /> {song.timeSignature}
              </span>
            )}
            {keyChanged && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold">
                KEY CHANGE
              </span>
            )}
            {allLinks.some(l => /youtube|youtu\.be/.test(l.url)) && (
              <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-lg">
                <Youtube size={10} />
              </span>
            )}
            {allLinks.some(l => /spotify/.test(l.url)) && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-lg">
                <Headphones size={10} />
              </span>
            )}
            {(song.progressions?.length > 0) && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg">
                <Hash size={10} /> {song.progressions.length}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={() => onEdit(song)}
            className="p-2 hover:bg-black/5 rounded-xl text-gray-400 hover:text-gray-700 transition-colors"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onDelete(song.id)}
            className="p-2 hover:bg-red-50 rounded-xl text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expand toggle */}
      {hasDetails && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-black/5 text-xs text-gray-400 hover:text-gray-600 hover:bg-black/2 transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide details' : 'Show details'}
          </button>

          {expanded && (
            <div className="px-4 pb-4 pt-2 space-y-4 border-t border-black/5">

              {/* Chords */}
              {song.chords && (
                <div>
                  <div className="section-label flex items-center gap-1.5">
                    <Music2 size={10} /> Chords
                  </div>
                  <pre className="text-xs font-mono bg-[#f5f3ef] rounded-xl p-3 overflow-x-auto leading-relaxed text-[#3f3526] whitespace-pre-wrap">
                    {song.chords}
                  </pre>
                </div>
              )}

              {/* Progressions */}
              {song.progressions?.length > 0 && (
                <div>
                  <div className="section-label flex items-center gap-1.5">
                    <Hash size={10} /> Number System
                  </div>
                  <div className="space-y-1.5">
                    {song.progressions.map(prog => (
                      <div key={prog.id} className="flex gap-2 bg-[#f5f3ef] rounded-xl px-3 py-2">
                        {prog.label && (
                          <span className="text-xs font-bold text-[#9c8866] uppercase tracking-wide shrink-0 pt-0.5">
                            {prog.label}:
                          </span>
                        )}
                        <span className="text-xs font-mono text-[#3f3526]">{prog.pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {song.notes && (
                <div>
                  <div className="section-label">Performance Notes</div>
                  <p className="text-sm text-[#5e4f38] italic bg-amber-50/50 rounded-xl px-3 py-2 border border-amber-100">
                    {song.notes}
                  </p>
                </div>
              )}

              {/* Media */}
              {allLinks.length > 0 && (
                <div>
                  <div className="section-label">Media</div>
                  {allLinks.map(link => (
                    <MediaLink key={link.id} link={link} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
