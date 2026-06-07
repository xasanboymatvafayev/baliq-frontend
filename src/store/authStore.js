import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ROLES } from '../types/entities.js'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: ROLES.CUSTOMER,
      token: null,
      setSession: ({ user, role, token }) => set({ user, role, token }),
      setRole: (role) => set({ role }),
      logout: () => set({ user: null, token: null, role: ROLES.CUSTOMER }),
    }),
    { name: 'baliq-auth-session' },
  ),
)
