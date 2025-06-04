// src/composables/useEnhancedCombobox.ts
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { NestedOption } from './types'

export function useEnhancedCombobox(props: {
  options: NestedOption[]
  value?: string
  onValueChange?: (value: string, path: NestedOption[]) => void
  onLoadChildren?: (parentId: string) => Promise<NestedOption[]>
  onCreateOption?: (label: string, parentId?: string) => Promise<NestedOption>
  onOptionsUpdate?: (options: NestedOption[]) => void;
  searchPlaceholder: string
  emptyMessage: string
  allowCreate: boolean
  maxDepth: number
}) {
  // ─── STATE ───────────────────────────────────────────────────────────────────
  const searchValue = ref('')
  const currentPath = ref<NestedOption[]>([])
  const allOptions = ref<NestedOption[]>([])
  const loadingStates = reactive<Record<string, boolean>>({})
  const selectedPath = ref<NestedOption[]>([])
  const error = ref<string | null>(null)
  const highlightedIndex = ref(0)
  const filteredOptions = computed(() => getFilteredOptions())
  const loadingContent = ref(false)
  // ─── SYNC PROPS → STATE ───────────────────────────────────────────────────────
  // 1) Initialize allOptions from props.options immediately on mount
  // 2) Keep allOptions in sync any time props.options changes
  watch(
    () => props.options,
    (newOptions) => {
      allOptions.value = [...newOptions]
    },
    { immediate: true },
  )

  // ─── BUILD SELECTED PATH WHEN value OR allOptions CHANGE ──────────────────────
  watch(
    [() => props.value, () => allOptions.value],
    ([newValue, newOptions]) => {
      if (props.value) {
        selectedPath.value = findOptionPath(newOptions, newValue as string)
      } else {
        selectedPath.value = []
      }
    },
    { immediate: true },
  )

  // ─── RESET highlightedIndex WHEN currentPath OR searchValue CHANGE ────────────
  watch([() => currentPath.value, () => searchValue.value], () => {
    highlightedIndex.value = 0
  })

  // ─── KEYBOARD NAVIGATION ──────────────────────────────────────────────────────
  function onKeyDown(e: KeyboardEvent) {
    const filtered = filteredOptions.value
    const canCreateNew =
      props.allowCreate &&
      searchValue.value.trim().length > 0 &&
      !filtered.some((opt) => opt.label.toLowerCase() === searchValue.value.toLowerCase())
    const totalItems = filtered.length + (canCreateNew ? 1 : 0)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        highlightedIndex.value = (highlightedIndex.value + 1) % totalItems
        break

      case 'ArrowUp':
        e.preventDefault()
        highlightedIndex.value = (highlightedIndex.value - 1 + totalItems) % totalItems
        break

      case 'ArrowRight':
        e.preventDefault()
        if (highlightedIndex.value < filtered.length) {
          const option = filtered[highlightedIndex.value]
          if (option.hasChildren || option.children) {
            handleNavigateToChildren(option)
          }
        }
        break

      case 'ArrowLeft':
        e.preventDefault()
        if (currentPath.value.length > 0) {
          handleBack()
        }
        break

      case 'Enter':
        e.preventDefault()
        if (highlightedIndex.value < filtered.length) {
          handleSelect(filtered[highlightedIndex.value])
        } else if (canCreateNew) {
          handleCreateOption(searchValue.value)
        }
        break

      case 'Escape':
        e.preventDefault()
        if (searchValue.value) {
          searchValue.value = ''
        } else if (currentPath.value.length > 0) {
          handleBack()
        }
        break

      case '/':
        // Jump into a matching node if “/” typed and there's an exact match
        if (searchValue.value && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          const matched = filtered.find(
            (opt) => opt.label.toLowerCase() === searchValue.value.toLowerCase(),
          )
          if (matched && (matched.hasChildren || matched.children)) {
            handleNavigateToChildren(matched)
          }
        }
        break
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', onKeyDown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown)
  })

  // ─── HELPERS: FIND PATH & FILTER ──────────────────────────────────────────────
  function findOptionPath(
    options: NestedOption[],
    targetValue: string,
    path: NestedOption[] = [],
  ): NestedOption[] {
    for (const opt of options) {
      const newPath = [...path, opt]
      if (opt.value === targetValue) {
        return newPath
      }
      if (opt.children) {
        const result = findOptionPath(opt.children, targetValue, newPath)
        if (result.length > 0) {
          return result
        }
      }
    }
    return []
  }

  function getCurrentOptions(): NestedOption[] {
    let current = allOptions.value
    for (const step of currentPath.value) {
      const found = current.find((o) => o.id === step.id)
      if (found?.children) {
        current = found.children
      } else {
        // If children have not yet loaded, return empty until load completes
        current = []
      }
    }
    return current
  }

  function getFilteredOptions(): NestedOption[] {
    const currentOpts = getCurrentOptions()
    if (!searchValue.value) {
      return currentOpts
    }
    return currentOpts.filter((opt) =>
      opt.label.toLowerCase().includes(searchValue.value.toLowerCase()),
    )
  }


  const canCreateNew = computed(() => {
    const trimmed = searchValue.value.trim()
    return (
      props.allowCreate &&
      trimmed.length > 0 &&
      !filteredOptions.value.some((opt) => opt.label.toLowerCase() === trimmed.toLowerCase())
    )
  })

  // ─── CALLBACKS: LOAD CHILDREN, CREATE OPTION, SELECT, NAVIGATION ────────────

  async function handleLoadChildren(option: NestedOption) {
    if (!props.onLoadChildren || option.children) return

    loadingStates[option.id] = true
    loadingContent.value = true
    error.value = null

    try {
      const children = await props.onLoadChildren(option.id)

      // Insert the loaded children into allOptions
      const updateOptions = (opts: NestedOption[]): NestedOption[] => {
        return opts.map((opt) => {
          if (opt.id === option.id) {
            return { ...opt, children, hasChildren: children.length > 0 }
          }
          if (opt.children) {
            return { ...opt, children: updateOptions(opt.children) }
          }
          return opt
        })
      }
      const updatedOptions = updateOptions(allOptions.value)
      allOptions.value = updatedOptions

      // Emit the updated options to parent
      props.onOptionsUpdate?.(updatedOptions)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load options'
    } finally {
      loadingStates[option.id] = false
      loadingContent.value = false
    }
  }

  async function handleCreateOption(label: string) {
    if (!props.onCreateOption || !props.allowCreate) return
    error.value = null

    try {
      const parentId =
        currentPath.value.length > 0
          ? currentPath.value[currentPath.value.length - 1].id
          : undefined
      const newOpt = await props.onCreateOption(label, parentId)

      if (!parentId) {
        allOptions.value = [...allOptions.value, newOpt]
      } else {
        const recurse = (arr: NestedOption[]): NestedOption[] => {
          return arr.map((o) => {
            if (o.id === parentId) {
              return {
                ...o,
                children: [...(o.children || []), newOpt],
                hasChildren: true,
              }
            }
            if (o.children) {
              return { ...o, children: recurse(o.children) }
            }
            return o
          })
        }
        allOptions.value = recurse(allOptions.value)
      }

      // Clear search so the “Create New” row disappears
      searchValue.value = ''
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create option'
    }
  }

  function handleSelect(option: NestedOption) {
    const full = [...currentPath.value, option]
    props.onValueChange?.(option.value, full)
    searchValue.value = ''
    currentPath.value = []
    error.value = null
  }

  function handleNavigateToChildren(option: NestedOption) {
    if (currentPath.value.length >= props.maxDepth!) return
    if (option.hasChildren || option.children) {
      if (!option.children && props.onLoadChildren) {
        handleLoadChildren(option)
      }
      currentPath.value = [...currentPath.value, option]
      // Clear out any previous search filter
      searchValue.value = ''
      error.value = null
    }
  }

  function handleBack() {
    currentPath.value = currentPath.value.slice(0, -1)
    searchValue.value = ''
    error.value = null
  }

  function handleBreadcrumbNavigate(index: number) {
    searchValue.value = ''
    if (index === -1) {
      currentPath.value = []
    } else {
      currentPath.value = currentPath.value.slice(0, index + 1)
    }
    error.value = null
  }

  function handleRetry() {
    error.value = null
    if (currentPath.value.length > 0) {
      const last = currentPath.value[currentPath.value.length - 1]
      if (last.hasChildren && !last.children) {
        handleLoadChildren(last)
      }
    }
  }

  function handleClearAndRetry() {
    error.value = null
    currentPath.value = []
    searchValue.value = ''
  }

  // ─── RETURNED STATE & METHODS ────────────────────────────────────────────────
  return {
    searchValue,
    currentPath,
    allOptions,
    loadingStates,
    loadingContent,
    selectedPath,
    error,
    highlightedIndex,
    filteredOptions,
    canCreateNew,
    findOptionPath,
    handleLoadChildren,
    handleCreateOption,
    handleSelect,
    handleNavigateToChildren,
    handleBack,
    handleBreadcrumbNavigate,
    handleRetry,
    handleClearAndRetry,
  }
}
