import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: 'customer',
      token: null,
      rememberMe: true,
      setSession: ({ user, role, token, rememberMe = true }) => {
        // rememberMe=false bo'lsa, sessionStorage ga saqlanadi
        set({ user, role, token, rememberMe })
      },
      setRole: (role) => set({ role }),
      logout: () => set({ user: null, token: null, role: 'customer', rememberMe: true }),
    }),
    {
      name: 'baliq-auth-session',
      // Custom storage — rememberMe ga qarab localStorage yoki sessionStorage
      storage: {
        getItem: (name) => {
          // Avval localStorage, keyin sessionStorage tekshiramiz
          const local = localStorage.getItem(name)
          if (local) return JSON.parse(local)
          const session = sessionStorage.getItem(name)
          if (session) return JSON.parse(session)
          return null
        },
        setItem: (name, value) => {
          const state = value?.state
          if (state?.rememberMe === false) {
            sessionStorage.setItem(name, JSON.stringify(value))
            localStorage.removeItem(name)
          } else {
            localStorage.setItem(name, JSON.stringify(value))
            sessionStorage.removeItem(name)
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
          sessionStorage.removeItem(name)
        },
      },
    },
  ),
)
