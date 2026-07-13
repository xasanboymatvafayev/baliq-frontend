import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency } from '../../utils/formatters.js'
import { DollarSign, TrendingUp, CheckCircle2, Clock, Star, ChevronRight, CreditCard } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState.jsx'

// ── Skeleton ──────────────────────────────────────────────────────────
function FinanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4 animate-pulse">
        <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-white/10" />
          <div className="h-4 w-24 rounded-lg bg-slate-100 dark:bg-white/[0.06]" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card p-5 space-y-3 animate-pulse border-l-4 border-l-slate-200 dark:border-l-white/10" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-7 w-36 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-32 rounded bg-slate-100 dark:bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryTableSkeleton({ rows = 6 }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-slate-200 dark:border-white/10 px-4 py-3 flex gap-4">
        {[1, 1.5, 1, 0.6, 1, 0.8].map((w, i) => (
          <div key={i} className="h-3 rounded bg-slate-200 dark:bg-white/10 animate-pulse" style={{ flex: w, animationDelay: `${i * 50}ms` }} />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-4 px-4 py-3.5">
            {[1, 1.5, 1, 0.6, 1, 0.8].map((w, col) => (
              <div key={col} className="h-4 rounded bg-slate-100 dark:bg-white/[0.06] animate-pulse" style={{ flex: w, animationDelay: `${(row * 6 + col) * 30}ms` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Balance stat card ─────────────────────────────────────────────────
function BalanceCard({ label, value, subtitle, borderColor, textColor, icon: Icon }) {
  return (
    <div className={`glass-card p-5 border-l-4 ${borderColor} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        {Icon && <Icon className={`h-4 w-4 ${textColor}`} />}
      </div>
      <p className={`text-2xl font-black ${textColor}`}>{formatCurrency(value)}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ── Tab button ────────────────────────────────────────────────────────
function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all duration-150
        ${active
          ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
    >
      {children}
    </button>
  )
}

// ── Finance settings ──────────────────────────────────────────────────
function FinanceSettings({ settings }) {
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [clickKey, setClickKey] = useState('')
  const [paymeKey, setPaymeKey] = useState('')

  const saveMutation = useMutation({
    mutationFn: (data) => httpClient.patch('/finance/settings', data),
    onSuccess: () => {
      pushToast({ title: 'Saqlandi ✅', variant: 'success' })
      queryClient.invalidateQueries(['finance-settings'])
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  return (
    <div className="glass-card p-6 space-y-5">
      <h3 className="font-black text-lg flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-ocean-600 dark:text-ocean-400" />
        API Sozlamalar
      </h3>
      <div className={`rounded-2xl p-4 text-sm font-semibold border ${
        settings.test_mode
          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50'
          : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50'
      }`}>
        {settings.test_mode
          ? "🧪 TEST rejim — Railway da TEST_MODE=false qo'ying va real API key kiriting"
          : '✅ Real rejim faol'}
      </div>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Click API Key</label>
          <input
            className="soft-input w-full mt-1"
            placeholder={settings.click_api_key ? '••••••••' : 'Click merchant API key...'}
            value={clickKey}
            onChange={(e) => setClickKey(e.target.value)}
            type="password"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Payme API Key</label>
          <input
            className="soft-input w-full mt-1"
            placeholder={settings.payme_api_key ? '••••••••' : 'Payme merchant API key...'}
            value={paymeKey}
            onChange={(e) => setPaymeKey(e.target.value)}
            type="password"
          />
        </div>
        <button
          className="primary-button"
          onClick={() => saveMutation.mutate({
            click_api_key: clickKey || undefined,
            payme_api_key: paymeKey || undefined,
          })}
          disabled={saveMutation.isPending || (!clickKey && !paymeKey)}
        >
          {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </div>
    </div>
  )
}

// ── Admin Finance Page ────────────────────────────────────────────────
export function AdminFinancePage() {
  const t = useT()
  usePageTitle('Sof foyda balans')
  const [tab, setTab] = useState('balance')

  const { data: bal = {}, isLoading } = useQuery({
    queryKey: ['admin-balance'],
    queryFn: () => httpClient.get('/finance/admin/balance'),
    refetchInterval: 30000,
  })
  const { data: settings = {} } = useQuery({
    queryKey: ['finance-settings'],
    queryFn: () => httpClient.get('/finance/settings'),
  })

  if (isLoading) return <FinanceSkeleton />

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <TrendingUp className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">💰 Sof foyda balans</h2>
          <p className="text-slate-500 mt-0.5 text-sm">
            {settings.test_mode
              ? <span className="text-amber-600 dark:text-amber-400 font-semibold">🧪 TEST rejim</span>
              : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✅ Real rejim</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceCard
          label="Click balans"
          value={bal.click_balance}
          subtitle="Click orqali to'lovlar"
          borderColor="border-l-ocean-500 dark:border-l-ocean-400"
          textColor="text-ocean-600 dark:text-ocean-400"
          icon={CreditCard}
        />
        <BalanceCard
          label="Payme balans"
          value={bal.payme_balance}
          subtitle="Payme orqali to'lovlar"
          borderColor="border-l-blue-500 dark:border-l-blue-400"
          textColor="text-blue-600 dark:text-blue-400"
          icon={CreditCard}
        />
        <BalanceCard
          label="Umumiy sof foyda"
          value={bal.net_profit}
          subtitle="Soliqdan olingan"
          borderColor="border-l-emerald-500 dark:border-l-emerald-400"
          textColor="text-emerald-600 dark:text-emerald-400"
          icon={TrendingUp}
        />
      </div>

      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
        <Tab active={tab === 'balance'} onClick={() => setTab('balance')}>{t.balance}</Tab>
        <Tab active={tab === 'history'} onClick={() => setTab('history')}>Tarix</Tab>
        <Tab active={tab === 'settings'} onClick={() => setTab('settings')}>Sozlamalar</Tab>
      </div>

      {tab === 'balance' && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-black">So'nggi soliq to'lovlari</h3>
          {(!bal.history || bal.history.length === 0) ? (
            <EmptyState icon="💰" title="Hali soliq to'lovi yo'q" description="Buyurtma yetkazilib, haydovchi biriktirilganda bu yerda ko'rinadi" />
          ) : (
            (bal.history || []).slice(0, 10).map((h, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 px-4 py-3 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition">
                <div>
                  <p className="font-bold text-sm">{h.farm_name || '—'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">#{h.order_id?.slice(-6)} · {h.tax_percent}% soliq · {h.provider}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600 dark:text-emerald-400">+{formatCurrency(h.amount)}</p>
                  <p className="text-xs text-slate-400">{h.created_at ? new Date(h.created_at).toLocaleDateString('uz') : ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="p-4">Ferma</th>
                  <th className="p-4">Buyurtma</th>
                  <th className="p-4">{t.total}</th>
                  <th className="p-4">Soliq %</th>
                  <th className="p-4">Soliq</th>
                  <th className="p-4">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {(bal.history || []).map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 font-semibold whitespace-nowrap">{h.farm_name || '—'}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">#{h.order_id?.slice(-6)}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{formatCurrency(h.total)}</td>
                    <td className="p-4">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                        {h.tax_percent}%
                      </span>
                    </td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">+{formatCurrency(h.amount)}</td>
                    <td className="p-4">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                        {h.provider}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'settings' && <FinanceSettings settings={settings} />}
    </div>
  )
}

// ── Withdraw Page ─────────────────────────────────────────────────────
export function AdminWithdrawPage() {
  const t = useT()
  usePageTitle("Pul chiqarish so'rovlari")
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState(null)

  const { data = { pending: [], paid: [], total_pending: 0, total_paid: 0 }, isLoading } = useQuery({
    queryKey: ['withdraw-requests'],
    queryFn: () => httpClient.get('/finance/admin/withdraw-requests'),
    refetchInterval: 30000,
  })

  const payMutation = useMutation({
    mutationFn: (id) => httpClient.post(`/finance/admin/withdraw-requests/${id}/pay`, {}),
    onSuccess: () => {
      pushToast({ title: "To'lov tasdiqlandi va fermerga xabar yuborildi ✅", variant: 'success' })
      queryClient.invalidateQueries(['withdraw-requests'])
      setSelected(null)
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  if (isLoading) return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4 animate-pulse">
        <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-white/10 shrink-0" />
        <div className="h-7 w-56 rounded-xl bg-slate-200 dark:bg-white/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="glass-card p-5 space-y-3 animate-pulse border-l-4 border-l-slate-200 dark:border-l-white/10">
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-white/10" />
            <div className="h-7 w-36 rounded-xl bg-slate-200 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
          <DollarSign className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">💸 Pul chiqarish so'rovlari</h2>
          <p className="text-slate-500 text-sm mt-0.5">Fermerlarga to'lovlarni tasdiqlang</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BalanceCard
          label="Berish kerak"
          value={data.total_pending}
          subtitle={`${data.pending?.length} ta so'rov kutmoqda`}
          borderColor="border-l-amber-500 dark:border-l-amber-400"
          textColor="text-amber-600 dark:text-amber-400"
          icon={Clock}
        />
        <BalanceCard
          label="Berilgan"
          value={data.total_paid}
          subtitle={`${data.paid?.length} ta to'langan`}
          borderColor="border-l-emerald-500 dark:border-l-emerald-400"
          textColor="text-emerald-600 dark:text-emerald-400"
          icon={CheckCircle2}
        />
      </div>

      {selected ? (
        <div className="glass-card p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl">So'rov tafsiloti</h3>
            <button className="secondary-button" onClick={() => setSelected(null)}>← Orqaga</button>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center text-lg shrink-0">🏡</div>
              <div>
                <p className="font-black">{selected.farm_name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{selected.farm_rating?.toFixed(1) || 'Yangi'}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-xs text-slate-500 mb-1">Karta raqami</p>
                <p className="font-black font-mono text-lg tracking-widest">{selected.card_number}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-xs text-slate-500 mb-1">Karta egasi</p>
                <p className="font-black text-lg">{selected.card_holder}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 p-4">
              <p className="text-xs text-slate-500 mb-1">O'tkazish kerak</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(selected.amount)}</p>
            </div>
            <button
              className="primary-button w-full text-lg py-4 !bg-emerald-600 hover:!bg-emerald-700 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              onClick={() => payMutation.mutate(selected.id)}
              disabled={payMutation.isPending}
            >
              <CheckCircle2 className="h-5 w-5" />
              {payMutation.isPending ? "O'tkazilmoqda..." : "✅ To'landi — Tasdiqlash"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h4 className="font-black">To'lash kerak ({data.pending?.length})</h4>
            </div>
            {data.pending?.length === 0 ? (
              <div className="p-8">
                <EmptyState icon="✅" title="Hozircha so'rov yo'q" description="Fermerlar pul yechish so'rovi yuborganda shu yerda ko'rinadi" />
              </div>
            ) : (
              data.pending?.map((r) => (
                <button
                  key={r.id}
                  className="w-full flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-left"
                  onClick={() => setSelected(r)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg shrink-0">🏡</div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{r.farm_name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">{r.farm_rating?.toFixed(1)}</span>
                        <span className="text-xs text-slate-400 ml-1">{new Date(r.created_at).toLocaleDateString('uz')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <p className="font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">{formatCurrency(r.amount)}</p>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Paid */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <h4 className="font-black">To'langanlar ({data.paid?.length})</h4>
            </div>
            {data.paid?.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Hali to'langan so'rov yo'q</div>
            ) : (
              data.paid?.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 opacity-60">
                  <div>
                    <p className="font-bold text-sm">{r.farm_name}</p>
                    <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString('uz')}</p>
                  </div>
                  <p className="font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(r.amount)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
