<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useProfile } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../icons/Logo.vue'
import { useI18n } from 'vue-i18n'
import { Settings } from 'lucide-vue-next'

// Stores
const profileStore = useProfile()
const authStore = useAuthStore()
const { isAuthenticated, initials, fullName, profile } = storeToRefs(profileStore)
const { isAdmin, isTechnician } = storeToRefs(authStore)

// Router
const router = useRouter()

// i18n
const { locale } = useI18n()
const currentLanguage = ref(locale.value)

// State
const isMobileMenuOpen = ref(false)

// Navigation items
const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
]

// Check if user has admin access (admin or technician)
const hasAdminAccess = ref(isAdmin.value || isTechnician.value)

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleLanguage = () => {
  const newLanguage = currentLanguage.value === 'en' ? 'tr' : 'en'
  currentLanguage.value = newLanguage
  locale.value = newLanguage
}

const goToAdmin = () => {
  router.push('/admin')
  closeMobileMenu()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Mobile Overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="closeMobileMenu"
    ></div>

    <!-- Mobile Side Drawer -->
    <div
      :class="[
        'fixed inset-y-0 left-0 w-80 bg-background border-r shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Mobile Header -->
        <div class="flex items-center justify-between p-6 border-b">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span class="text-primary font-bold text-lg">PF</span>
            </div>
            <span class="text-xl font-semibold text-foreground">Perfect Finish</span>
          </div>
          <button @click="closeMobileMenu" class="p-2 rounded-lg hover:bg-accent transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <div class="flex-1 px-6 py-8">
          <nav class="space-y-4">
            <a
              v-for="item in navItems"
              :key="item.name"
              :href="item.href"
              class="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors font-medium"
              @click="closeMobileMenu"
            >
              {{ item.name }}
            </a>
          </nav>
        </div>

        <!-- Mobile Auth Section -->
        <div class="p-6 border-t">
          <!-- Mobile Language Toggle -->
          <div class="mb-4">
            <button
              @click="toggleLanguage"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              {{ currentLanguage === 'en' ? '🇹🇷 Türkçe' : '🇺🇸 English' }}
            </button>
          </div>

          <div v-if="!isAuthenticated" class="space-y-3">
            <button class="w-full px-4 py-2 text-primary hover:text-primary/80 font-medium">
              Login
            </button>
          </div>
          <div v-else class="space-y-4">
            <div class="flex items-center space-x-3 p-3 bg-accent rounded-lg">
              <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span class="text-primary-foreground font-medium text-sm">{{ initials }}</span>
              </div>
              <div>
                <p class="font-medium text-foreground">{{ fullName || profile?.full_name }}</p>
                <p class="text-sm text-muted-foreground">{{ profile?.email }}</p>
              </div>
            </div>
            <button
              v-if="hasAdminAccess"
              @click="goToAdmin"
              class="w-full flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-lg hover:bg-accent transition-colors font-medium"
            >
              <Settings class="w-4 h-4" />
              Admin Panel
            </button>
            <button
              class="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Navbar -->
    <header class="bg-background border-b shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <Logo />
            <span class="text-xl font-semibold text-foreground hidden sm:block"
              >Perfect Finish</span
            >
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center space-x-8">
            <a
              v-for="item in navItems"
              :key="item.name"
              :href="item.href"
              class="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              {{ item.name }}
            </a>
          </nav>

          <!-- Desktop Auth Section -->
          <div class="flex items-center space-x-4">
            <!-- Language Toggle -->
            <button
              @click="toggleLanguage"
              class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {{ currentLanguage === 'en' ? '🇹🇷 TR' : '🇺🇸 EN' }}
            </button>

            <!-- Mobile Menu Button -->
            <button
              @click="toggleMobileMenu"
              class="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            <!-- Desktop Auth -->
            <div v-if="!isAuthenticated" class="hidden lg:block">
              <button class="text-primary hover:text-primary/80 font-medium px-4 py-2">
                Login
              </button>
            </div>
            <div v-else class="hidden lg:flex items-center space-x-4">
              <button
                v-if="hasAdminAccess"
                @click="goToAdmin"
                class="flex items-center gap-2 border border-border text-foreground px-4 py-2 rounded-lg hover:bg-accent transition-colors font-medium"
              >
                <Settings class="w-4 h-4" />
                Admin Panel
              </button>
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span class="text-primary-foreground font-medium text-sm">{{ initials }}</span>
                </div>
                <span class="text-foreground font-medium">{{
                  fullName || profile?.full_name
                }}</span>
              </div>
              <button
                class="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-background border-t">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Brand Section -->
          <div class="lg:col-span-1">
            <div class="flex items-center space-x-3 mb-4">
              <Logo />
              <span class="text-xl font-semibold text-foreground">Perfect Finish</span>
            </div>
            <p class="text-muted-foreground text-sm mb-4">
              Where beauty meets excellence. Experience luxury beauty services in our elegant salon.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="text-muted-foreground hover:text-primary transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"
                  />
                </svg>
              </a>
              <a href="#" class="text-muted-foreground hover:text-primary transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                  />
                </svg>
              </a>
              <a href="#" class="text-muted-foreground hover:text-primary transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-foreground font-semibold mb-4">Quick Links</h3>
            <ul class="space-y-3">
              <li>
                <a href="#" class="text-muted-foreground hover:text-primary transition-colors">Home</a>
              </li>
              <li>
                <a href="#" class="text-muted-foreground hover:text-primary transition-colors"
                  >Services</a
                >
              </li>
              <li>
                <a href="#" class="text-muted-foreground hover:text-primary transition-colors"
                  >Portfolio</a
                >
              </li>
              <li>
                <a href="#" class="text-muted-foreground hover:text-primary transition-colors"
                  >Book Appointment</a
                >
              </li>
              <li>
                <a href="#" class="text-muted-foreground hover:text-primary transition-colors"
                  >Loyalty Program</a
                >
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="text-foreground font-semibold mb-4">Contact Info</h3>
            <ul class="space-y-3">
              <li class="flex items-start space-x-3">
                <svg
                  class="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </svg>
                <span class="text-muted-foreground text-sm">123 Beauty Street, Salon City, SC 12345</span>
              </li>
              <li class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-primary flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                  />
                </svg>
                <span class="text-muted-foreground text-sm">(555) 123-4567</span>
              </li>
              <li class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-primary flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                  />
                </svg>
                <span class="text-muted-foreground text-sm">hello@perfectfinish.com</span>
              </li>
            </ul>
          </div>

          <!-- Hours -->
          <div>
            <h3 class="text-foreground font-semibold mb-4">Hours</h3>
            <ul class="space-y-2">
              <li class="flex justify-between text-sm">
                <span class="text-muted-foreground">Mon - Fri:</span>
                <span class="text-foreground">9:00 AM - 7:00 PM</span>
              </li>
              <li class="flex justify-between text-sm">
                <span class="text-muted-foreground">Saturday:</span>
                <span class="text-foreground">9:00 AM - 6:00 PM</span>
              </li>
              <li class="flex justify-between text-sm">
                <span class="text-muted-foreground">Sunday:</span>
                <span class="text-foreground">10:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="border-t mt-12 pt-8">
          <div class="flex flex-col sm:flex-row justify-between items-center">
            <p class="text-muted-foreground text-sm">
              © {{ new Date().getFullYear() }} Perfect Finish. All rights reserved.
            </p>
            <div class="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" class="text-muted-foreground hover:text-primary text-sm transition-colors"
                >Privacy Policy</a
              >
              <a href="#" class="text-muted-foreground hover:text-primary text-sm transition-colors"
                >Terms of Service</a
              >
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
