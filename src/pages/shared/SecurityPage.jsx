import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePageTitle } from '../../hooks/usePageTitle.js'
import { httpClient } from '../../services/api/index.js'
import { useToastStore } from '../../store/toastStore.js'
import { Shield, Smartphone, Monitor, Trash2, Key, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react'

export function SecurityPage() {
  usePageTitle('Xavfsizlik')
  const pushToast = useToastStore((s) => s.pushToast)
  const queryClient = useQueryClient()
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [activeTab, setActiveTab] = useState('2fa')

  const { data: twoFa = {} } = useQuery({
    queryKey: ['2fa-status'],
    queryFn: () => httpClient.get('/security/2fa/status'),
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => httpClient.get('/security/sessions'),
  })

  const { data: auditRaw } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => httpClient.get('/security/audit?limit=50'),
    enabled: activeTab === 'audit',
  })
  const auditLogs = auditRaw?.data || []

  const sendOtpMutation = useMutation({
    mutationFn: () => httpClient.post('/security/2fa/send-otp', {}),
    onSuccess: () => { setOtpSent(true); pushToast({ title: 'OTP Telegram ga yuborildi ✅', variant: 'success' }) },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const verifyOtpMutation = useMutation({
    mutationFn: () => httpClient.post('/security/2fa/verify', { otp }),
    onSuccess: () => { setOtp(''); setOtpSent(false); pushToast({ title: '2FA tasdiqlandi ✅', variant: 'success' }); queryClient.invalidateQueries(['2fa-status']) },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'OTP noto\'g\'ri', variant: 'error' }),
  })

  const toggleMutation = useMutation({
    mutationFn: (enabled) => httpClient.post('/security/2fa/toggle', { enabled }),
    onSuccess: (_, enabled) => { pushToast({ title: `2FA ${enabled ? 'yoqildi' : "o'chirildi"}`, variant: 'success' }); queryClient.invalidateQueries(['2fa-status']) },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const revokeSessionMutation = useMutation({
    mutationFn: (id) => httpClient.delete(`/security/sessions/${id}`),
    onSuccess: () => { pushToast({ title: 'Sessiya bekor qilindi', variant: 'success' }); queryClient.invalidateQueries(['sessions']) },
    onError: (e) => pushToast({ title: e?.response?.data?.detail || 'Xato', variant: 'error' }),
  })

  const revokeAllMutation = useMutation({
    mutationFn: () => httpClient.delete('/security/sessions'),
    onSuccess: () => { pushToast({ title: 'Barcha sessiyalar bekor qilindi', variant: 'success' }); queryClient.invalidateQueries(['sessions']) },
  })

  const ACTION_LABELS = {
    ORDER_CREATED: '📦 Buyurtma yaratildi',
    ORDER_STATUS_CHANGED: '🔄 Status o\'zgardi',
    DRIVER_ASSIGNED: '🚚 Haydovchi biriktirildi',
    LOGIN: '🔐 Tizimga kirdi',
    LOGOUT: '🚪 Tizimdan chiqdi',
  }

  const tabs = [
    { id: '2fa',      label: '2FA', icon: Shield },
    { id: 'sessions', label: 'Sessiyalar', icon: Monitor },
    { id: 'audit',    label: 'Audit log', icon: Eye },
  ]

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black">🔐 Xavfsizlik</h2>
          <p className="text-slate-500 mt-0.5">2FA, sessiyalar va audit log</p>
        </div>
      </div>

      {/* Tab */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all
              ${activeTab === id ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* 2FA */}
      {activeTab === '2fa' && (
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black">Ikki bosqichli tasdiqlash (2FA)</h3>
              <p className="text-sm text-slate-500 mt-0.5">Telegram orqali OTP kod</p>
            </div>
            <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold
              ${twoFa.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
              <span className={`h-2 w-2 rounded-full ${twoFa.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {twoFa.enabled ? 'Yoqilgan' : "O'chirilgan"}
            </div>
          </div>

          {!twoFa.telegram_linked && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 text-sm text-amber-700 dark:text-amber-300">
              ⚠️ 2FA uchun avval Telegram botni ulang: Profil → Telegram sozlamalari
            </div>
          )}

          <div className="flex gap-3">
            <button
              className={`primary-button flex-1 ${twoFa.enabled ? '!bg-rose-500 hover:!bg-rose-600' : '!bg-purple-600 hover:!bg-purple-700'}`}
              onClick={() => toggleMutation.mutate(!twoFa.enabled)}
              disabled={toggleMutation.isPending || !twoFa.telegram_linked}
            >
              <Lock className="h-4 w-4" />
              {twoFa.enabled ? "2FA ni o'chirish" : "2FA ni yoqish"}
            </button>
            <button
              className="secondary-button flex-1"
              onClick={() => sendOtpMutation.mutate()}
              disabled={sendOtpMutation.isPending || !twoFa.telegram_linked}
            >
              <Key className="h-4 w-4" />
              OTP yuborish
            </button>
          </div>

          {otpSent && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">Telegram ga kelgan OTP kodni kiriting:</p>
              <div className="flex gap-3">
                <input
                  className="soft-input flex-1 text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  className="primary-button px-6"
                  onClick={() => verifyOtpMutation.mutate()}
                  disabled={otp.length < 6 || verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? '...' : '✓ Tasdiqlash'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessiyalar */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="danger-button text-sm" onClick={() => revokeAllMutation.mutate()} disabled={revokeAllMutation.isPending}>
              <Trash2 className="h-4 w-4" /> Barchasini bekor qilish
            </button>
          </div>
          {sessions.length === 0 ? (
            <div className="glass-card p-10 text-center text-slate-500">Sessiya topilmadi</div>
          ) : sessions.map((s) => (
            <div key={s.id} className="glass-card flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg">
                  {s.device?.includes('Mobil') ? '📱' : '💻'}
                </div>
                <div>
                  <p className="font-bold text-sm">{s.device || 'Noma\'lum qurilma'}</p>
                  <p className="text-xs text-slate-500">{s.ip} · {new Date(s.last_active).toLocaleString('uz')}</p>
                  <p className="text-xs text-slate-400 truncate max-w-48">{s.user_agent?.slice(0, 50)}</p>
                </div>
              </div>
              <button className="secondary-button px-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                onClick={() => revokeSessionMutation.mutate(s.id)}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Audit log */}
      {activeTab === 'audit' && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/10">
            <h4 className="font-black">Audit log — {auditRaw?.total || 0} ta yozuv</h4>
          </div>
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Log topilmadi</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="text-lg shrink-0 mt-0.5">
                    {log.action.includes('ORDER') ? '📦' : log.action.includes('DRIVER') ? '🚚' : '🔐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{ACTION_LABELS[log.action] || log.action}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      User: {log.user_id?.slice(-8)} ·
                      {log.details?.order_id && ` Order: #${log.details.order_id?.slice(-6)}`}
                      {log.details?.status && ` → ${log.details.status}`}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{new Date(log.created_at).toLocaleString('uz')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
