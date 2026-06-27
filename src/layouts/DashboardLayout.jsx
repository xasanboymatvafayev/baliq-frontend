import { useMemo, useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Topbar } from '../components/layout/Topbar.jsx'

function BottomNav({ navigation }) {
  const loc = useLocation()
  const items = navigation.slice(0, 5)
  return (
    <nav className="lg:hidden" style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:50,
      background:'rgba(8,15,29,0.96)', backdropFilter:'blur(24px)',
      borderTop:'1px solid rgba(255,255,255,0.06)',
      paddingBottom:'env(safe-area-inset-bottom)',
      display:'flex',
    }}>
      {items.map(item=>{
        const active = loc.pathname===item.to
        return (
          <NavLink key={item.to} to={item.to} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'10px 4px', textDecoration:'none' }}>
            <div style={{
              width:36, height:36, borderRadius:11,
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s',
              background: active ? 'rgba(14,165,233,0.18)' : 'transparent',
              border: active ? '1px solid rgba(14,165,233,0.22)' : '1px solid transparent',
              color: active ? '#38bdf8' : 'rgba(255,255,255,0.3)',
              transform: active ? 'scale(1.08)' : 'scale(1)',
            }}>
              <item.icon style={{ width:18, height:18 }}/>
            </div>
            <span style={{ fontSize:10, fontWeight:600, color: active ? '#38bdf8' : 'rgba(255,255,255,0.28)', maxWidth:52, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {item.label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function DashboardLayout({ navigation, title }) {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const activeTitle = useMemo(
    ()=>navigation.find(i=>i.to===loc.pathname)?.label||title,
    [loc.pathname,navigation,title]
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--bg)' }}>
      <Sidebar navigation={navigation} open={open} onClose={()=>setOpen(false)}/>
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', paddingBottom:68 }} className="lg:pb-0">
        <Topbar title={activeTitle} onMenuClick={()=>setOpen(true)}/>
        <main className="animate-fade-in" style={{ flex:1, padding:'20px 20px 40px' }} >
          <Outlet/>
        </main>
      </div>
      <BottomNav navigation={navigation}/>
    </div>
  )
}
