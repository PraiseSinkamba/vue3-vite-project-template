import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function typedEntries<T extends object>(
  obj: T
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
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
