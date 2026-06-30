import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ROLES } from '../types/entities.js'

// "Meni eslab qol" — true bo'lsa localStorage (doimiy), false bo'lsa sessionStorage (faqat shu tab/sessiya)
function getStorage() {
  const remember = window.localStorage.getItem('baliq-remember-me')
  return remember === 'false' ? window.sessionStorage : window.localStorage
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
        set({ user: null, token: null, role: ROLES.CUSTOMER })
      },
    }),
    {
      name: 'baliq-auth-session',
      storage: createJSONStorage(getStorage),
    },
  ),
)
