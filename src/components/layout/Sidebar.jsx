import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Fish, X, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'

const ROLE_COLORS = {
  customer:     ['#0ea5e9','#0284c7'],
  'farm-owner': ['#10b981','#059669'],
  driver:       ['#f59e0b','#d97706'],
  admin:        ['#8b5cf6','#7c3aed'],
  manager:      ['#ec4899','#db2777'],
  'super-admin':['#f43f5e','#e11d48'],
}
const ROLE_LABELS = {
  customer:'Mijoz','farm-owner':'Ferma egasi',driver:'Haydovchi',
  admin:'Administrator',manager:'Menejer','super-admin':'Super Admin',
}

export function Sidebar({ navigation, open, onClose }) {
  const logout     = useAuthStore(s => s.logout)
  const user       = useAuthStore(s => s.user)
  const role       = useAuthStore(s => s.role)
  const pushToast  = useToastStore(s => s.pushToast)
  const navigate   = useNavigate()
  const location   = useLocation()

  const initials = user
    ? `${user.firstName?.[0]||''}${user.lastName?.[0]||''}`.toUpperCase()
    : 'BS'
  const [c1, c2] = ROLE_COLORS[role] || ['#0ea5e9','#0284c7']

  const handleLogout = () => {
    logout(); pushToast({ title:'Tizimdan chiqildi', variant:'success' })
    navigate('/login'); onClose?.()
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position:'fixed', inset:0, zIndex:30,
          background:'rgba(0,0,0,0.55)',
          backdropFilter:'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition:'opacity 0.25s ease',
        }}
        className="lg:hidden"
      />

      {/* Sidebar */}
      <aside style={{
        position:'fixed', top:0, left:0, bottom:0, zIndex:40,
        width:'var(--sidebar-w)',
        display:'flex', flexDirection:'column',
        background:'linear-gradient(180deg,#080f1d 0%,#05090f 100%)',
        borderRight:'1px solid rgba(255,255,255,0.06)',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition:'transform 0.28s cubic-bezier(0.16,1,0.3,1)',
      }}
      className="lg:static lg:translate-x-0"
      >

        {/* ── Logo ── */}
        <div style={{
          height:64, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 18px', borderBottom:'1px solid rgba(255,255,255,0.05)',
          flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:`linear-gradient(135deg,${c1},${c2})`,
              boxShadow:`0 4px 14px ${c1}55`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Fish style={{ width:18, height:18, color:'#fff' }} />
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:'#f0f6ff', lineHeight:1.2 }}>Baliq Savdosi</p>
              <p style={{ fontSize:10, fontWeight:500, color:'rgba(255,255,255,0.28)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Platform</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden" style={{ color:'rgba(255,255,255,0.3)', padding:4, borderRadius:8, transition:'color 0.15s' }}>
            <X style={{ width:18, height:18 }} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex:1, overflowY:'auto', padding:'10px 10px' }}>
          {navigation.map(item => {
            const isActive = location.pathname === item.to
            return (
              <NavLink
                key={item.to} to={item.to} onClick={onClose}
                style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'9px 10px', borderRadius:11, marginBottom:2,
                  fontSize:13.5, fontWeight:500, textDecoration:'none',
                  transition:'all 0.15s ease',
                  background: isActive ? `linear-gradient(135deg,${c1}22,${c1}10)` : 'transparent',
                  border: isActive ? `1px solid ${c1}33` : '1px solid transparent',
                  color: isActive ? c1 : 'rgba(255,255,255,0.42)',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.75)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.42)' } }}
              >
                <div style={{
                  width:30, height:30, borderRadius:8, flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: isActive ? `${c1}22` : 'rgba(255,255,255,0.06)',
                  color: isActive ? c1 : 'rgba(255,255,255,0.4)',
                  transition:'all 0.15s',
                }}>
                  <item.icon style={{ width:15, height:15 }} />
                </div>
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>
                {isActive && (
                  <div style={{ width:4, height:4, borderRadius:'50%', background:c1, flexShrink:0 }} />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* ── User ── */}
        <div style={{ padding:'10px', borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
          {user && (
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:12, marginBottom:6,
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width:34, height:34, borderRadius:9, flexShrink:0,
                background:`linear-gradient(135deg,${c1},${c2})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:700, color:'#fff',
              }}>{initials}</div>
              <div style={{ minWidth:0, flex:1 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#f0f6ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {user.firstName} {user.lastName}
                </p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{ROLE_LABELS[role]||role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width:'100%', display:'flex', alignItems:'center', gap:10,
              padding:'9px 12px', borderRadius:11, border:'1px solid transparent',
              background:'transparent', cursor:'pointer', fontSize:13.5, fontWeight:500,
              color:'rgba(255,255,255,0.35)', transition:'all 0.15s', fontFamily:'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.1)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(239,68,68,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor='transparent' }}
          >
            <div style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.05)' }}>
              <LogOut style={{ width:15, height:15 }} />
            </div>
            Tizimdan chiqish
          </button>
        </div>
      </aside>
    </>
  )
}
