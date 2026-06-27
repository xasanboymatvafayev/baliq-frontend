import { Link, Outlet } from 'react-router-dom'
import { Fish, Zap, Shield, TrendingUp, Waves, Star } from 'lucide-react'

const FEATURES = [
  { icon:Zap,        t:'Real-vaqt',  d:"Buyurtmalarni jonli kuzating" },
  { icon:Shield,     t:'Xavfsiz',    d:"To'lovlar himoyalangan" },
  { icon:TrendingUp, t:'Analitika',  d:'Kuchli hisobot paneli' },
  { icon:Waves,      t:'GPS',        d:'Navigatsiya va yetkazish' },
]
const STATS = [
  { v:'500+', l:'Fermalar' },
  { v:'12K+', l:'Mijozlar' },
  { v:'98%',  l:'Mamnunlik' },
]

export function AuthLayout() {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#04080f 0%,#071220 60%,#050c18 100%)', position:'relative', overflow:'hidden' }}>

      {/* BG glows */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-200, left:-200, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:-100, right:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'28px 28px' }}/>
      </div>

      <div style={{ position:'relative', zIndex:1, display:'grid', minHeight:'100vh', gridTemplateColumns:'1fr 460px' }} className="lg:grid block">

        {/* ── LEFT ── */}
        <section className="hidden lg:flex" style={{ flexDirection:'column', justifyContent:'space-between', padding:'48px 56px' }}>

          {/* Logo */}
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:12, textDecoration:'none' }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#0ea5e9,#0284c7)', boxShadow:'0 4px 20px rgba(14,165,233,0.45)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <Fish style={{ width:20, height:20, color:'#fff' }}/>
              <span style={{ position:'absolute', top:-3, right:-3, width:10, height:10, borderRadius:'50%', background:'#34d399', border:'2px solid #04080f' }} className="animate-pulse-soft"/>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:'#f0f6ff' }}>Baliq Savdosi</p>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Enterprise Platform</p>
            </div>
          </Link>

          {/* Hero */}
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:99, background:'rgba(14,165,233,0.1)', border:'1px solid rgba(14,165,233,0.2)', marginBottom:24 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#34d399' }} className="animate-pulse-soft"/>
              <span style={{ fontSize:12, fontWeight:600, color:'#38bdf8' }}>O'zbekistonning №1 baliq savdo platformasi</span>
            </div>

            <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.05, color:'#f0f6ff', letterSpacing:'-0.02em', margin:0 }}>
              Ferma, logistika{' '}
              <span style={{ background:'linear-gradient(135deg,#38bdf8,#34d399)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                va savdoni
              </span>
              {' '}bitta panelda.
            </h1>

            <p style={{ fontSize:15, color:'rgba(255,255,255,0.38)', marginTop:16, lineHeight:1.65, maxWidth:480 }}>
              Mijoz, Fermer, Haydovchi va Admin rollari uchun professional boshqaruv tizimi. Real-vaqt kuzatuv, GPS logistika va kuchli analitika.
            </p>

            {/* Stats row */}
            <div style={{ display:'flex', alignItems:'center', gap:32, marginTop:32 }}>
              {STATS.map(s=>(
                <div key={s.l}>
                  <p style={{ fontSize:26, fontWeight:800, color:'#f0f6ff', lineHeight:1 }}>{s.v}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{s.l}</p>
                </div>
              ))}
              <div style={{ width:1, height:40, background:'rgba(255,255,255,0.08)' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                {[1,2,3,4,5].map(i=><Star key={i} style={{ width:14, height:14, fill:'#fbbf24', color:'#fbbf24' }}/>)}
              </div>
            </div>

            {/* Feature grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:28 }}>
              {FEATURES.map(({icon:Icon,t,d})=>(
                <div key={t} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(14,165,233,0.06)';e.currentTarget.style.borderColor='rgba(14,165,233,0.15)'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'}}
                >
                  <div style={{ width:34, height:34, borderRadius:9, background:'rgba(14,165,233,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon style={{ width:16, height:16, color:'#38bdf8' }}/>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.85)' }}>{t}</p>
                    <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize:11, color:'rgba(255,255,255,0.18)' }}>© 2025 Baliq Savdosi · React 19 · FastAPI · MongoDB</p>
        </section>

        {/* ── RIGHT (Form) ── */}
        <section style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:24, minHeight:'100vh', background:'rgba(255,255,255,0.02)', backdropFilter:'blur(40px)', borderLeft:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width:'100%', maxWidth:390 }}>

            {/* Mobile logo */}
            <div className="lg:hidden" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#0ea5e9,#0284c7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Fish style={{ width:17, height:17, color:'#fff' }}/>
              </div>
              <span style={{ fontSize:15, fontWeight:700, color:'#f0f6ff' }}>Baliq Savdosi</span>
            </div>

            {/* Card */}
            <div style={{ padding:32, borderRadius:22, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', backdropFilter:'blur(20px)', boxShadow:'0 24px 64px rgba(0,0,0,0.45)' }}>
              <Outlet/>
            </div>

            <p style={{ marginTop:16, textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.2)' }}>
              Platformaga kirib, foydalanish shartlariga rozilik bildirasiz.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
