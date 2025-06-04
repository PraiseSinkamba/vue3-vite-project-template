import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function typedEntries<T extends object>(
  obj: T
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}


export interface Setter<T> {
  (prev: T): T
}

export function set<T>(ref: Ref<T>, setter: Setter<T>) {
  ref.value = setter(ref.value)
}

export function setter<T>(ref: Ref<T>): (T) => void {
  return (setterOrValue: Setter<T> | T) => {
    if (typeof setterOrValue === 'function') {
      set(ref, setterOrValue as Setter<T>)
    } else {
      ref.value = setterOrValue as T
    }
  }
}

export function $try<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult | Promise<TResult>,
  ...callArgs: TArgs
): Promise<[TResult | null, any]> | ((...args: TArgs) => Promise<[TResult | null, any]>) {
  if (callArgs.length > 0) {
    // Immediate execution
    return (async () => {
      try {
        const result = await fn(...callArgs);
        return [result, null];
      } catch (error) {
        return [null, error];
      }
    })();
  }
  // Return a wrapper function
  return async (...args: TArgs): Promise<[TResult | null, any]> => {
    try {
      const result = await fn(...args);
      return [result, null];
    } catch (error) {
      return [null, error];
    }
  };
};
