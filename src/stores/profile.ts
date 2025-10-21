import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Profile } from '@/types'

export const useProfile = defineStore('profile', {
  state: () => ({}),

  getters: {
    isAuthenticated(): boolean {
      const auth = useAuthStore()
      return auth.isAuthenticated
    },

    profile(): Profile | null {
      const auth = useAuthStore()
      return auth.userProfile as Profile
    },

    role(): string {
      const auth = useAuthStore()
      return auth.userRole
    },

    fullName(): string {
      const auth = useAuthStore()
      return auth.userProfile?.full_name as string
    },

    firstName(): string {
      const auth = useAuthStore()
      return auth.userProfile?.full_name?.split(' ')[0] as string
    },

    initials(): string {
      const auth = useAuthStore()
      return (
        auth.userProfile?.full_name
          ?.split(' ')
          .map((name) => name[0].toUpperCase())
          .join('') ?? ''
      )
    },
  },

  actions: {},
})
