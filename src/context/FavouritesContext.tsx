'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'astra-favourites'

type FavouritesContextValue = {
  favourites: Set<string>
  toggleFavourite: (slug: string) => void
  isFavourite: (slug: string) => boolean
}

const FavouritesContext = createContext<FavouritesContextValue | null>(null)

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        if (Array.isArray(parsed)) setFavourites(new Set(parsed))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && favourites.size >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favourites]))
    }
  }, [favourites])

  const toggleFavourite = useCallback((slug: string) => {
    setFavourites((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  const isFavourite = useCallback((slug: string) => favourites.has(slug), [favourites])

  const value: FavouritesContextValue = {
    favourites,
    toggleFavourite,
    isFavourite,
  }

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  )
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext)
  if (!ctx) throw new Error('useFavourites must be used within FavouritesProvider')
  return ctx
}
