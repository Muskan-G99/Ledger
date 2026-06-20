import { Upload } from 'lucide-react'
import { useRef } from 'react'

export default function ImportButton({ label = 'Import CSV', onFile, multiple = true, accept = '.csv' }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach((file) => onFile(file))
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
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
    </>
  )
}
