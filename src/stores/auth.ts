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
          const id = session.user.id
          const { data: profile } = await supabase.from('profiles')
            .select('*')
            .or(`id.eq.${id},auth_id.eq.${id}`)
            .single()
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
          const id = session.user.id
          const { data: profile } = await supabase.from('profiles')
            .select('*')
            .or(`id.eq.${id},auth_id.eq.${id}`)
            .single()
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
      const id = this.user.user.id
      const { data, error } = await supabase.from('profiles')
        .select('*')
        .or(`id.eq.${id},auth_id.eq.${id}`)
        .single()
      if (error) throw error
      this.user.profile = data as Profile
    },

    // Client authentication methods
    async clientSignUpWithPassword(credentials: {
      email: string
      password: string
      fullName: string
      phone: string
      preferredLanguage: 'en' | 'tr'
    }): Promise<void> {
      // Sign up user with Supabase Auth and metadata
      // The profile will be created automatically by database trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            // These fields match profile fields and will be used by trigger
            full_name: credentials.fullName,
            phone: credentials.phone,
            whatsapp_number: credentials.phone, // Default to same as phone
            role: 'client',
            preferred_language: credentials.preferredLanguage,
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user account')
      const id = authData.user.id
      // Fetch the created profile (created by trigger)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${id},auth_id.eq.${id}`)
        .single()

      if (profileError) throw profileError

      // Set user in store
      this.user = {
        user: authData.user,
        profile: profile as Profile,
      }
    },

    async clientSignInWithPassword(credentials: {
      email: string
      password: string
    }): Promise<void> {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to sign in')

      // 2. Fetch profile
      const id = authData.user.id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${id},auth_id.eq.${id}`)
        .single()

      if (profileError) throw profileError

      // 3. Set user in store
      this.user = {
        user: authData.user,
        profile: profile as Profile,
      }
    },

    async signInWithGoogle(): Promise<void> {
      // Build redirect URL with current booking query parameters
      const currentUrl = new URL(window.location.href)
      const bookingParams = new URLSearchParams()

      // Preserve booking context
      if (currentUrl.searchParams.has('service')) {
        bookingParams.set('service', currentUrl.searchParams.get('service')!)
      }
      if (currentUrl.searchParams.has('addons')) {
        bookingParams.set('addons', currentUrl.searchParams.get('addons')!)
      }

      const redirectTo = `${window.location.origin}/booking${bookingParams.toString() ? '?' + bookingParams.toString() : ''}`

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            // These will be available in the callback URL
            role: 'client',
            preferred_language: localStorage.getItem('user-locale') || 'en',
          },
        },
      })

      if (error) throw error
      // Note: User will be redirected to Google OAuth flow
      // On return, the auth state change listener will handle setting the user
      // For new Google users, the trigger will create profile with user metadata
      // Full name, email, and avatar will come from Google profile
    },

    async signOut(): Promise<void> {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      this.user = null
    }
  },
  persist: {
    key: 'auth',
    storage: localStorage,
  }
});
