import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { useAuthStore } from '../../store/authStore.js'
import { formatCurrency } from '../../utils/formatters.js'
import { Wallet, ArrowDownCircle, CreditCard, Save, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react'
import { PageSkeleton } from '../../components/common/LoadingSkeleton.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'

const RESEND_COOLDOWN = 60

export function FarmBalancePage() {
  usePageTitle('Balans')
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const [tab, setTab] = useState('balance')
  const [amount, setAmount] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [saveCard, setSaveCard] = useState(false)

  // Telegram OTP step
  const [otpStep, setOtpStep] = useState(false)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const [resending, setResending] = useState(false)
  const timerRef = useRef(null)

  // Withdraw pending data (resend uchun)
  const withdrawPendingRef = useRef(null)

  const { data: bal = { available_amount: 0, pending_amount: 0, withdrawn_amount: 0, monitoring: [] }, isLoading } = useQuery({
    queryKey: ['farm-balance'],
    queryFn: () => httpClient.get('/finance/farm/balance'),
    refetchInterval: 30000,
  })

  const { data: savedCard } = useQuery({
    queryKey: ['farm-saved-card'],
    queryFn: () => httpClient.get('/finance/farm/saved-card'),
  })

  useEffect(() => {
    if (savedCard?.card?.card_number) {
      setCardNum(savedCard.card.card_number)
      setCardHolder(savedCard.card.card_holder)
    }
  }, [savedCard])

  const startCountdown = useCallback(() => {
    setCountdown(RESEND_COOLDOWN)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { clearInterval(timerRef.current); return 0 } return p - 1 })
    }, 1000)
  }, [])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const handleWithdraw = async () => {
    const amt = parseInt(amount)
    if (!amt || !cardNum || !cardHolder || amt <= 0 || amt > bal.available_amount) return

    const wd = { amount: amt, card_number: cardNum, card_holder: cardHolder, save_card: saveCard }
    withdrawPendingRef.current = wd

    try {
      await httpClient.post('/finance/farm/withdraw', wd)
      pushToast({ title: 'Tasdiqlash kodi Telegram botga yuborildi 📱', variant: 'success' })
      setOtpStep(true)
      setCode('')
      startCountdown()
    } catch (err) {
      pushToast({ title: err?.message || 'Pul yechish so\'rovida xato', variant: 'error' })
    }
  }

  const handleResend = async () => {
    const wd = withdrawPendingRef.current
    if (!wd) return
    setResending(true)
    try {
      await httpClient.post('/finance/farm/withdraw', wd)
      pushToast({ title: 'Yangi kod Telegram botga yuborildi ✅', variant: 'success' })
      startCountdown()
    } catch (err) {
      pushToast({ title: err?.message || 'Qayta yuborishda xato', variant: 'error' })
    }
    setResending(false)
  }

  const handleConfirm = async () => {
    if (code.length < 4) { pushToast({ title: 'Kodni kiriting', variant: 'error' }); return }
    setSubmitting(true)
    try {
      await httpClient.post('/finance/farm/withdraw/confirm', { otp: code })
      pushToast({ title: "So'rov yuborildi! Admin tez orada o'tkazadi ✅", variant: 'success' })
      setOtpStep(false); setCode(''); setAmount(''); withdrawPendingRef.current = null
      queryClient.invalidateQueries(['farm-balance'])
      setTab('balance')
    } catch (err) {
      pushToast({ title: err?.message || "Kod noto'g'ri yoki muddati tugagan", variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const tabs = [
    { id: 'balance', label: 'Balans' },
    { id: 'withdraw', label: 'Pul yechish' },
    { id: 'monitoring', label: 'Monitoring' },
  ]

  if (isLoading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
          <Wallet className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">💰 Mening balansim</h2>
          <p className="text-slate-500 mt-0.5">Daromad va pul yechish</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Mavjud</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(bal.available_amount)}</p>
          <p className="text-xs text-slate-400">Yechib olish mumkin</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-slate-500 uppercase">Kutilmoqda</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(bal.pending_amount)}</p>
          <p className="text-xs text-slate-400">Yetkazilgandan so'ng keladi</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-slate-400">
          <p className="text-xs font-bold text-slate-500 uppercase">Yechib olingan</p>
          <p className="text-2xl font-black text-slate-600 mt-1">{formatCurrency(bal.withdrawn_amount)}</p>
          <p className="text-xs text-slate-400">Jami</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${tab === id ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600' : 'text-slate-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'withdraw' && (
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-black flex items-center gap-2"><ArrowDownCircle className="h-5 w-5 text-emerald-600" /> Pul yechish</h3>

          {!otpStep ? (
            <div className="space-y-4">
              {savedCard?.card?.card_number && (
                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-3 flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Saqlangan karta</p>
                    <p className="text-xs text-emerald-600">{savedCard.card.card_number} · {savedCard.card.card_holder}</p>
                  </div>
                  <button className="ml-auto text-xs font-bold text-emerald-600 underline"
                    onClick={() => { setCardNum(savedCard.card.card_number); setCardHolder(savedCard.card.card_holder) }}>
                    Ishlatish
                  </button>
                </div>
              )}

              <div>
                <label className="text-sm font-bold">Karta raqami *</label>
                <input className="soft-input w-full mt-1 font-mono tracking-widest text-lg" placeholder="8600 0000 0000 0000"
                  value={cardNum} onChange={(e) => { let v = e.target.value.replace(/\D/g,'').slice(0,16); v = v.replace(/(.{4})/g,'$1 ').trim(); setCardNum(v) }} maxLength={19} />
              </div>
              <div>
                <label className="text-sm font-bold">Karta egasi *</label>
                <input className="soft-input w-full mt-1 uppercase" placeholder="IVAN IVANOV" value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} />
              </div>
              <div>
                <label className="text-sm font-bold">Yechish summasi *</label>
                <div className="relative mt-1">
                  <input className="soft-input w-full pr-16" placeholder="0" type="number" min={1000} max={bal.available_amount} value={amount} onChange={(e) => setAmount(e.target.value)} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">so'm</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Mavjud: {formatCurrency(bal.available_amount)}</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${saveCard ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`} onClick={() => setSaveCard(v => !v)}>
                  {saveCard && <Save className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm font-semibold">Kartani eslab qolish</span>
              </label>

              <button
                className="primary-button w-full !bg-emerald-600 hover:!bg-emerald-700 text-lg py-4"
                onClick={handleWithdraw}
                disabled={!amount || !cardNum || !cardHolder || parseInt(amount) <= 0 || parseInt(amount) > bal.available_amount || submitting}
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Yuborilmoqda...</> : 'Pul yechish so\'rovini yuborish'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
        
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 p-4 text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-black text-emerald-700 dark:text-emerald-300">Tasdiqlash kodi yuborildi</p>
                <p className="text-sm text-emerald-600 mt-1">Telegram botni tekshiring 📱</p>
              </div>

              <div>
                <label className="text-sm font-bold">SMS kod</label>
                <input
                  className="soft-input w-full mt-1 text-center text-3xl font-mono tracking-widest"
                  placeholder="000000" maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  autoFocus
                />
              </div>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-slate-500">Qayta yuborish: <span className="font-bold">{countdown} sek</span></p>
                ) : (
                  <button onClick={handleResend} disabled={resending} className="flex items-center gap-2 mx-auto text-sm font-semibold text-sky-500 hover:text-sky-600 disabled:opacity-50">
                    <RefreshCw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} /> SMS qayta yuborish
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button className="secondary-button flex-1" onClick={() => { setOtpStep(false); clearInterval(timerRef.current) }}>Bekor</button>
                <button
                  className="primary-button flex-1 !bg-emerald-600"
                  onClick={handleConfirm}
                  disabled={code.length < 6 || submitting}
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin inline mr-1" />...</> : '✓ Tasdiqlash'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'monitoring' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <h4 className="font-black">Buyurtmalar va soliq hisobi</h4>
          </div>
          {bal.monitoring?.length === 0 ? (
            <EmptyState icon="📦" title="Hali buyurtma yo'q" description="Buyurtma yetkazilgach soliq hisobi shu yerda ko'rinadi" />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-white/10">
                <tr className="text-left text-xs font-black uppercase text-slate-400">
                  <th className="p-4">Buyurtma</th><th className="p-4">Jami</th><th className="p-4">Soliq</th><th className="p-4">Sizga</th><th className="p-4">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {bal.monitoring.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="p-4 font-mono text-xs">#{m.short_id}</td>
                    <td className="p-4 font-bold">{formatCurrency(m.total)}</td>
                    <td className="p-4 text-rose-500">−{m.tax_percent}% ({formatCurrency(m.tax_amount)})</td>
                    <td className="p-4 font-black text-emerald-600">{formatCurrency(m.farm_amount)}</td>
                    <td className="p-4"><span className="badge badge-blue">{m.provider || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
