import { useState, useEffect } from 'react'

/**
 * A useState-shaped array that persists itself to localStorage. Used by the
 * dashboard's Ads and Orders pages — both are "a list of records" with no
 * need for a shared Context, since each page only ever reads the list fresh
 * on mount (they're never on screen at the same time as their writer).
 */
export function useLocalStorageList(key, initialValue = []) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items))
  }, [key, items])

  return [items, setItems]
}
