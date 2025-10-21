import { computed, type Ref } from 'vue'
import { useBreakpoints, breakpointsTailwind, useWindowSize } from '@vueuse/core'

export type BreakPoint = keyof typeof breakpointsTailwind | number

interface UseMobileOptions {
  /**
   * Custom breakpoint for mobile detection
   * @default 'md' (768px in Tailwind)
   */
  breakpoint?: BreakPoint

  /**
   * Use custom breakpoints object instead of Tailwind defaults
   */
  customBreakpoints?: Record<string, number | string>
}

interface UseMobileReturn {
  /** Reactive boolean indicating if current screen is mobile */
  isMobile: Ref<boolean>

  /** Reactive boolean indicating if current screen is desktop */
  isDesktop: Ref<boolean>

  /** Reactive boolean indicating if current screen is tablet */
  isTablet: Ref<boolean>

  /** All breakpoint states from useBreakpoints */
  breakpoints: Record<string, Ref<boolean>>

  /** Current screen width */
  width: Ref<number>

  /** Current screen height */
  height: Ref<number>
}

/**
 * Composable for detecting mobile devices and screen sizes
 * Uses VueUse's useBreakpoints for reactive screen size detection
 */
export function useMobile(options: UseMobileOptions = {}): UseMobileReturn {
  const {
    breakpoint = 'md',
    customBreakpoints
  } = options

  // Use custom breakpoints or Tailwind defaults
  const breakpointsToUse = customBreakpoints || breakpointsTailwind

  const breakpoints = useBreakpoints(breakpointsToUse)
  const { width, height } = useWindowSize()

  // Handle both string breakpoints and custom numbers
  const isMobile = computed(() => {
    if (typeof breakpoint === 'number') {
      return width.value < breakpoint
    }

    // For string breakpoints, check if we're smaller than that breakpoint
    return !breakpoints[breakpoint].value
  })

  const isDesktop = computed(() => !isMobile.value)

  // Tablet detection (between mobile and desktop)
  const isTablet = computed(() => {
    const currentWidth = width.value

    if (customBreakpoints) {
      // For custom breakpoints, assume tablet is between sm and lg
      const smWidth = Number(customBreakpoints.sm) || 640
      const lgWidth = Number(customBreakpoints.lg) || 1024
      return currentWidth >= smWidth && currentWidth < lgWidth
    }

    // Using Tailwind breakpoints: tablet is between sm (640px) and lg (1024px)
    return breakpoints.between('sm', 'lg').value
  })

  return {
    isMobile,
    isDesktop,
    isTablet,
    breakpoints,
    width,
    height
  }
}
