import { useColorMode, usePreferredDark } from '@vueuse/core'

export function useDarkMode() {
  const preferredDark = usePreferredDark()
  const currentTheme = useColorMode({ initialValue: preferredDark.value ? 'dark' : 'light' })

  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
  }

  function setDarkMode(darkMode: boolean) {
    currentTheme.value = darkMode ? 'dark' : 'light'
  }

  return {
    preferredDark,
    currentTheme,
    toggleTheme,
    setDarkMode
  }
}
