import { supabase } from '@/lib/supabase';
import type { AuthenticatedUser, MutationOptions, Profile } from '@/types';
import { useMutation } from '@pinia/colada';
import type { AuthError, SignInWithPasswordCredentials } from '@supabase/supabase-js'
import { defineStore } from "pinia";


interface Store {
  user: AuthenticatedUser | null
}

export const useAuthStore = defineStore("auth", {
  state: (): Store => ({
    user: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.user,
    userProfile: (state): Profile | null => state.user?.profile as Profile,
    userRole: (state): 'admin' | 'technician' | 'client' | string => state.user?.profile?.role as string,
    isAdmin: (state): boolean => state.user?.profile?.role === 'admin',
    isTechnician: (state): boolean => state.user?.profile?.role === 'technician',
    isClient: (state): boolean => state.user?.profile?.role === 'client',
  },
  actions: {
    async initialize(): Promise<void> {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          if (profile) {
            this.user = {
              user: session.user,
              profile: profile as Profile
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          this.user = null
        } else if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
          if (profile) {
            this.user = {
              user: session.user,
              profile: profile as Profile
            }
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          if (this.user?.user) {
            this.user.user = session.user
          }
        }
      })
    },
    adminPasswordSigninMutation(options: MutationOptions<void, SignInWithPasswordCredentials, AuthError> = {}) {
      return useMutation({
        mutation: async (credentials: SignInWithPasswordCredentials) => {
          const { error } = await supabase.auth.signInWithPassword(credentials)
          if (error) throw error
        },
        ...options
      })
    },
    async fetchProfile() {
      if (!this.user) return
      const { data, error } = await supabase.from('profiles').select('*').eq('id', this.user.user.id).single()
      if (error) throw error
      this.user.profile = data as Profile
    }
  },
  persist: {
    key: 'auth',
    storage: localStorage,
  }
});
