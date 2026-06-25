import { useState, useRef, useEffect } from 'react'
import { Menu, Search, LogOut, X, Fish, Store, ExternalLink } from 'lucide-react'
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

  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      setResults({ fish: [], farms: [] })
      return
    }
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
  const isCustomer = ['customer', 'farm-owner'].includes(role)

  const goTo = (path) => { navigate(path); onClose() }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/[0.06] max-h-[70vh] overflow-y-auto">
      {loading && (
        <div className="p-4 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full border-2 border-ocean-500 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-500">Qidirilmoqda...</span>
        </div>
      )}

      {!loading && debouncedQ.length >= 2 && total === 0 && (
        <div className="p-6 text-center">
          <p className="text-sm font-semibold text-slate-500">"{debouncedQ}" bo'yicha natija topilmadi</p>
        </div>
      )}

      {!loading && results.fish.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Baliqlar</p>
          {results.fish.map((fish) => (
            <button
              key={fish.id}
              onClick={() => goTo(isCustomer ? `/customer/product/${fish.id}` : `/farm/fish`)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.04] transition"
            >
              {fish.image_url
                ? <img src={fish.image_url} alt={fish.name} className="h-9 w-9 rounded-xl object-cover flex-shrink-0" />
                : <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-100 dark:bg-ocean-900/30 flex-shrink-0">
                    <Fish className="h-4 w-4 text-ocean-600" />
                  </div>
              }
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{fish.name}</p>
                <p className="text-xs text-slate-500">{fish.price?.toLocaleString()} so'm/kg · {fish.category}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {!loading && results.farms.length > 0 && (
        <div>
          <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">Fermalar</p>
          {results.farms.map((farm) => (
            <button
              key={farm.id}
              onClick={() => goTo(`/customer/farms`)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.04] transition"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                <Store className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{farm.farmName || farm.name}</p>
                <p className="text-xs text-slate-500">{farm.region}, {farm.district}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {!loading && total > 0 && isCustomer && (
        <div className="border-t border-slate-100 dark:border-white/5 p-2">
          <button
            onClick={() => goTo(`/customer/fish-catalog`)}
            className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-ocean-600 hover:bg-ocean-50 dark:hover:bg-ocean-900/20 transition text-center"
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
  const dropdownRef = useRef(null)

  // Reset search on route change
  useEffect(() => {
    setSearchQuery('')
    setSearchFocused(false)
  }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setSearchFocused(false)
      }
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

  const handleLogout = () => {
    logout()
    pushToast({ title: 'Tizimdan chiqildi', variant: 'success' })
    navigate('/login')
  }

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'BS'

  const showDropdown = searchFocused && searchQuery.length >= 2

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#07101e]/90 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 lg:hidden"
          onClick={onMenuClick}
          aria-label="Menyu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h1>
        </div>

        {/* Search */}
        <div className="relative hidden max-w-52 flex-1 md:block lg:max-w-xs" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
          <input
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm outline-none transition
                       focus:border-ocean-400 focus:bg-white focus:ring-2 focus:ring-ocean-100
                       dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10 dark:focus:ring-ocean-900/40"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchFocused(false) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
          {showDropdown && (
            <div ref={dropdownRef}>
              <SearchDropdown
                query={searchQuery}
                onClose={() => { setSearchQuery(''); setSearchFocused(false) }}
                role={role}
              />
            </div>
          )}
        </div>

        {/* Right buttons */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationBell />

          {/* Avatar */}
          <Link
            to={profileRoutes[role] || '/customer/profile'}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 text-xs font-black text-white shadow-glow-sm transition hover:shadow-glow hover:scale-105"
            title={user ? `${user.firstName} ${user.lastName}` : 'Profil'}
          >
            {initials}
          </Link>

          {/* Logout */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
            onClick={handleLogout}
            title="Tizimdan chiqish"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
