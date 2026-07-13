import { useState, useRef, useEffect } from 'react'
import { Menu, Search, X, Fish, Store, ExternalLink, LogOut } from 'lucide-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../common/ThemeToggle.jsx'
import { NotificationBell } from '../common/NotificationBell.jsx'
import { LanguageSwitcher } from '../common/LanguageSwitcher.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/index.js'
import { useT } from '../../store/i18nStore.js'

function useDebounce(value, delay = 350) {
  const [dv, setDv] = useState(value)
  useEffect(() => { const t = setTimeout(() => setDv(value), delay); return () => clearTimeout(t) }, [value, delay])
  return dv
}

function SearchDropdown({ query, onClose, role }) {
  const navigate = useNavigate()
  const [res, setRes] = useState({ fish: [], farms: [] })
  const [loading, setLoading] = useState(false)
  const q = useDebounce(query)
  const isCustomer = ['customer', 'farm-owner'].includes(role)

  useEffect(() => {
    if (!q || q.length < 2) { setRes({ fish: [], farms: [] }); return }
    setLoading(true)
    Promise.allSettled([
      httpClient.get(`/fish?search=${encodeURIComponent(q)}&limit=5`),
      httpClient.get(`/farms?search=${encodeURIComponent(q)}&status=APPROVED&limit=4`),
    ]).then(([fr, ar]) => {
      const fish = fr.status === 'fulfilled' ? (Array.isArray(fr.value) ? fr.value : fr.value?.data || fr.value?.fish || []) : []
      const farms = ar.status === 'fulfilled' ? (Array.isArray(ar.value) ? ar.value : ar.value?.data || ar.value?.farms || []) : []
      setRes({ fish: fish.slice(0, 5), farms: farms.slice(0, 4) })
    }).finally(() => setLoading(false))
  }, [q])

  const total = res.fish.length + res.farms.length
  const go = path => { navigate(path); onClose() }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-scale-in overflow-hidden rounded-2xl bg-white dark:bg-[#0d1829] border border-black/[0.07] dark:border-white/[0.07]"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)', maxHeight: '70vh', overflowY: 'auto' }}>
      {loading && (
        <div className="flex items-center gap-3 p-4">
          <div className="h-4 w-4 rounded-full border-2 border-ocean-500 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-400">Qidirilmoqda...</span>
        </div>
      )}
      {!loading && q.length >= 2 && total === 0 && (
        <p className="p-6 text-center text-sm text-slate-400">"{q}" bo'yicha natija topilmadi</p>
      )}
      {!loading && res.fish.length > 0 && (
        <>
          <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">Baliqlar</p>
          {res.fish.map(fish => (
            <button key={fish.id} onClick={() => go(isCustomer ? `/customer/product/${fish.id}` : '/farm/fish')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
              {fish.image_url
                ? <img src={fish.image_url} alt={fish.name} className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
                : <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/20"><Fish className="h-4 w-4 text-sky-500" /></div>}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{fish.name}</p>
                <p className="text-xs text-slate-400">{fish.price?.toLocaleString()} so'm/kg</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
            </button>
          ))}
        </>
      )}
      {!loading && res.farms.length > 0 && (
        <>
          <p className={`px-4 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 ${res.fish.length ? 'pt-3 border-t border-slate-100 dark:border-white/[0.04]' : 'pt-3'}`}>Fermalar</p>
          {res.farms.map(farm => (
            <button key={farm.id} onClick={() => go('/customer/farms')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/20"><Store className="h-4 w-4 text-emerald-500" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{farm.farmName || farm.name}</p>
                <p className="text-xs text-slate-400">{farm.region}, {farm.district}</p>
              </div>
            </button>
          ))}
        </>
      )}
      {!loading && total > 0 && isCustomer && (
        <button onClick={() => go('/customer/fish-catalog')}
          className="w-full border-t border-slate-100 dark:border-white/[0.04] px-4 py-3 text-center text-sm font-semibold text-ocean-600 dark:text-ocean-400 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]">
          Barcha katalogni ko'rish →
        </button>
      )}
    </div>
  )
}

export function Topbar({ onMenuClick, title }) {
  const location = useLocation()
  const user = useAuthStore(s => s.user)
  const role = useAuthStore(s => s.role)
  const logout = useAuthStore(s => s.logout)
  const pushToast = useToastStore(s => s.pushToast)
  const t = useT()
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const ref = useRef(null)

  useEffect(() => { setQ(''); setFocused(false) }, [location.pathname])
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setFocused(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const profileRoutes = {
    customer: '/customer/profile', 'farm-owner': '/farm/profile',
    driver: '/driver/profile', admin: '/admin/settings',
    manager: '/manager/dashboard', 'super-admin': '/super-admin/system-settings',
  }
  const ROLE_COLORS = {
    customer: 'from-sky-500 to-blue-600', 'farm-owner': 'from-emerald-500 to-teal-600',
    driver: 'from-amber-500 to-orange-600', admin: 'from-purple-500 to-violet-600',
    manager: 'from-rose-500 to-pink-600', 'super-admin': 'from-red-500 to-orange-500',
  }
  const initials = user ? `${user.firstName?.[0]||''}${user.lastName?.[0]||''}`.toUpperCase() : 'BS'

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-5 bg-slate-50/90 dark:bg-[#060c18]/90 backdrop-blur-xl border-b border-black/[0.05] dark:border-white/[0.05]" style={{ height: 60 }}>
      <button onClick={onMenuClick}
        className="lg:hidden flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:border-ocean-300 dark:hover:border-ocean-600/40 hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors">
        <Menu className="h-4 w-4" />
      </button>

      <h1 className="hidden sm:block flex-shrink-0 text-[16px] font-bold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">{title}</h1>

      {/* Search */}
      <div ref={ref} className="relative flex-1 max-w-xs ml-auto sm:ml-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 z-10" />
        <input
          className="h-9 w-full rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] pl-9 pr-8 text-[13.5px] text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-ocean-400 dark:focus:border-ocean-500 focus:ring-2 focus:ring-ocean-400/10 dark:focus:ring-ocean-500/15"
          placeholder={t.search}
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          style={{ fontFamily: 'inherit' }}
        />
        {q && (
          <button onClick={() => { setQ(''); setFocused(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-white/[0.07] hover:bg-slate-200 dark:hover:bg-white/[0.12] transition-colors">
            <X className="h-3 w-3 text-slate-500" />
          </button>
        )}
        {focused && q.length >= 2 && <SearchDropdown query={q} onClose={() => { setQ(''); setFocused(false) }} role={role} />}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
        <Link
          to={profileRoutes[role] || '/customer/profile'}
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${ROLE_COLORS[role] || 'from-sky-500 to-blue-600'} text-[12px] font-bold text-white shadow-md hover:scale-105 transition-transform`}>
          {initials}
        </Link>
        <button
          onClick={() => { logout(); pushToast({ title: t.logout, variant: 'success' }); navigate('/login') }}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:border-rose-500/40 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-all"
          title={t.logout}>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
