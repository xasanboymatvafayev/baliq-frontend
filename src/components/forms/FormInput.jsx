import { forwardRef } from 'react'

export const FormInput = forwardRef(function FormInput({ label, error, className, ...props }, ref) {
  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-[13px] font-semibold text-white/70">{label}</label>}
      <input ref={ref} className="soft-input" {...props} />
      {error && <p className="mt-1.5 text-[12px] font-medium text-rose-400">{error}</p>}
    </div>
  )
})
