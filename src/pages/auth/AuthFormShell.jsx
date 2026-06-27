import { Link } from 'react-router-dom'

export function AuthFormShell({ title, description, children, footer }) {
  return (
    <div className="animate-scale-in">
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:24, fontWeight:800, color:'#f0f6ff', letterSpacing:'-0.02em', margin:0 }}>{title}</h2>
        {description && <p style={{ marginTop:6, fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>{description}</p>}
      </div>

      <div>{children}</div>

      {footer && (
        <div style={{ marginTop:20, textAlign:'center', fontSize:13.5, color:'rgba(255,255,255,0.38)' }}>{footer}</div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:16 }}>
        {[
          { to:'/farm-registration',   emoji:'🏡', label:"Ferma ro'yxati" },
          { to:'/driver-registration', emoji:'🚚', label:"Haydovchi ro'yxati" },
        ].map(({to,emoji,label})=>(
          <Link key={to} to={to} style={{
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            padding:'9px 12px', borderRadius:10,
            border:'1px solid rgba(255,255,255,0.08)',
            background:'rgba(255,255,255,0.04)',
            fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.38)',
            textDecoration:'none', transition:'all 0.15s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(14,165,233,0.08)';e.currentTarget.style.borderColor='rgba(14,165,233,0.2)';e.currentTarget.style.color='rgba(255,255,255,0.7)'}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.color='rgba(255,255,255,0.38)'}}
          >
            {emoji} {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
