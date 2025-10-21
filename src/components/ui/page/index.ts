import type { Component, FunctionalComponent, VNode } from 'vue'
import type { Action, ActionHandler } from '@/components/layout'
export { default as Page } from './Page.vue'
export { default as PageFooter } from './PageFooter.vue'
export { default as PageHeader } from './PageHeader.vue'
import {type BadgeVariants} from '@/components/ui/badge'
type UIComponent = Component | FunctionalComponent | VNode
export interface PageBadge {
  text: string
  variant?: BadgeVariants['variant']
  icon?: UIComponent
  classes?: string
  tooltip?: string
}
export interface PageAction {
  icon?: VNode | FunctionalComponent
  text?: string
  variant?: string
  active?: boolean
  onClick?: ActionHandler | Action
}
export type Text = string | {
  text: string
  classes: string
}

export interface MetadataItem {
  label: string
  value: string | UIComponent
  icon?: UIComponent
  variant?: "default" | "muted" | "accent"
}
export interface PageHeaderProps{
  title?:Text;
  titleBadges?: PageBadge[];
  metadata?: MetadataItem[]
  subtitle?: Text;
  hideBackButton?: boolean
  backButtonText?: string
  actions?:{
    primary: PageAction;
    secondary?: PageAction | PageAction[];
  }
}
