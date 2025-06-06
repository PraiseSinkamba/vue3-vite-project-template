import type { FunctionalComponent, VNode } from 'vue'

export { default as DropdownMenu } from './DropdownMenu.vue'

export { default as DropdownMenuCheckboxItem } from './DropdownMenuCheckboxItem.vue'
export { default as DropdownMenuContent } from './DropdownMenuContent.vue'
export { default as DropdownMenuGroup } from './DropdownMenuGroup.vue'
export { default as DropdownMenuItem } from './DropdownMenuItem.vue'
export { default as DropdownMenuLabel } from './DropdownMenuLabel.vue'
export { default as DropdownMenuRadioGroup } from './DropdownMenuRadioGroup.vue'
export { default as DropdownMenuRadioItem } from './DropdownMenuRadioItem.vue'
export { default as DropdownMenuSeparator } from './DropdownMenuSeparator.vue'
export { default as DropdownMenuShortcut } from './DropdownMenuShortcut.vue'
export { default as DropdownMenuSub } from './DropdownMenuSub.vue'
export { default as DropdownMenuSubContent } from './DropdownMenuSubContent.vue'
export { default as DropdownMenuSubTrigger } from './DropdownMenuSubTrigger.vue'
export { default as DropdownMenuTrigger } from './DropdownMenuTrigger.vue'
export { default as QuickDropdown } from './QuickDropdown.vue'
export { default as ResponsiveMenu } from './ResponsiveDropdown.vue'
export { DropdownMenuPortal } from 'reka-ui'
export interface MenuItem {
  id: string
  label: string
  icon?: FunctionalComponent | VNode
  variant?: 'default' | 'destructive'
  disabled?: boolean
  separator?: boolean
  children?: MenuItem[]
  onClick?: () => void
}
