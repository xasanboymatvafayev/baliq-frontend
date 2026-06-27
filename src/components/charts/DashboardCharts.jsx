import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend,
} from 'recharts'

const DEMO = [
  { name: 'Yan', orders: 12, revenue: 1200000 },
  { name: 'Fev', orders: 19, revenue: 1900000 },
  { name: 'Mar', orders: 15, revenue: 1500000 },
  { name: 'Apr', orders: 27, revenue: 2700000 },
  { name: 'May', orders: 23, revenue: 2300000 },
  { name: 'Iyn', orders: 34, revenue: 3400000 },
  { name: 'Iyl', orders: 42, revenue: 4200000 },
]

const PIE_DATA = [
  { name: 'Yetkazildi',   value: 62, color: '#10b981' },
  { name: 'Kutilmoqda',   value: 28, color: '#0ea5e9' },
  { name: 'Bekor qilindi',value: 10, color: '#f43f5e' },
]

const fmtMoney = v => v >= 1_000_000
  ? `${(v/1_000_000).toFixed(1)}M`
  : v >= 1_000 ? `${(v/1_000).toFixed(0)}K` : v

const CustomTooltip = ({ active, payload, label, money }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#0d1829] p-3 shadow-float text-[13px]">
      <p className="font-bold text-slate-700 dark:text-slate-300 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-800 dark:text-white">
            {money ? `${(p.value/1000000).toFixed(2)}M so'm` : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="glass-card p-5">
      <div className="mb-5">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">{title}</h3>
        {subtitle && <p className="text-[12px] text-slate-400 dark:text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-[220px]">{children}</div>
    </div>
  )
}

export function DashboardCharts({ series }) {
  const data = series?.length ? series : DEMO

  return (
    <div className="grid gap-4 xl:grid-cols-2">

      {/* Area chart */}
      <ChartCard title="Daromad dinamikasi" subtitle="Oylik sotuv ko'rsatkichi">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtMoney} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip money />} />
            <Area type="monotone" dataKey="revenue" name="Daromad" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#gRevenue)" dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Bar chart */}
      <ChartCard title="Buyurtmalar soni" subtitle="Oylik buyurtmalar statistikasi">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="orders" name="Buyurtmalar" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#gBar${i})`} />
              ))}
              {data.map((_, i) => (
                <defs key={i}>
                  <linearGradient id={`gBar${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Line chart */}
      <ChartCard title="O'sish trendi" subtitle="Sotuv va buyurtmalar o'zaro nisbati">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="orders" name="Buyurtmalar" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie chart */}
      <ChartCard title="Buyurtmalar holati" subtitle="Status bo'yicha taqsimot">
        <div className="flex items-center justify-center gap-6 h-full">
          <ResponsiveContainer width="55%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{ borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 13 }}
              />
              <Pie data={PIE_DATA} dataKey="value" nameKey="name"
                innerRadius="52%" outerRadius="80%"
                paddingAngle={3} startAngle={90} endAngle={-270}>
                {PIE_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <div>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{d.value}%</p>
                  <p className="text-[11px] text-slate-400">{d.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  )
}
