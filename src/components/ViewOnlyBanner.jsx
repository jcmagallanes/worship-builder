import React from 'react'
import { Eye, ExternalLink } from 'lucide-react'

export default function ViewOnlyBanner({ setTitle, updatedAt }) {
  const formatted = updatedAt
    ? new Date(updatedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
    : null

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2.5 no-print">
      <Eye size={14} className="text-blue-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-blue-800">View Only</span>
        {formatted && (
          <span className="text-xs text-blue-500 ml-2">Last updated {formatted}</span>
        )}
      </div>
      <a
        href={window.location.origin + window.location.pathname}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline shrink-0"
      >
        Open app <ExternalLink size={11} />
      </a>
    </div>
  )
}
