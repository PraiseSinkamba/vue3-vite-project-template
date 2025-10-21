import './assets/main.css'

import App from '@/App.vue'
import { Button } from '@/components/ui/button'
import { install } from '@/lib/pinia'
import { PiniaColada } from '@pinia/colada'
import router from '@/router'
import { createApp } from 'vue'
import i18n from '@/i18n'

const app = createApp(App)
install(app)
app.use(i18n)
app.use(PiniaColada, {
  queryOptions: {
    gcTime: (1000 * 60/*1min*/) * 5, //5min,
    staleTime: (1000 * 60/*1min*/) * 20, //20min,
    // refetchOnWindowFocus: false,
  }
})
  .use(router)
  .component('Button', Button)

app.mount('#app')
