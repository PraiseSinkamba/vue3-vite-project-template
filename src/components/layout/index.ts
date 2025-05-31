import type { FunctionalComponent, VNode } from 'vue'
import type { RouteLocationRaw } from 'vue-router' // If using Vue Router

// ======================
// Core Action Type
// ======================
type ActionHandler = () => void

interface ActionProperties {
  icon?: VNode | FunctionalComponent
  label?: string
  action: () => void
  items?: MenuItemAction[]
}

type Action = ActionHandler & ActionProperties

interface MenuItemAction {
  label: string
  action: ActionHandler
  icon?: VNode | FunctionalComponent
  badge?: string | number
}

// Action factory function
function createAction(handler: ActionHandler, props?: Omit<Partial<Action>, 'action'>): Action {
  const action = () => handler()
  return <Action>Object.assign(action, props)
}

function actionHas<K extends keyof ActionProperties>(
  key: K,
  action: Action | ActionHandler,
): action is Action {
  return typeof action === 'object' && key in action && (action as any)[key] !== undefined
}

function isPlainActionHandler(action: Action | ActionHandler): action is ActionHandler {
  return (
    typeof action === 'function' &&
    !('icon' in action) &&
    !('label' in action) &&
    !('items' in action) &&
    !('action' in action)
  )
}

// Type guard to check for extended action type
function isExtendedAction(action: Action | ActionHandler): action is Action {
  return (
    typeof action === 'object' &&
    ('icon' in action || 'label' in action || 'items' in action || 'action' in action)
  )
}

function handleAction(action: Action|ActionHandler){
  if(isExtendedAction(action)) action.action()
  else if(isPlainActionHandler(action)) action()
}

// ======================
// Sidebar Item Types
// ======================
type SidebarItemType = 'item' | 'group' | 'menu' | 'separator'

interface BaseItem {
  type: SidebarItemType
  icon?: VNode | FunctionalComponent
  label?: string
}

interface SeparatorItem extends BaseItem {
  type: 'separator'
}

interface SingleItem extends BaseItem {
  type: 'item'
  active?: boolean
  action?: ActionHandler | Action
  variant?: 'default'|'destructive'
  classes?: string
  badge?: string | number
  path?: string
  to?: RouteLocationRaw
}

interface MenuItem extends BaseItem {
  type: 'menu'
  collapsible?: boolean
  defaultOpen?: boolean
  submenu?: boolean
  children: SingleItem[] // Only SingleItems in menus
}

interface GroupItem extends BaseItem {
  type: 'group'
  collapsible?: boolean
  defaultOpen?: boolean
  action?: Action | ActionHandler
  children: (SingleItem | MenuItem)[] // Only SingleItems or MenuItems in groups
}

// Top-level sidebar items can only be groups or separators
type SidebarItem = GroupItem | SeparatorItem

// ======================
// Sidebar Props
// ======================
interface SidebarProps {
  side?: 'left' | 'right'
  variant?: 'sidebar' | 'floating' | 'inset'
  collapsible?: 'offcanvas' | 'icon' | 'none'
  rail?: boolean
  modelValue?: boolean
  content: SidebarItem[]
  width?: string
  collapsedWidth?: string
}

export type {
  Action,
  ActionHandler,
  ActionProperties,
  MenuItemAction,
  SeparatorItem,
  SingleItem,
  GroupItem,
  MenuItem,
  SidebarItem,
  SidebarProps,
}
export { createAction, actionHas, isPlainActionHandler, isExtendedAction,handleAction }
