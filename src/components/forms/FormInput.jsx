import { forwardRef } from 'react'

export const FormInput = forwardRef(function FormInput({ label, error, className, ...props }, ref) {
  return (
    <div className={className} style={{ display:'block' }}>
      {label && <label style={{ display:'block', fontSize:13, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>{label}</label>}
      <input
        ref={ref}
        className="soft-input"
        {...props}
      />
      {error && <p style={{ marginTop:5, fontSize:12, fontWeight:500, color:'#ef4444' }}>{error}</p>}
    </div>
  )
})
