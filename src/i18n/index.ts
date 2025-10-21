import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import tr from "./locales/tr.json"

const persistedLocale = localStorage.getItem("user-locale")
export default createI18n({
  locale: persistedLocale || 'en',
  fallbackLocale: 'en',
  legacy: false,
  globalInjection: true,
  messages:{
    en,
    tr
  }
})
