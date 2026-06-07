import { cn } from '../../utils/cn.js'

export function FormInput({ label, error, className, ...props }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <input className="soft-input" {...props} />
      {error ? <span className="mt-2 block text-xs font-medium text-rose-500">{error}</span> : null}
    </label>
  )
}
