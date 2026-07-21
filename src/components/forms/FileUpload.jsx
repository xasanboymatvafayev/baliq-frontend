import { ImageUp, X } from 'lucide-react'
import { useState } from 'react'

export function FileUpload({ label, register, name, error, onChange }) {
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
    if (onChange) onChange(e)
  }

  return (
    <div className="block">
      <label className={`block rounded-3xl border border-dashed ${error ? 'border-rose-400' : 'border-slate-300'} bg-slate-50 p-5 text-center transition hover:border-ocean-400 dark:border-white/10 dark:bg-white/5 cursor-pointer`}>
        <ImageUp className="mx-auto h-8 w-8 text-ocean-600" />
        <span className="mt-3 block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs text-slate-500">PNG, JPG yoki PDF fayl yuklang</span>
        <input type="file" className="hidden" accept="image/*,.pdf" {...register(name)} onChange={handleFileChange} />
      </label>
      {preview && (
        <div className="mt-3 relative inline-block">
          <img src={preview} alt="Preview" className="h-24 w-24 rounded-2xl object-cover border border-slate-200 dark:border-white/10" />
          <button
            type="button"
            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg"
            onClick={() => setPreview(null)}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {error && <span className="mt-2 block text-xs font-medium text-rose-500">{error}</span>}
    </div>
  )
}
