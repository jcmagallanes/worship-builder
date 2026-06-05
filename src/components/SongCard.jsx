import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Edit2, Trash2, Copy, ChevronDown, ChevronUp,
  Music2, Hash, Youtube, Headphones, ArrowRight, Clock, Gauge, Presentation
} from 'lucide-react'
import { MediaLink } from './MediaEmbed'

export default function SongCard({ song, index, onEdit, onDelete, onDuplicate, onPresent, readOnly = false }) {
  const [expanded, setExpanded] = useState(false)

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: song.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  }

  const keyChanged = song.performKey && song.originalKey && song.performKey !== song.originalKey
  const allLinks = [...(song.youtubeLinks || []), ...(song.spotifyLinks || [])]
  const hasDetails = song.chords || (song.progressions?.length > 0) || song.notes || allLinks.length > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`song-card card mb-3 ${isDragging ? 'shadow-2xl' : ''}`}
    >
      {/* Main row */}
      <div className="flex items-stretch gap-0">

        {/* Drag handle — left strip */}
        {!readOnly ? (
          <button
            className="drag-handle flex items-center justify-center w-10 shrink-0 text-gray-200 hover:text-gray-400 touch-none rounded-l-2xl hover:bg-black/3 transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={18} />
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 py-4 pr-2">
          {/* Title row */}
          <div className="flex items-start gap-2 mb-1.5">
            <span className="text-sm font-bold text-gray-300 shrink-0 w-5 text-center mt-0.5">{index + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="font-bold text-base text-[#241e16] leading-snug flex-1 min-w-0">{song.title}</h3>
                <span className={`shrink-0 ${song.type === 'praise' ? 'tag-praise' : 'tag-worship'}`}>
                  {song.type === 'praise' ? '🔥' : '🕊'} {song.type}
                </span>
              </div>
              {song.artist && (
                <p className="text-sm text-gray-400 mt-0.5">{song.artist}</p>
              )}
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-1.5 ml-7">
            {song.originalKey && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#f5f3ef] text-[#7d6b4c] px-2.5 py-1 rounded-lg font-mono font-bold">
                {keyChanged ? (
                  <>
                    <span>{song.originalKey}</span>
                    <ArrowRight size={9} />
                    <span className="text-amber-600">{song.performKey}</span>
                    <span className="text-amber-500">⚠</span>
                  </>
                ) : song.originalKey}
              </span>
            )}
            {song.tempo && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#f5f3ef] text-[#7d6b4c] px-2.5 py-1 rounded-lg">
                <Gauge size={10} />{song.tempo}
              </span>
            )}
            {song.timeSignature && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#f5f3ef] text-[#7d6b4c] px-2.5 py-1 rounded-lg">
                <Clock size={10} />{song.timeSignature}
              </span>
            )}
            {keyChanged && (
              <span className="inline-flex items-center text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                KEY CHANGE
              </span>
            )}
            {allLinks.some(l => /youtube|youtu\.be/.test(l.url)) && (
              <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-lg">
                <Youtube size={10} />
              </span>
            )}
            {allLinks.some(l => /spotify/.test(l.url)) && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-lg">
                <Headphones size={10} />
              </span>
            )}
            {song.progressions?.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg">
                <Hash size={10} />{song.progressions.length}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons — right strip */}
        {!readOnly && (
          <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 shrink-0">
            <button
              onClick={() => onEdit(song)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#f5f3ef] text-gray-400 hover:text-[#241e16] transition-colors active:scale-90"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDuplicate(song)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-blue-50 text-gray-300 hover:text-blue-500 transition-colors active:scale-90"
              title="Duplicate"
            >
              <Copy size={16} />
            </button>
            {onPresent && (
              <button
                onClick={() => onPresent(songs ? index : 0)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-purple-50 text-gray-300 hover:text-purple-500 transition-colors active:scale-90"
                title="Present from here"
              >
                <Presentation size={16} />
              </button>
            )}
            <button
              onClick={() => onDelete(song.id)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors active:scale-90"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Expand toggle */}
      {hasDetails && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-black/5 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-black/2 transition-colors rounded-b-2xl"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide details' : 'Show details'}
          </button>

          {expanded && (
            <div className="px-4 pb-5 pt-3 space-y-4 border-t border-black/5">

              {song.chords && (
                <div>
                  <div className="section-label flex items-center gap-1.5 mb-2">
                    <Music2 size={10} /> Chords
                  </div>
                  <pre className="text-sm font-mono bg-[#f5f3ef] rounded-xl p-4 overflow-x-auto leading-relaxed text-[#3f3526] whitespace-pre-wrap">
                    {song.chords}
                  </pre>
                </div>
              )}

              {song.progressions?.length > 0 && (
                <div>
                  <div className="section-label flex items-center gap-1.5 mb-2">
                    <Hash size={10} /> Number System
                  </div>
                  <div className="space-y-2">
                    {song.progressions.map(prog => (
                      <div key={prog.id} className="flex gap-3 bg-[#f5f3ef] rounded-xl px-4 py-3">
                        {prog.label && (
                          <span className="text-xs font-bold text-[#9c8866] uppercase tracking-wide shrink-0 pt-0.5 w-14">
                            {prog.label}
                          </span>
                        )}
                        <span className="text-sm font-mono font-bold text-[#3f3526]">{prog.pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {song.notes && (
                <div>
                  <div className="section-label mb-2">Performance Notes</div>
                  <p className="text-sm text-[#5e4f38] italic bg-amber-50/60 rounded-xl px-4 py-3 border border-amber-100 leading-relaxed">
                    {song.notes}
                  </p>
                </div>
              )}

              {allLinks.length > 0 && (
                <div>
                  <div className="section-label mb-2">Media</div>
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
