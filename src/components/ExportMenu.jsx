import React, { useState, useRef, useEffect } from 'react'
import { Download, FileText, Table, FileSpreadsheet, Loader2 } from 'lucide-react'
import { exportToPDF, exportToXLS, exportToDOCX } from '../utils/exportUtils'

export default function ExportMenu({ songs, setTitle, iconOnly = false }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(null)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handle = async (type) => {
    setLoading(type)
    setOpen(false)
    try {
      if (type === 'pdf') exportToPDF(songs, setTitle)
      else if (type === 'xlsx') exportToXLS(songs, setTitle)
      else if (type === 'docx') await exportToDOCX(songs, setTitle)
    } catch (e) {
      console.error('Export error:', e)
      alert(`Export failed: ${e.message}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={songs.length === 0}
        title="Export"
        className={`
          flex items-center justify-center active:scale-90 transition-all disabled:opacity-40
          ${iconOnly
            ? 'w-10 h-10 rounded-2xl hover:bg-[#f5f3ef] text-[#241e16]'
            : 'gap-1.5 bg-white border border-black/15 text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-black/3'
          }
        `}
      >
        {loading ? <Loader2 size={iconOnly ? 20 : 14} className="animate-spin" /> : <Download size={iconOnly ? 20 : 14} />}
        {!iconOnly && 'Export'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden z-50 w-52">
          <div className="p-1.5">
            {[
              { type: 'pdf', icon: FileText, color: 'text-red-500 bg-red-50', label: 'PDF', sub: 'Print-ready' },
              { type: 'docx', icon: FileSpreadsheet, color: 'text-blue-500 bg-blue-50', label: 'Word (DOCX)', sub: 'Editable doc' },
              { type: 'xlsx', icon: Table, color: 'text-green-600 bg-green-50', label: 'Excel (XLSX)', sub: 'Spreadsheet' },
            ].map(({ type, icon: Icon, color, label, sub }) => (
              <button
                key={type}
                onClick={() => handle(type)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f5f3ef] text-left transition-colors active:scale-[0.98]"
              >
                <div className={`w-8 h-8 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={15} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#241e16]">{label}</div>
                  <div className="text-xs text-gray-400">{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
