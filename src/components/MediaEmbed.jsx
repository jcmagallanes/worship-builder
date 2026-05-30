import React, { useState } from 'react'
import { ExternalLink, Youtube, Music2, ChevronDown, ChevronUp } from 'lucide-react'

function getYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function getSpotifyEmbed(url) {
  // Convert to embed URL
  const match = url.match(/spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/)
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}`
  }
  return null
}

function isYouTube(url) {
  return /youtube\.com|youtu\.be/.test(url)
}

function isSpotify(url) {
  return /spotify\.com/.test(url)
}

export function MediaLink({ link }) {
  const [expanded, setExpanded] = useState(false)

  const ytId = isYouTube(link.url) ? getYouTubeId(link.url) : null
  const spotifyEmbed = isSpotify(link.url) ? getSpotifyEmbed(link.url) : null
  const canEmbed = ytId || spotifyEmbed

  return (
    <div className="border border-black/8 rounded-xl overflow-hidden mb-2">
      {/* Link row */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white">
        {isYouTube(link.url) ? (
          <Youtube size={14} className="text-red-500 shrink-0" />
        ) : isSpotify(link.url) ? (
          <Music2 size={14} className="text-green-500 shrink-0" />
        ) : (
          <ExternalLink size={14} className="text-gray-400 shrink-0" />
        )}
        <span className="text-sm text-[#3b5bdb] flex-1 truncate">
          {link.label || link.url}
        </span>
        <div className="flex items-center gap-1">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400"
            title="Open in new tab"
          >
            <ExternalLink size={13} />
          </a>
          {canEmbed && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-black/5 text-gray-400"
              title={expanded ? 'Hide player' : 'Show player'}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Embedded player */}
      {expanded && canEmbed && (
        <div className="p-2 bg-black/3">
          {ytId && (
            <div className="yt-embed rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=0`}
                title={link.label || 'YouTube'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl"
              />
            </div>
          )}
          {spotifyEmbed && !ytId && (
            <iframe
              src={spotifyEmbed}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl"
              title={link.label || 'Spotify'}
            />
          )}
        </div>
      )}
    </div>
  )
}
