import { useState, useRef, useEffect } from 'react'
import { Menu, Search, X, Fish, Store, ExternalLink, Bell } from 'lucide-react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../common/ThemeToggle.jsx'
import { NotificationBell } from '../common/NotificationBell.jsx'
import { useAuthStore } from '../../store/authStore.js'
import { useToastStore } from '../../store/toastStore.js'
import { httpClient } from '../../services/api/index.js'

function useDebounce(value, delay = 350) {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

function SearchDropdown({ query, onClose, role }) {
  const navigate = useNavigate()
  const [results, setResults] = useState({ fish: [], farms: [] })
  const [loading, setLoading] = useState(false)
  const debouncedQ = useDebounce(query)
  const isCustomer = ['customer', 'farm-owner'].includes(role)

  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) { setResults({ fish: [], farms: [] }); return }
    setLoading(true)
    Promise.allSettled([
      httpClient.get(`/fish?search=${encodeURIComponent(debouncedQ)}&limit=5`),
      httpClient.get(`/farms?search=${encodeURIComponent(debouncedQ)}&status=APPROVED&limit=4`),
    ]).then(([fishRes, farmRes]) => {
      const fishData = fishRes.status === 'fulfilled'
        ? (Array.isArray(fishRes.value) ? fishRes.value : fishRes.value?.data || fishRes.value?.fish || [])
        : []
      const farmData = farmRes.status === 'fulfilled'
        ? (Array.isArray(farmRes.value) ? farmRes.value : farmRes.value?.data || farmRes.value?.farms || [])
        : []
      setResults({ fish: fishData.slice(0, 5), farms: farmData.slice(0, 4) })
    }).finally(() => setLoading(false))
  }, [debouncedQ])

  const total = results.fish.length + results.farms.length
  const goTo = (path) => { navigate(path); onClose() }

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden animate-scale-in"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)', maxHeight: '70vh', overflowY: 'auto' }}
    >
      {loading && (
        <div className="flex items-center gap-3 p-4">
          <div className="h-4 w-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-400">Qidirilmoqda...</span>
        </div>
      )}

      {!loading && debouncedQ.length >= 2 && total === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm font-semibold text-slate-400">"{debouncedQ}" bo'yicha natija topilmadi</p>
        </div>
      )}

      {!loading && results.fish.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">🐟 Baliqlar</p>
          {results.fish.map((fish) => (
            <button
              key={fish.id}
              onClick={() => goTo(isCustomer ? `/customer/product/${fish.id}` : `/farm/fish`)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
            >
              {fish.image_url
                ? <img src={fish.image_url} alt={fish.name} className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
                : <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <Fish className="h-4 w-4 text-sky-500" />
                  </div>
              }
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{fish.name}</p>
                <p className="text-xs text-slate-400">{fish.price?.toLocaleString()} so'm/kg</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {!loading && results.farms.length > 0 && (
        <div style={{ borderTop: results.fish.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">🏡 Fermalar</p>
          {results.farms.map((farm) => (
            <button
              key={farm.id}
              onClick={() => goTo('/customer/farms')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)' }}>
                <Store className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">{farm.farmName || farm.name}</p>
                <p className="text-xs text-slate-400">{farm.region}, {farm.district}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {!loading && total > 0 && isCustomer && (
        <div style={{ borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => goTo('/customer/fish-catalog')}
            className="w-full px-4 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50 text-center"
          >
            Barcha katalogni ko'rish →
          </button>
        </div>
      )}
    </div>
  )
}

export function Topbar({ onMenuClick, title }) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const pushToast = useToastStore((s) => s.pushToast)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => { setSearchQuery(''); setSearchFocused(false) }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const profileRoutes = {
    customer: '/customer/profile',
    'farm-owner': '/farm/profile',
    driver: '/driver/profile',
    admin: '/admin/settings',
    manager: '/manager/dashboard',
    'super-admin': '/super-admin/system-settings',
  }

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'BS'

  const showDropdown = searchFocused && searchQuery.length >= 2

  return (
    <header
      className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 sm:px-6"
      style={{
        background: 'rgba(240,244,248,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Mobile menu */}
      <button
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition lg:hidden"
        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b' }}
        onClick={onMenuClick}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Title */}
      <h1 className="flex-shrink-0 text-[17px] font-bold tracking-tight text-slate-800 hidden sm:block">{title}</h1>

      {/* Search */}
      <div className="relative flex-1 max-w-xs ml-auto sm:ml-4" ref={searchRef}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 z-10" />
        <input
          className="h-9 w-full rounded-xl pl-9 pr-8 text-[13px] outline-none transition-all"
          style={{
            background: '#fff',
            border: '1.5px solid rgba(0,0,0,0.08)',
            color: '#0f172a',
            fontFamily: 'inherit',
          }}
          placeholder="Qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSearchFocused(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            <X className="h-3 w-3 text-slate-400" />
          </button>
        )}
        {showDropdown && (
          <SearchDropdown query={searchQuery} onClose={() => { setSearchQuery(''); setSearchFocused(false) }} role={role} />
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ThemeToggle />
        <NotificationBell />

        <Link
          to={profileRoutes[role] || '/customer/profile'}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[12px] font-bold text-white transition hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}
        >
          {initials}
        </Link>
      </div>
    </header>
  )
}
