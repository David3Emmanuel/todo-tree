export function readParsedFromStorage<T>(
  key: string,
  parse: (value: unknown) => T,
  fallback: T,
): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  try {
    return parse(JSON.parse(raw) as unknown)
  } catch {
    return fallback
  }
}

export function writeJsonToStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(key)
}
