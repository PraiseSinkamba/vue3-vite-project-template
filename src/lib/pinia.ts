import {createPinia} from "pinia";
import { type App, markRaw } from 'vue'
import router from "@/router";
import type { Router } from "vue-router";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router
  }
}

export const install = (app: App) => {
  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  pinia.use(({ store }) => {
    store.router = markRaw(router)
  });
  app.use(pinia)
}
