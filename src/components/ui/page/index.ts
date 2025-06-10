import type { Component, FunctionalComponent, VNode } from 'vue'
import type { SingleItem } from '@/components/layout'

export { default as Page } from './Page.vue'
export { default as PageFooter } from './PageFooter.vue'
export { default as LoadingSpinner } from './LoadingSpinner.vue'

export interface PageBadge {
  text: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  icon?: Component | FunctionalComponent | VNode
  classes?: string
  tooltip?: string
}

export type Action = Omit<SingleItem, 'type'>

export interface PageHeaderProps{
  title?:string;
  titleBadges?: PageBadge[];
  subtitle?: string;
  actions?:{
    primary: Action;
    secondary: Action | Action[];
  }
}
