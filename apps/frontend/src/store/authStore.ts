import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthorInfo } from '@weekly/shared'
import { api } from '@/lib/api'

interface AuthState {
  user: Omit<AuthorInfo, 'password'> | null
  token: string | null
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  register: (data: { name: string; dept: string; rank: string; email: string; password: string }) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
  updateMe: (data: { name?: string; dept?: string; rank?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password, remember = true) => {
        const res = await api.post('/api/auth/login', { email, password })
        const { user, token } = res.data.data
        if (remember) {
          localStorage.setItem('auth_token', token)
          sessionStorage.removeItem('auth_token')
        } else {
          sessionStorage.setItem('auth_token', token)
          localStorage.removeItem('auth_token')
        }
        set({ user, token })
      },

      register: async (data) => {
        const res = await api.post('/api/auth/register', data)
        const { user, token } = res.data.data
        localStorage.setItem('auth_token', token)
        set({ user, token })
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
        set({ user: null, token: null })
      },

      fetchMe: async () => {
        const res = await api.get('/api/auth/me')
        set({ user: res.data.data })
      },

      updateMe: async (data) => {
        const res = await api.patch('/api/auth/me', data)
        set({ user: res.data.data })
      },
    }),
    { name: 'auth-store', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)
