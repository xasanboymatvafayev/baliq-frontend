import { ImageUp } from 'lucide-react'

export function FileUpload({ label, register, name, error }) {
  return (
    <div className="block">
      <label className={`block rounded-3xl border border-dashed ${error ? 'border-rose-400' : 'border-slate-300'} bg-slate-50 p-5 text-center transition hover:border-ocean-400 dark:border-white/10 dark:bg-white/5 cursor-pointer`}>
        <ImageUp className="mx-auto h-8 w-8 text-ocean-600" />
        <span className="mt-3 block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs text-slate-500">PNG, JPG yoki PDF fayl yuklang</span>
        <input type="file" className="hidden" accept="image/*,.pdf" {...register(name)} />
      </label>
      {error && <span className="mt-2 block text-xs font-medium text-rose-500">{error}</span>}
    </div>
  )
}
