import React, { useState, useRef, useEffect } from 'react'
import { Download, FileText, Table, FileSpreadsheet, ChevronDown, Loader2 } from 'lucide-react'
import { exportToPDF, exportToXLS, exportToDOCX } from '../utils/exportUtils'

export default function ExportMenu({ songs, setTitle }) {
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
        className="flex items-center gap-1.5 bg-white border border-black/15 text-sm font-medium px-3 py-2.5 rounded-xl hover:bg-black/3 disabled:opacity-40 transition-all active:scale-95"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Export
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden z-50 w-48">
          <div className="p-1.5">
            <button
              onClick={() => handle('pdf')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f5f3ef] text-sm text-left transition-colors"
            >
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                <FileText size={14} className="text-red-500" />
              </div>
              <div>
                <div className="font-medium text-sm">PDF</div>
                <div className="text-xs text-gray-400">Print-ready</div>
              </div>
            </button>

            <button
              onClick={() => handle('docx')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f5f3ef] text-sm text-left transition-colors"
            >
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileSpreadsheet size={14} className="text-blue-500" />
              </div>
              <div>
                <div className="font-medium text-sm">Word (DOCX)</div>
                <div className="text-xs text-gray-400">Editable document</div>
              </div>
            </button>

            <button
              onClick={() => handle('xlsx')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f5f3ef] text-sm text-left transition-colors"
            >
              <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                <Table size={14} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Excel (XLSX)</div>
                <div className="text-xs text-gray-400">Spreadsheet</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
