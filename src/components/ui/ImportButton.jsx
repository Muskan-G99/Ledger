import { Upload } from 'lucide-react'
import { useRef } from 'react'

export default function ImportButton({ label = 'Import CSV', onFile }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = ''
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
      >
        <Upload className="h-3.5 w-3.5" />
        {label}
      </button>
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleChange} />
    </>
  )
}
