import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore.js'

// Har bir rol uchun ruxsat berilgan asosiy yo'l
const ROLE_HOME = {
  'customer':    '/customer/dashboard',
  'farm-owner':  '/farm/dashboard',
  'driver':      '/driver/dashboard',
  'admin':       '/admin/dashboard',
  'manager':     '/manager/dashboard',
  'super-admin': '/super-admin/system-statistics',
}

// Har bir prefix qaysi rollarga ruxsat beradi
const ROUTE_ROLES = {
  '/customer':    ['customer'],
  '/farm':        ['farm-owner'],
  '/driver':      ['driver'],
  '/admin':       ['admin', 'super-admin'],
  '/manager':     ['manager', 'admin', 'super-admin'],
  '/super-admin': ['super-admin'],
}

export function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  const role  = useAuthStore((s) => s.role)
  const location = useLocation()

  // 1. Login qilmagan — /login ga yuboramiz
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // 2. Rol tekshiruvi — bu sahifaga kirish huquqi bormi?
  const matchedPrefix = Object.keys(ROUTE_ROLES).find((prefix) =>
    location.pathname.startsWith(prefix)
  )

  if (matchedPrefix) {
    const allowed = ROUTE_ROLES[matchedPrefix]
    if (!allowed.includes(role)) {
      // Ruxsat yo'q — o'z sahifasiga yuboramiz
      const home = ROLE_HOME[role] || '/login'
      return <Navigate to={home} replace />
    }
  }

  return children
}
