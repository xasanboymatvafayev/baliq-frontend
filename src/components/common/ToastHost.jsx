import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore.js'

const CFG = {
  success: { icon:CheckCircle2, color:'#10b981', bg:'rgba(16,185,129,0.08)', border:'rgba(16,185,129,0.2)' },
  error:   { icon:XCircle,      color:'#ef4444', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.2)' },
  info:    { icon:Info,         color:'#0ea5e9', bg:'rgba(14,165,233,0.08)',  border:'rgba(14,165,233,0.2)' },
}

export function ToastHost() {
  const toasts = useToastStore(s => s.toasts)
  const dismiss = useToastStore(s => s.dismissToast)
  useEffect(()=>{
    const timers = toasts.map(t => window.setTimeout(()=>dismiss(t.id), 4000))
    return ()=>timers.forEach(window.clearTimeout)
  },[toasts, dismiss])

  return (
    <div style={{ position:'fixed', top:16, right:16, zIndex:999, display:'flex', flexDirection:'column', gap:8, width:320, maxWidth:'calc(100vw - 32px)' }}>
      {toasts.map(toast=>{
        const cfg = CFG[toast.variant] || CFG.info
        const Icon = cfg.icon
        return (
          <div key={toast.id} className="animate-toast-in" style={{
            display:'flex', alignItems:'flex-start', gap:12, padding:'14px 16px',
            borderRadius:14, border:`1px solid ${cfg.border}`,
            background:'var(--surface)', backdropFilter:'blur(20px)',
            boxShadow:'0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <div style={{ width:34, height:34, borderRadius:9, background:cfg.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon style={{ width:17, height:17, color:cfg.color }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-1)', lineHeight:1.3 }}>{toast.title}</p>
              {toast.description && <p style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>{toast.description}</p>}
            </div>
            <button onClick={()=>dismiss(toast.id)} style={{ flexShrink:0, width:24, height:24, borderRadius:6, border:'none', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', transition:'all 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <X style={{ width:14, height:14 }}/>
            </button>
          </div>
        )
      })}
    </div>
  )
}
