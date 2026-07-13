import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency } from '../../utils/formatters.js'
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Copy, CheckCircle2,
  Calendar, Percent, Coins, Users, X, RefreshCw, AlertTriangle,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color = 'ocean' }) {
  const colors = {
    ocean: 'from-ocean-500 to-ocean-700 shadow-glow-sm',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-700',
  }
  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${colors[color]} text-white flex-shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function PromoFormModal({ onClose, onSuccess }) {
  const pushToast = useToastStore((s) => s.pushToast)
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
    setForm(f => ({ ...f, code }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code || !form.discount_value) {
      pushToast({ title: "Kod va chegirma miqdori majburiy", variant: 'error' })
      return
    }
    setLoading(true)
    try {
      await httpClient.post('/payments/promo/create', {
        ...form,
        discount_value: Number(form.discount_value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
      })
      pushToast({ title: `"${form.code}" promo kodi yaratildi!`, variant: 'success' })
      onSuccess()
      onClose()
    } catch (err) {
      pushToast({ title: err?.response?.data?.detail || "Xatolik yuz berdi", variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 text-white">
              <Tag className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black">Yangi promo kod</h3>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kod */}
          <div>
            <label className="block text-sm font-bold mb-2">Promo kod *</label>
            <div className="flex gap-2">
              <input
                className="soft-input flex-1 font-mono uppercase tracking-widest"
                placeholder="SUMMER25"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                required
              />
              <button
                type="button"
                onClick={generateCode}
                className="secondary-button px-3 gap-1.5"
                title="Avtomatik yaratish"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chegirma turi */}
          <div>
            <label className="block text-sm font-bold mb-2">Chegirma turi *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'percent', label: '% Foiz', icon: Percent },
                { val: 'fixed', label: "So'm miqdori", icon: Coins },
              ].map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, discount_type: val }))}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                    form.discount_type === val
                      ? 'border-ocean-400 bg-ocean-50 text-ocean-700 dark:bg-ocean-900/30 dark:text-ocean-300'
                      : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Chegirma miqdori */}
          <div>
            <label className="block text-sm font-bold mb-2">
              {form.discount_type === 'percent' ? 'Chegirma (%)' : "Chegirma (so'm)"} *
            </label>
            <input
              className="soft-input"
              type="number"
              min="0"
              max={form.discount_type === 'percent' ? 100 : undefined}
              placeholder={form.discount_type === 'percent' ? '20' : '50000'}
              value={form.discount_value}
              onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Min buyurtma */}
            <div>
              <label className="block text-sm font-bold mb-2">Min buyurtma (so'm)</label>
              <input
                className="soft-input"
                type="number"
                placeholder="100000"
                value={form.min_order_amount}
                onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
              />
            </div>
            {/* Max foydalanish */}
            <div>
              <label className="block text-sm font-bold mb-2">Max foydalanish</label>
              <input
                className="soft-input"
                type="number"
                placeholder="100"
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
              />
            </div>
          </div>

          {/* Muddati */}
          <div>
            <label className="block text-sm font-bold mb-2">Amal qilish muddati</label>
            <input
              className="soft-input"
              type="datetime-local"
              value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
            />
          </div>

          {/* Tavsif */}
          <div>
            <label className="block text-sm font-bold mb-2">Tavsif (ixtiyoriy)</label>
            <input
              className="soft-input"
              placeholder="Yozgi chegirma aksiyasi"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Preview */}
          {form.code && form.discount_value && (
            <div className="rounded-2xl border border-ocean-200 bg-ocean-50 p-4 dark:border-ocean-800/50 dark:bg-ocean-900/20">
              <p className="text-xs font-bold uppercase text-ocean-600 mb-1">Ko'rinish</p>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-black tracking-widest text-ocean-700 dark:text-ocean-300">{form.code}</span>
                <span className="badge badge-blue">
                  {form.discount_type === 'percent' ? `${form.discount_value}%` : `${Number(form.discount_value).toLocaleString()} so'm`} chegirma
                </span>
              </div>
              {form.min_order_amount && (
                <p className="mt-1 text-xs text-slate-500">Min buyurtma: {Number(form.min_order_amount).toLocaleString()} so'm</p>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="primary-button w-full">
            {loading ? 'Yaratilmoqda...' : <><Plus className="h-4 w-4" /> Promo kod yaratish</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export function AdminPromoPage() {
  const t = useT()
  usePageTitle('Promo kodlar')
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [copiedCode, setCopiedCode] = useState(null)

  const { data: promoRaw = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () => httpClient.get('/payments/promo/list'),
  })
  const promos = Array.isArray(promoRaw) ? promoRaw : (promoRaw?.data || promoRaw?.promos || [])

  const toggleMutation = useMutation({
    mutationFn: (id) => httpClient.patch(`/payments/promo/${id}/toggle`),
    onSuccess: () => {
      pushToast({ title: 'Holat yangilandi', variant: 'success' })
      queryClient.invalidateQueries(['admin-promos'])
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => httpClient.delete(`/payments/promo/${id}`),
    onSuccess: () => {
      pushToast({ title: "Promo kod o'chirildi", variant: 'success' })
      queryClient.invalidateQueries(['admin-promos'])
      setDeleteTarget(null)
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    })
  }

  const active = promos.filter(p => p.is_active !== false)
  const expired = promos.filter(p => {
    if (!p.expires_at) return false
    return new Date(p.expires_at) < new Date()
  })
  const totalUses = promos.reduce((s, p) => s + (p.use_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-sm p-6 text-center space-y-4">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-xl font-black">O'chirishni tasdiqlang</h3>
            <p className="text-slate-500">
              <span className="font-mono font-bold text-slate-800 dark:text-white">{deleteTarget.code}</span> promo kodi butunlay o'chiriladi.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="secondary-button flex-1">{t.cancel}</button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="danger-button flex-1"
              >
                {deleteMutation.isPending ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <PromoFormModal
          onClose={() => setShowModal(false)}
          onSuccess={() => queryClient.invalidateQueries(['admin-promos'])}
        />
      )}

      {/* Header */}
      <section className="glass-card p-6 flex flex-wrap items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-700 text-white shadow-glow-sm">
          <Tag className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-black">Promo kodlar</h2>
          <p className="mt-0.5 text-slate-500">Chegirma kodlarini yarating va boshqaring</p>
        </div>
        <button onClick={() => setShowModal(true)} className="primary-button">
          <Plus className="h-4 w-4" /> Yangi kod
        </button>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Tag} label="Jami kodlar" value={promos.length} color="ocean" />
        <StatCard icon={CheckCircle2} label="Faol" value={active.length} color="emerald" />
        <StatCard icon={Calendar} label="Muddati o'tgan" value={expired.length} color="amber" />
        <StatCard icon={Users} label="Jami foydalanish" value={totalUses} color="rose" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />)}
          </div>
        ) : promos.length === 0 ? (
          <div className="p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
              <Tag className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-500">Hozircha promo kod yo'q</p>
            <p className="mt-1 text-sm text-slate-400">Birinchi promo kodni yarating</p>
            <button onClick={() => setShowModal(true)} className="primary-button mt-4">
              <Plus className="h-4 w-4" /> Yaratish
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-white/10">
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Kod</th>
                  <th className="p-4">Chegirma</th>
                  <th className="p-4 hidden sm:table-cell">Min buyurtma</th>
                  <th className="p-4 hidden md:table-cell">Foydalanish</th>
                  <th className="p-4 hidden lg:table-cell">Muddat</th>
                  <th className="p-4">Holat</th>
                  <th className="p-4">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {promos.map((promo) => {
                  const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date()
                  const isMaxed = promo.max_uses && promo.use_count >= promo.max_uses
                  return (
                    <tr key={promo.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-black tracking-wider text-slate-900 dark:text-white">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => copyCode(promo.code)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition text-slate-400 hover:text-ocean-600"
                            title="Nusxa olish"
                          >
                            {copiedCode === promo.code
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {promo.description && (
                          <p className="mt-0.5 text-xs text-slate-400 truncate max-w-[160px]">{promo.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="badge badge-blue font-mono">
                          {promo.discount_type === 'percent'
                            ? `${promo.discount_value}%`
                            : `${promo.discount_value?.toLocaleString()} so'm`}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-slate-600 dark:text-slate-400">
                        {promo.min_order_amount ? `${promo.min_order_amount.toLocaleString()} so'm` : '—'}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{promo.use_count || 0}</span>
                          {promo.max_uses && (
                            <>
                              <span className="text-slate-400">/</span>
                              <span className="text-slate-500">{promo.max_uses}</span>
                            </>
                          )}
                          {isMaxed && <span className="badge badge-rose text-[10px]">Tugagan</span>}
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-xs text-slate-500">
                        {promo.expires_at
                          ? <span className={isExpired ? 'text-rose-500 font-semibold' : ''}>
                              {new Date(promo.expires_at).toLocaleDateString('uz-UZ')}
                              {isExpired && ' (O\'tgan)'}
                            </span>
                          : <span className="text-emerald-500">Cheksiz</span>
                        }
                      </td>
                      <td className="p-4">
                        {promo.is_active !== false && !isExpired && !isMaxed
                          ? <span className="badge badge-green">Faol</span>
                          : <span className="badge badge-slate">Nofaol</span>
                        }
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleMutation.mutate(promo.id)}
                            disabled={toggleMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition text-slate-500 hover:text-ocean-600"
                            title={promo.is_active !== false ? "O'chirish" : "Yoqish"}
                          >
                            {promo.is_active !== false
                              ? <ToggleRight className="h-4 w-4 text-emerald-500" />
                              : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(promo)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition text-slate-400 hover:text-rose-500"
                            title="O'chirish"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
