import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROLES } from '../types/entities.js'

// Dinamik storage: har bir operatsiyada rememberMe ni tekshiradi
const dynamicStorage = {
  getItem: (name) => {
    const remember = window.localStorage.getItem('baliq-remember-me')
    if (remember === 'false') {
      return window.sessionStorage.getItem(name)
    }
    return window.localStorage.getItem(name)
  },
  setItem: (name, value) => {
    const remember = window.localStorage.getItem('baliq-remember-me')
    if (remember === 'false') {
      window.sessionStorage.setItem(name, value)
      window.localStorage.removeItem(name)
    } else {
      window.localStorage.setItem(name, value)
      window.sessionStorage.removeItem(name)
    }
  },
  removeItem: (name) => {
    window.localStorage.removeItem(name)
    window.sessionStorage.removeItem(name)
  },
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: ROLES.CUSTOMER,
      token: null,
      rememberMe: true,
      setSession: ({ user, role, token, rememberMe = true }) => {
        window.localStorage.setItem('baliq-remember-me', String(rememberMe))
        set({ user, role, token, rememberMe })
      },
      setRole: (role) => set({ role }),
      logout: () => {
        window.localStorage.removeItem('baliq-remember-me')
        window.localStorage.removeItem('baliq-auth-session')
        window.sessionStorage.removeItem('baliq-auth-session')
        set({ user: null, token: null, role: ROLES.CUSTOMER })
      },
    }),
    {
      name: 'baliq-auth-session',
      storage: dynamicStorage,
    },
  ),
)
