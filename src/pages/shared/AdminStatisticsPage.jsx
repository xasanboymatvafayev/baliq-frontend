import { useQuery } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { formatCurrency, formatNumber, calcFarmRevenue } from '../../utils/formatters.js'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, ShoppingBag, Users, Truck, DollarSign, Star, Activity } from 'lucide-react'

const COLORS = ['#0b93cc','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']

function StatBox({ icon: Icon, label, value, sub, color = 'ocean' }) {
  const colors = {
    ocean:   'from-ocean-500 to-ocean-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber:   'from-amber-500 to-amber-600',
    rose:    'from-rose-500 to-rose-700',
    purple:  'from-purple-500 to-purple-700',
  }
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color]} shadow-glow-sm shrink-0`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-black mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <h3 className="font-black text-base mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  )
}

export function AdminStatisticsPage() {
  usePageTitle('Statistika')

  const { data: kpi = {} } = useQuery({
    queryKey: ['admin-kpi'],
    queryFn: () => httpClient.get('/analytics/kpi'),
    refetchInterval: 60000,
  })

  const { data: sys = {} } = useQuery({
    queryKey: ['admin-system'],
    queryFn: () => httpClient.get('/analytics/system'),
    refetchInterval: 60000,
  })

  const { data: sales = [] } = useQuery({
    queryKey: ['admin-sales'],
    queryFn: () => httpClient.get('/analytics/sales?period=monthly'),
    refetchInterval: 300000,
  })

  const { data: dash = {} } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => httpClient.get('/analytics/dashboard'),
    refetchInterval: 60000,
  })

  const pieData = [
    { name: 'Yetkazildi',     value: kpi.delivered  || 0 },
    { name: 'Bekor qilindi',  value: kpi.cancelled  || 0 },
    { name: 'Kutilmoqda',     value: kpi.pending     || 0 },
  ]

  const revenue = calcFarmRevenue(kpi.totalRevenue || 0)

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h2 className="text-3xl font-black">📊 Statistika va hisobotlar</h2>
        <p className="text-slate-500 mt-1">Real-time ko'rsatkichlar va tahlil</p>
      </div>

      {/* KPI kartalar */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox icon={ShoppingBag} label="Jami buyurtmalar" value={formatNumber(kpi.totalOrders)} sub={`${kpi.deliveryRate}% yetkazildi`} color="ocean" />
        <StatBox icon={DollarSign} label="Umumiy daromad"   value={formatCurrency(kpi.totalRevenue)} sub={`Sof: ${formatCurrency(revenue.net)}`} color="emerald" />
        <StatBox icon={Users}      label="Foydalanuvchilar" value={formatNumber(sys.totalUsers)}   sub={`${sys.approvedFarms} ta ferma`} color="amber" />
        <StatBox icon={Truck}      label="Haydovchilar"     value={formatNumber(sys.approvedDrivers)} sub={`${sys.totalDrivers} ta jami`} color="purple" />
      </div>

      {/* Grafiklar */}
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="📈 Oylik sotuv (so'm)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0b93cc" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0b93cc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area type="monotone" dataKey="sales" stroke="#0b93cc" strokeWidth={2.5} fill="url(#salesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📦 Oylik buyurtmalar soni">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dash.series || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8,8,0,0]} name="Buyurtmalar" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🥧 Buyurtma statuslari">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="📉 Daromad trendi">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dash.series || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f030" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} name="Daromad" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Soliq */}
      <div className="glass-card p-6">
        <h3 className="font-black text-lg mb-4">💰 Soliq hisob-kitobi (12%)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-ocean-50 dark:bg-ocean-900/20 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase">Brutto daromad</p>
            <p className="text-2xl font-black text-ocean-700 dark:text-ocean-300 mt-1">{formatCurrency(revenue.gross)}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase">Soliq (12%)</p>
            <p className="text-2xl font-black text-rose-600 mt-1">− {formatCurrency(revenue.tax)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 p-4 border-2 border-emerald-300 dark:border-emerald-700">
            <p className="text-xs font-bold text-slate-500 uppercase">Sof daromad</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{formatCurrency(revenue.net)}</p>
          </div>
        </div>
      </div>

      {/* Tizim holati */}
      <div className="glass-card p-6">
        <h3 className="font-black text-lg mb-4">🖥️ Tizim holati</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          {[
            { label: 'Jami foydalanuvchilar', value: sys.totalUsers },
            { label: 'Tasdiqlangan fermalar', value: `${sys.approvedFarms} / ${sys.totalFarms}` },
            { label: 'Faol haydovchilar',    value: `${sys.approvedDrivers} / ${sys.totalDrivers}` },
            { label: 'Baliqlar katalogi',     value: sys.totalFish },
            { label: 'Jami buyurtmalar',      value: sys.totalOrders },
            { label: "Yetkazish ko'rsatkichi", value: `${kpi.deliveryRate}%` },
            { label: 'Bekor qilish %',        value: `${kpi.cancelRate}%` },
            { label: 'Kutilayotgan',          value: kpi.pending },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-slate-50 dark:bg-white/5 p-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="font-black text-lg mt-0.5">{formatNumber(value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
