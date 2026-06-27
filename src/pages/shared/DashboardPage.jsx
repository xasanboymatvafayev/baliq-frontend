import { useQuery } from '@tanstack/react-query'
import { ClipboardCheck, Fish, Store, Truck, Activity, ArrowUpRight } from 'lucide-react'
import { DashboardCharts } from '../../components/charts/DashboardCharts.jsx'
import { StatCard } from '../../components/common/StatCard.jsx'
import { analyticsService } from '../../services/api/index.js'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { useAuthStore } from '../../store/authStore.js'

export function DashboardPage({ title, subtitle }) {
  usePageTitle(title)
  const user = useAuthStore(s=>s.user)
  const { data, isLoading } = useQuery({
    queryKey:['dashboard',title],
    queryFn:()=>analyticsService.dashboard({ scope:title }),
    staleTime:30_000, retry:2, onError:()=>{},
  })

  const h = new Date().getHours()
  const greet = h<5?'Xayrli kech':h<12?'Xayrli tong':h<18?'Xayrli kun':'Xayrli kech'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── Hero banner ── */}
      <section style={{ position:'relative', overflow:'hidden', borderRadius:22, padding:'28px 32px', background:'linear-gradient(135deg,#0ea5e9 0%,#0284c7 55%,#0369a1 100%)', boxShadow:'0 8px 40px rgba(14,165,233,0.32)' }}>
        {/* decorations */}
        <div style={{ position:'absolute', top:-60, right:-60, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:'40%', width:320, height:320, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>
        <Fish style={{ position:'absolute', right:28, bottom:-10, width:120, height:120, color:'rgba(255,255,255,0.08)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#34d399', display:'inline-block' }} className="animate-pulse-soft"/>
            <span style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Jonli panel</span>
          </div>
          <h2 style={{ fontSize:30, fontWeight:800, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>
            {greet}{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h2>
          <p style={{ marginTop:6, fontSize:14, color:'rgba(255,255,255,0.6)', maxWidth:480 }}>{subtitle}</p>

          <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:20 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:99, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', fontSize:13, fontWeight:600, color:'#fff' }}>
              <Activity style={{ width:15,height:15 }}/> {title}
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 16px', borderRadius:99, background:'rgba(255,255,255,0.08)', fontSize:13, color:'rgba(255,255,255,0.7)' }}>
              {new Date().toLocaleDateString('uz-UZ',{weekday:'long',day:'numeric',month:'long'})}
            </span>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ display:'grid', gap:14, gridTemplateColumns:'repeat(2,1fr)' }} className="xl:grid-cols-4">
        <StatCard title="Buyurtmalar" value={isLoading?'—':(data?.ordersCount??0).toLocaleString()} description="Jami buyurtmalar" icon={ClipboardCheck} tone="ocean" trend={data?.ordersTrend}/>
        <StatCard title="Baliqlar"    value={isLoading?'—':(data?.fishCount??0).toLocaleString()}   description="Katalog va ombor"   icon={Fish}           tone="emerald"/>
        <StatCard title="Fermalar"    value={isLoading?'—':(data?.farmCount??0).toLocaleString()}   description="Tasdiqlangan"      icon={Store}          tone="amber"/>
        <StatCard title="Haydovchilar"value={isLoading?'—':(data?.driverCount??0).toLocaleString()} description="Faol haydovchilar" icon={Truck}           tone="rose"/>
      </section>

      {/* ── Charts ── */}
      <DashboardCharts series={data?.series}/>
    </div>
  )
}
