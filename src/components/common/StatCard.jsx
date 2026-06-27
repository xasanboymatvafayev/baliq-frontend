const TONES = {
  ocean:   { g:'linear-gradient(135deg,#0ea5e9,#0284c7)', glow:'rgba(14,165,233,0.22)', soft:'rgba(14,165,233,0.08)', text:'#0ea5e9' },
  emerald: { g:'linear-gradient(135deg,#10b981,#059669)', glow:'rgba(16,185,129,0.22)', soft:'rgba(16,185,129,0.08)', text:'#10b981' },
  amber:   { g:'linear-gradient(135deg,#f59e0b,#d97706)', glow:'rgba(245,158,11,0.22)',  soft:'rgba(245,158,11,0.08)',  text:'#f59e0b' },
  rose:    { g:'linear-gradient(135deg,#f43f5e,#e11d48)', glow:'rgba(244,63,94,0.22)',   soft:'rgba(244,63,94,0.08)',   text:'#f43f5e' },
  purple:  { g:'linear-gradient(135deg,#8b5cf6,#7c3aed)', glow:'rgba(139,92,246,0.22)',  soft:'rgba(139,92,246,0.08)',  text:'#8b5cf6' },
}

export function StatCard({ title, value='—', description, icon:Icon, tone='ocean', trend }) {
  const t = TONES[tone] || TONES.ocean
  return (
    <article
      className="glass-card"
      style={{ padding:20, cursor:'default', userSelect:'none' }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16 }}>
        {/* Icon */}
        <div style={{
          width:44, height:44, borderRadius:12, flexShrink:0,
          background:t.g, boxShadow:`0 4px 14px ${t.glow}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', transition:'transform 0.2s',
        }}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1) rotate(-4deg)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1) rotate(0)'}
        >
          {Icon && <Icon style={{ width:20, height:20 }}/>}
        </div>

        {/* Trend */}
        {trend!=null && (
          <div style={{ padding:'4px 10px', borderRadius:99, background:t.soft, color:t.text, fontSize:12, fontWeight:700 }}>
            {trend>0?'+':''}{trend}%
          </div>
        )}
      </div>

      <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', marginBottom:4 }}>{title}</p>
      <p style={{ fontSize:30, fontWeight:800, color:'var(--text-1)', lineHeight:1.1, letterSpacing:'-0.02em' }}>{value}</p>
      {description && <p style={{ fontSize:13, color:'var(--text-3)', marginTop:4 }}>{description}</p>}

      {/* Accent bottom */}
      <div style={{ marginTop:16, height:2, borderRadius:99, background:t.g, opacity:0.35 }}/>
    </article>
  )
}
