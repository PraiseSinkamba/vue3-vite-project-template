// src/types.ts
export interface NestedOption {
  id: string;
  label: string;
  value: string;
  children?: NestedOption[];
  parent?: string;
  isLoading?: boolean;
  hasChildren?: boolean;
  metadata?: Record<string, any>;
}

export interface EnhancedComboboxProps {
  options: NestedOption[];
  value?: string;
  onValueChange?: (value: string, path: NestedOption[]) => void;
  onLoadChildren?: (parentId: string) => Promise<NestedOption[]>;
  onCreateOption?: (label: string, parentId?: string) => Promise<NestedOption>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  maxDepth?: number;
}

export interface BreadcrumbProps {
  path: NestedOption[];
  onNavigate: (index: number) => void;
  className?: string;
}

export interface ErrorRecoveryProps {
  error: string;
  onRetry: () => void;
  onGoBack: () => void;
  onClearAndRetry: () => void;
  canGoBack: boolean;
}
