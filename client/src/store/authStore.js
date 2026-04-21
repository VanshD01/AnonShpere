import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      register: async (password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/register', { password })
          set({ user: data.data, token: data.data.token, isLoading: false })
          return data.data
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed'
          set({ error: msg, isLoading: false })
          throw new Error(msg)
        }
      },

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login', { username, password })
          set({ user: data.data, token: data.data.token, isLoading: false })
          return data.data
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed'
          set({ error: msg, isLoading: false })
          throw new Error(msg)
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null })
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'anonsphere-auth', // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
