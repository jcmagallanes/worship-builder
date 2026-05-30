import React from 'react'
import { Type } from 'lucide-react'

const SIZES = [
  { key: 'small',  label: 'A', style: { fontSize: 13 } },
  { key: 'medium', label: 'A', style: { fontSize: 16 } },
  { key: 'large',  label: 'A', style: { fontSize: 20 } },
]

export default function FontSizeToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-[#f5f3ef] border border-black/10 rounded-xl p-1">
      {SIZES.map(s => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          style={s.style}
          title={`Font: ${s.key}`}
          className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all leading-none
            ${value === s.key
              ? 'bg-[#241e16] text-white shadow-sm'
              : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          A
        </button>
      ))}
    </div>
  )
}
