import type { Ref } from 'vue'
import { createContext } from 'reka-ui'

export const [useLayout, provideLayoutContext] = createContext<{
  title: Ref<string>
  setTitle: (title: string) => void
  showSideMenuButton: () => void
  hideSideMenuButton: () => void
}>('Layout')
