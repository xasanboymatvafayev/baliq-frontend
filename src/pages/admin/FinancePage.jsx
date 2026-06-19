import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency, formatNumber } from '../../utils/formatters.js'
import { DollarSign, TrendingUp, CreditCard, CheckCircle2, Clock, Star, ChevronRight } from 'lucide-react'

// ─── Admin sof foyda balans sahifasi ────────────────────────────
export function AdminFinancePage() {
  usePageTitle('Sof foyda balans')
  const [tab, setTab] = useState('balance')

  const { data: bal = {} } = useQuery({
    queryKey: ['admin-balance'],
    queryFn: () => httpClient.get('/finance/admin/balance'),
    refetchInterval: 30000,
  })

  const { data: settings = {} } = useQuery({
    queryKey: ['finance-settings'],
    queryFn: () => httpClient.get('/finance/settings'),
  })

  const tabs = [
    { id: 'balance', label: 'Balans' },
    { id: 'history', label: 'Tarix' },
    { id: 'settings', label: 'Sozlamalar' },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
          <TrendingUp className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">💰 Sof foyda balans</h2>
          <p className="text-slate-500 mt-0.5">
            {settings.test_mode ? '🧪 TEST rejim' : '✅ Real rejim'}
          </p>
        </div>
      </div>

      {/* Balans kartalar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5 border-l-4 border-l-ocean-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Click balans</p>
          <p className="text-2xl font-black text-ocean-600 mt-1">{formatCurrency(bal.click_balance)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Click orqali to'lovlar</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Payme balans</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(bal.payme_balance)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Payme orqali to'lovlar</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Umumiy sof foyda</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(bal.net_profit)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Soliqdan olingan</p>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition
              ${tab === id ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'balance' && (
        <div className="glass-card p-5 space-y-3">
          <h3 className="font-black">So'nggi soliq to'lovlari</h3>
          {(bal.history || []).slice(0, 10).map((h, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-3">
              <div>
                <p className="font-bold text-sm">{h.farm_name || '—'}</p>
                <p className="text-xs text-slate-500">#{h.order_id?.slice(-6)} · {h.tax_percent}% soliq · {h.provider}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-600">+{formatCurrency(h.amount)}</p>
                <p className="text-xs text-slate-400">{h.created_at ? new Date(h.created_at).toLocaleDateString('uz') : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr className="text-left text-xs font-black uppercase text-slate-400">
                <th className="p-4">Ferma</th>
                <th className="p-4">Buyurtma</th>
                <th className="p-4">Jami</th>
                <th className="p-4">Soliq %</th>
                <th className="p-4">Soliq</th>
                <th className="p-4">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {(bal.history || []).map((h, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="p-4 font-semibold">{h.farm_name || '—'}</td>
                  <td className="p-4 font-mono text-xs">#{h.order_id?.slice(-6)}</td>
                  <td className="p-4">{formatCurrency(h.total)}</td>
                  <td className="p-4"><span className="badge badge-amber">{h.tax_percent}%</span></td>
                  <td className="p-4 font-black text-emerald-600">+{formatCurrency(h.amount)}</td>
                  <td className="p-4"><span className="badge badge-blue">{h.provider}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'settings' && <FinanceSettings settings={settings} />}
    </div>
  )
}

function FinanceSettings({ settings }) {
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [clickKey, setClickKey] = useState('')
  const [paymeKey, setPaymeKey] = useState('')

  const saveMutation = useMutation({
    mutationFn: (data) => httpClient.patch('/finance/settings', data),
    onSuccess: () => { pushToast({ title: 'Saqlandi ✅', variant: 'success' }); queryClient.invalidateQueries(['finance-settings']) },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  return (
    <div className="glass-card p-6 space-y-5">
      <h3 className="font-black">API Sozlamalar</h3>
      <div className={`rounded-2xl p-4 text-sm font-semibold ${settings.test_mode ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border border-emerald-200'}`}>
        {settings.test_mode ? '🧪 TEST rejim — Railway da TEST_MODE=false qo\'ying va real API key kiriting' : '✅ Real rejim faol'}
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-bold">Click API Key</label>
          <input className="soft-input w-full mt-1" placeholder={settings.click_api_key || 'Click merchant API key...'} value={clickKey} onChange={(e) => setClickKey(e.target.value)} type="password" />
        </div>
        <div>
          <label className="text-sm font-bold">Payme API Key</label>
          <input className="soft-input w-full mt-1" placeholder={settings.payme_api_key || 'Payme merchant API key...'} value={paymeKey} onChange={(e) => setPaymeKey(e.target.value)} type="password" />
        </div>
        <button className="primary-button" onClick={() => saveMutation.mutate({ click_api_key: clickKey || undefined, payme_api_key: paymeKey || undefined })} disabled={saveMutation.isPending}>
          Saqlash
        </button>
      </div>
    </div>
  )
}

// ─── Admin pul chiqarish so'rovlari ─────────────────────────────
export function AdminWithdrawPage() {
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

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <DollarSign className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">💸 Pul chiqarish so'rovlari</h2>
        </div>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Berish kerak</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(data.total_pending)}</p>
          <p className="text-xs text-slate-400">{data.pending?.length} ta so'rov kutmoqda</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Berilgan</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(data.total_paid)}</p>
          <p className="text-xs text-slate-400">{data.paid?.length} ta to'langan</p>
        </div>
      </div>

      {selected ? (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl">So'rov tafsiloti</h3>
            <button className="secondary-button" onClick={() => setSelected(null)}>← Orqaga</button>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-ocean-100 dark:bg-ocean-900/30 flex items-center justify-center text-lg">🏡</div>
                <div>
                  <p className="font-black">{selected.farm_name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-600">{selected.farm_rating?.toFixed(1) || 'Yangi'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-xs text-slate-500">Karta raqami</p>
                <p className="font-black font-mono text-lg mt-1">{selected.card_number}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4">
                <p className="text-xs text-slate-500">Karta egasi</p>
                <p className="font-black text-lg mt-1">{selected.card_holder}</p>
              </div>
            </div>
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-4">
              <p className="text-xs text-slate-500">O'tkazish kerak</p>
              <p className="text-3xl font-black text-emerald-600">{formatCurrency(selected.amount)}</p>
            </div>
            <button
              className="primary-button w-full text-lg py-4 !bg-emerald-600 hover:!bg-emerald-700 flex items-center justify-center gap-2"
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
          {/* Kutmoqda */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h4 className="font-black">To'lash kerak ({data.pending?.length})</h4>
            </div>
            {data.pending?.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Kutilayotgan so'rovlar yo'q</div>
            ) : data.pending?.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer" onClick={() => setSelected(r)}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-lg">🏡</div>
                  <div>
                    <p className="font-bold">{r.farm_name}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-amber-600 font-bold">{r.farm_rating?.toFixed(1)}</span>
                      <span className="text-xs text-slate-400 ml-1">{new Date(r.created_at).toLocaleDateString('uz')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-amber-600">{formatCurrency(r.amount)}</p>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>

          {/* To'langan */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <h4 className="font-black">To'langanlar ({data.paid?.length})</h4>
            </div>
            {data.paid?.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 opacity-70">
                <div>
                  <p className="font-bold text-sm">{r.farm_name}</p>
                  <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString('uz')}</p>
                </div>
                <p className="font-black text-emerald-600">{formatCurrency(r.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
