import { useState, useRef, useEffect } from 'react'
import { Menu, Search, X, Fish, Store, ExternalLink } from 'lucide-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../common/ThemeToggle.jsx'
import { NotificationBell } from '../common/NotificationBell.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/index.js'

function useDebounce(v, d=350){ const[s,set]=useState(v); useEffect(()=>{ const t=setTimeout(()=>set(v),d); return()=>clearTimeout(t) },[v,d]); return s }

function SearchBox({ query, onClose, role }) {
  const navigate = useNavigate()
  const [r, setR] = useState({ fish:[], farms:[] })
  const [loading, setLoading] = useState(false)
  const q = useDebounce(query)
  const isCustomer = ['customer','farm-owner'].includes(role)

  useEffect(()=>{
    if(!q||q.length<2){ setR({fish:[],farms:[]}); return }
    setLoading(true)
    Promise.allSettled([
      httpClient.get(`/fish?search=${encodeURIComponent(q)}&limit=5`),
      httpClient.get(`/farms?search=${encodeURIComponent(q)}&status=APPROVED&limit=4`),
    ]).then(([fr,ar])=>{
      const f=fr.status==='fulfilled'?(Array.isArray(fr.value)?fr.value:fr.value?.data||fr.value?.fish||[]):[]
      const a=ar.status==='fulfilled'?(Array.isArray(ar.value)?ar.value:ar.value?.data||ar.value?.farms||[]):[]
      setR({ fish:f.slice(0,5), farms:a.slice(0,4) })
    }).finally(()=>setLoading(false))
  },[q])

  const total = r.fish.length + r.farms.length
  const go = path => { navigate(path); onClose() }

  return (
    <div className="animate-scale-in" style={{
      position:'absolute', top:'calc(100% + 8px)', left:0, right:0, zIndex:60,
      background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
      maxHeight:'65vh', overflowY:'auto',
    }}>
      {loading && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px' }}>
          <div style={{ width:16, height:16, border:'2px solid var(--brand)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
          <span style={{ fontSize:13, color:'var(--text-3)' }}>Qidirilmoqda...</span>
        </div>
      )}
      {!loading && q.length>=2 && total===0 && (
        <div style={{ padding:'28px 16px', textAlign:'center', color:'var(--text-3)', fontSize:13 }}>"{q}" bo'yicha hech narsa topilmadi</div>
      )}
      {!loading && r.fish.length>0 && (<>
        <p style={{ padding:'12px 16px 6px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)' }}>Baliqlar</p>
        {r.fish.map(fish=>(
          <button key={fish.id} onClick={()=>go(isCustomer?`/customer/product/${fish.id}`:'/farm/fish')}
            style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 16px', border:'none', background:'transparent', cursor:'pointer', textAlign:'left', transition:'background 0.1s' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            {fish.image_url
              ? <img src={fish.image_url} alt={fish.name} style={{ width:36,height:36,borderRadius:9,objectFit:'cover',flexShrink:0 }}/>
              : <div style={{ width:36,height:36,borderRadius:9,background:'rgba(14,165,233,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Fish style={{width:16,height:16,color:'#0ea5e9'}}/></div>}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fish.name}</p>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>{fish.price?.toLocaleString()} so'm/kg</p>
            </div>
            <ExternalLink style={{ width:14, height:14, color:'var(--text-3)', flexShrink:0 }}/>
          </button>
        ))}
      </>)}
      {!loading && r.farms.length>0 && (<>
        <p style={{ padding:'12px 16px 6px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-3)', borderTop: r.fish.length?'1px solid var(--border-2)':'none', marginTop: r.fish.length?6:0 }}>Fermalar</p>
        {r.farms.map(farm=>(
          <button key={farm.id} onClick={()=>go('/customer/farms')}
            style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 16px', border:'none', background:'transparent', cursor:'pointer', textAlign:'left', transition:'background 0.1s' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <div style={{ width:36,height:36,borderRadius:9,background:'rgba(16,185,129,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Store style={{width:16,height:16,color:'#10b981'}}/></div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text-1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{farm.farmName||farm.name}</p>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>{farm.region}, {farm.district}</p>
            </div>
          </button>
        ))}
      </>)}
      {!loading && total>0 && isCustomer && (
        <button onClick={()=>go('/customer/fish-catalog')} style={{ width:'100%', padding:'12px 16px', border:'none', borderTop:'1px solid var(--border-2)', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:600, color:'var(--brand)', textAlign:'center', fontFamily:'inherit', transition:'background 0.1s' }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}
        >Barcha katalogni ko'rish →</button>
      )}
    </div>
  )
}

export function Topbar({ onMenuClick, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore(s=>s.logout)
  const user = useAuthStore(s=>s.user)
  const role = useAuthStore(s=>s.role)
  const pushToast = useToastStore(s=>s.pushToast)
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef(null)

  useEffect(()=>{ setQ(''); setFocused(false) },[location.pathname])
  useEffect(()=>{
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setFocused(false) }
    document.addEventListener('mousedown',h); return()=>document.removeEventListener('mousedown',h)
  },[])

  const profileRoutes = { customer:'/customer/profile','farm-owner':'/farm/profile',driver:'/driver/profile',admin:'/admin/settings',manager:'/manager/dashboard','super-admin':'/super-admin/system-settings' }
  const initials = user ? `${user.firstName?.[0]||''}${user.lastName?.[0]||''}`.toUpperCase() : 'BS'
  const [c1,c2] = { customer:['#0ea5e9','#0284c7'],'farm-owner':['#10b981','#059669'],driver:['#f59e0b','#d97706'],admin:['#8b5cf6','#7c3aed'],manager:['#ec4899','#db2777'],'super-admin':['#f43f5e','#e11d48'] }[role] || ['#0ea5e9','#0284c7']

  return (
    <header style={{
      position:'sticky', top:0, zIndex:20,
      display:'flex', alignItems:'center', gap:12,
      padding:'0 20px', height:60,
      background:'rgba(246,248,252,0.9)',
      backdropFilter:'blur(24px)',
      borderBottom:'1px solid var(--border)',
    }}
    className="dark:[background:rgba(5,9,20,0.92)]"
    >
      {/* Hamburger */}
      <button onClick={onMenuClick} className="lg:hidden" style={{
        width:36, height:36, borderRadius:10, border:'1px solid var(--border)',
        background:'var(--surface)', color:'var(--text-2)',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', flexShrink:0, transition:'all 0.15s',
      }}>
        <Menu style={{ width:17, height:17 }} />
      </button>

      {/* Title */}
      <h1 style={{ fontSize:16, fontWeight:700, color:'var(--text-1)', flexShrink:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }} className="hidden sm:block">{title}</h1>

      {/* Search */}
      <div ref={ref} style={{ position:'relative', flex:1, maxWidth:320, marginLeft:'auto' }}>
        <Search style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:15, height:15, color:'var(--text-3)', pointerEvents:'none', zIndex:1 }}/>
        <input
          value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)}
          placeholder="Qidirish..."
          style={{
            height:36, width:'100%', paddingLeft:34, paddingRight:32,
            borderRadius:10, border:'1.5px solid var(--border)',
            background:'var(--surface)', color:'var(--text-1)',
            fontSize:13.5, fontFamily:'inherit', outline:'none',
            transition:'all 0.15s',
          }}
          onFocus={e=>{ e.target.style.borderColor='var(--brand)'; e.target.style.boxShadow='0 0 0 3px var(--brand-glow)' }}
          onBlur={e=>{ e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }}
        />
        {q && <button onClick={()=>{setQ('');setFocused(false)}} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:18, height:18, borderRadius:'50%', border:'none', background:'var(--surface-2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X style={{ width:11, height:11, color:'var(--text-3)' }}/>
        </button>}
        {focused && q.length>=2 && <SearchBox query={q} onClose={()=>{setQ('');setFocused(false)}} role={role}/>}
      </div>

      {/* Right */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <ThemeToggle/>
        <NotificationBell/>
        <Link to={profileRoutes[role]||'/customer/profile'} style={{
          width:36, height:36, borderRadius:10, flexShrink:0,
          background:`linear-gradient(135deg,${c1},${c2})`,
          boxShadow:`0 2px 10px ${c1}44`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:700, color:'#fff', textDecoration:'none',
          transition:'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.07)'; e.currentTarget.style.boxShadow=`0 4px 16px ${c1}55`}}
        onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow=`0 2px 10px ${c1}44`}}
        >{initials}</Link>
      </div>
    </header>
  )
}
