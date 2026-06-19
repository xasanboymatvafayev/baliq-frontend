import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { formatCurrency, formatNumber } from '../../utils/formatters.js'
import { Wallet, ArrowDownCircle, Clock, CheckCircle2, CreditCard, Save } from 'lucide-react'

export function FarmBalancePage() {
  usePageTitle('Balans')
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('balance')
  const [amount, setAmount] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [saveCard, setSaveCard] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [withdrawReqs, setWithdrawReqs] = useState([])

  const { data: bal = { available_amount: 0, pending_amount: 0, withdrawn_amount: 0, monitoring: [] } } = useQuery({
    queryKey: ['farm-balance'],
    queryFn: () => httpClient.get('/finance/farm/balance'),
    refetchInterval: 30000,
  })

  const { data: savedCard } = useQuery({
    queryKey: ['farm-saved-card'],
    queryFn: () => httpClient.get('/finance/farm/saved-card'),
    onSuccess: (d) => {
      if (d?.card?.card_number) { setCardNum(d.card.card_number); setCardHolder(d.card.card_holder) }
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: () => httpClient.post('/finance/farm/withdraw', {
      amount: parseInt(amount),
      card_number: cardNum,
      card_holder: cardHolder,
      save_card: saveCard,
    }),
    onSuccess: () => { pushToast({ title: 'OTP Telegram ga yuborildi 📱', variant: 'success' }); setOtpStep(true) },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const confirmMutation = useMutation({
    mutationFn: () => httpClient.post('/finance/farm/withdraw/confirm', { otp }),
    onSuccess: () => {
      pushToast({ title: "So'rov yuborildi! Admin tez orada o'tkazadi ✅", variant: 'success' })
      setOtpStep(false); setOtp(''); setAmount('')
      queryClient.invalidateQueries(['farm-balance'])
      setTab('requests')
    },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'OTP noto\'g\'ri', variant: 'error' }),
  })

  const tabs = [
    { id: 'balance',   label: 'Balans' },
    { id: 'withdraw',  label: 'Pul yechish' },
    { id: 'monitoring', label: 'Monitoring' },
  ]

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

      {/* Balans kartalar */}
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

      {/* Pul yechish */}
      {tab === 'withdraw' && (
        <div className="glass-card p-6 space-y-5">
          <h3 className="font-black flex items-center gap-2"><ArrowDownCircle className="h-5 w-5 text-emerald-600" /> Pul yechish</h3>

          {!otpStep ? (
            <div className="space-y-4">
              {/* Saqlangan karta */}
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
                <input className="soft-input w-full mt-1 font-mono tracking-widest text-lg"
                  placeholder="8600 0000 0000 0000"
                  value={cardNum}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g,'').slice(0,16)
                    v = v.replace(/(.{4})/g,'$1 ').trim()
                    setCardNum(v)
                  }}
                  maxLength={19}
                />
              </div>
              <div>
                <label className="text-sm font-bold">Karta egasi (ism familya) *</label>
                <input className="soft-input w-full mt-1 uppercase"
                  placeholder="IVAN IVANOV"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="text-sm font-bold">Yechish summasi *</label>
                <div className="relative mt-1">
                  <input className="soft-input w-full pr-16"
                    placeholder="0"
                    type="number"
                    min={1000}
                    max={bal.available_amount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">so'm</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Mavjud: {formatCurrency(bal.available_amount)}</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition
                  ${saveCard ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}
                  onClick={() => setSaveCard(v => !v)}>
                  {saveCard && <Save className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm font-semibold">Kartani eslab qolish</span>
              </label>

              <div className="rounded-2xl bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 p-3 text-sm text-ocean-700 dark:text-ocean-300">
                📱 So'rovni tasdiqlash uchun Telegram ga OTP kod yuboriladi
              </div>

              <button
                className="primary-button w-full !bg-emerald-600 hover:!bg-emerald-700 text-lg py-4"
                onClick={() => withdrawMutation.mutate()}
                disabled={!amount || !cardNum || !cardHolder || parseInt(amount) <= 0 || parseInt(amount) > bal.available_amount || withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? 'Yuborilmoqda...' : 'Pul yechish so\'rovini yuborish'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 p-4 text-center">
                <p className="text-2xl mb-2">📱</p>
                <p className="font-black text-amber-700 dark:text-amber-300">Telegram ga OTP kod yuborildi</p>
                <p className="text-sm text-amber-600 mt-1">5 daqiqa ichida kiriting</p>
              </div>
              <div>
                <label className="text-sm font-bold">OTP kod</label>
                <input className="soft-input w-full mt-1 text-center text-3xl font-mono tracking-widest"
                  placeholder="000000" maxLength={6}
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))}
                />
              </div>
              <div className="flex gap-3">
                <button className="secondary-button flex-1" onClick={() => setOtpStep(false)}>Bekor</button>
                <button
                  className="primary-button flex-1 !bg-emerald-600"
                  onClick={() => confirmMutation.mutate()}
                  disabled={otp.length < 6 || confirmMutation.isPending}
                >
                  {confirmMutation.isPending ? '...' : '✓ Tasdiqlash'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monitoring */}
      {tab === 'monitoring' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <h4 className="font-black">Buyurtmalar va soliq hisobi</h4>
          </div>
          {bal.monitoring?.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Hali yetkazilgan buyurtma yo'q</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 dark:border-white/10">
                <tr className="text-left text-xs font-black uppercase text-slate-400">
                  <th className="p-4">Buyurtma</th>
                  <th className="p-4">Jami</th>
                  <th className="p-4">Soliq</th>
                  <th className="p-4">Sizga</th>
                  <th className="p-4">Provider</th>
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
