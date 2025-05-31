import './assets/main.css'

import App from './App.vue'
import { Button } from '@/components/ui/button'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import { createApp } from 'vue'

const app = createApp(App)
const pinia = createPinia().use(piniaPluginPersistedstate)

app.use(pinia).use(router).component('Button', Button)

app.mount('#app')
