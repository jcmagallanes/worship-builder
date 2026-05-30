import React, { useState } from 'react'
import { X, Link2, Copy, Check, Eye, Edit3, Upload, AlertCircle, Loader2, Share2 } from 'lucide-react'
import { createSet, updateSet, isSupabaseConfigured } from '../utils/supabase'

export default function ShareModal({ songs, setTitle, shareState, onShareStateChange, onClose }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(null) // 'view' | 'edit'
  const [error, setError] = useState(null)

  const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '')
  const viewUrl = shareState?.setId ? `${baseUrl}#/set/${shareState.setId}` : null
  const editUrl = shareState?.setId && shareState?.editToken
    ? `${baseUrl}#/set/${shareState.setId}?edit=${shareState.editToken}`
    : null

  const configured = isSupabaseConfigured()

  const handlePublish = async () => {
    setLoading(true)
    setError(null)
    try {
      if (shareState?.setId && shareState?.editToken) {
        // Update existing
        await updateSet(shareState.setId, shareState.editToken, { title: setTitle, songs })
        // links stay the same
      } else {
        // Create new
        const { id, edit_token } = await createSet({ title: setTitle, songs })
        onShareStateChange({ setId: id, editToken: edit_token })
      }
    } catch (e) {
      setError(e.message || 'Failed to publish. Check your Supabase config.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content bg-white w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-black/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/8">
          <div className="flex items-center gap-2">
            <Share2 size={16} />
            <h2 className="font-display font-bold text-lg">Share Set</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-xl">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">

          {/* Not configured warning */}
          {!configured && (
            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Supabase not connected</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Add your <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to enable cloud sharing. See README for setup.
                </p>
              </div>
            </div>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={!configured || loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Publishing…</>
            ) : shareState?.setId ? (
              <><Upload size={15} /> Update Shared Set</>
            ) : (
              <><Upload size={15} /> Publish & Get Share Links</>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Share links */}
          {viewUrl && (
            <div className="space-y-3">
              <div className="section-label">Share Links</div>

              {/* View link */}
              <div className="bg-[#f5f3ef] rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Eye size={13} className="text-blue-500" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">View Only</span>
                  <span className="text-xs text-gray-400">— for band members</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    className="flex-1 text-xs bg-white border border-black/10 rounded-xl px-3 py-2 font-mono truncate"
                    value={viewUrl}
                  />
                  <button
                    onClick={() => copyToClipboard(viewUrl, 'view')}
                    className="p-2.5 bg-white border border-black/10 rounded-xl hover:bg-black/5 shrink-0 transition-colors"
                  >
                    {copied === 'view' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Edit link */}
              {editUrl && (
                <div className="bg-[#f5f3ef] rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Edit3 size={13} className="text-orange-500" />
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Edit Link</span>
                    <span className="text-xs text-gray-400">— for worship leaders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      className="flex-1 text-xs bg-white border border-black/10 rounded-xl px-3 py-2 font-mono truncate"
                      value={editUrl}
                    />
                    <button
                      onClick={() => copyToClipboard(editUrl, 'edit')}
                      className="p-2.5 bg-white border border-black/10 rounded-xl hover:bg-black/5 shrink-0 transition-colors"
                    >
                      {copied === 'edit' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 flex items-center gap-1.5">
                    <AlertCircle size={11} />
                    Keep this link private — anyone with it can edit your set
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 text-center">
                Changes sync in real-time for everyone viewing the link
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
