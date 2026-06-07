import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const emptySeries = [
  { name: 'Yan', value: 0, revenue: 0 },
  { name: 'Fev', value: 0, revenue: 0 },
  { name: 'Mar', value: 0, revenue: 0 },
  { name: 'Apr', value: 0, revenue: 0 },
]

const pieData = [
  { name: 'Kutilmoqda', value: 0 },
  { name: 'Yetkazildi', value: 0 },
  { name: 'Bekor qilindi', value: 0 },
]

const colors = ['#38bdf8', '#10b981', '#f43f5e']

function ChartShell({ title, children }) {
  return (
    <section className="glass-card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-slate-500">API ma’lumotlari kelganda avtomatik yangilanadi</p>
        </div>
      </div>
      <div className="h-72">{children}</div>
    </section>
  )
}

export function DashboardCharts({ series = emptySeries }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartShell title="Sotuv dinamikasi">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#0284c7" fill="url(#revenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartShell>
      <ChartShell title="Buyurtmalar">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </ChartShell>
      <ChartShell title="Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartShell>
      <ChartShell title="Statuslar ulushi">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} innerRadius={55}>
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartShell>
    </div>
  )
}
