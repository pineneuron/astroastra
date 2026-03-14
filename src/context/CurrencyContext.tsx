'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export type CurrencyOption = {
  code: string
  flag: string
  label: string
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'NPR', flag: '🇳🇵', label: 'Nepalese Rupee' },
  { code: 'USD', flag: '🇺🇸', label: 'US Dollar' },
  { code: 'CAD', flag: '🇨🇦', label: 'Canadian Dollar' },
  { code: 'GBP', flag: '🇬🇧', label: 'UK Pound' },
]

const STORAGE_KEY = 'astra-selected-currency'

type ExchangeRates = Record<string, number>

type CurrencyContextValue = {
  selectedCurrency: CurrencyOption
  setSelectedCurrency: (c: CurrencyOption) => void
  exchangeRates: ExchangeRates
  /** Convert amount from source currency to selected display currency. Returns formatted display string. */
  formatPrice: (amount: number, fromCurrency: string) => string
  /** Convert amount for use in forms/API (keeps original) - returns numeric value in fromCurrency */
  getDisplayAmount: (amount: number, fromCurrency: string) => number
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function getSymbol(code: string): string {
  switch (code) {
    case 'NPR': return 'Rs.'
    case 'USD': return '$'
    case 'CAD': return 'C$'
    case 'GBP': return '£'
    default: return `${code} `
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyOption>(CURRENCIES[0])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ NPR: 1, USD: 133, CAD: 100, GBP: 170 })

  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const found = CURRENCIES.find((c) => c.code === stored)
      if (found) setSelectedCurrencyState(found)
    }
  }, [])

  useEffect(() => {
    fetch('/api/exchange-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') setExchangeRates((prev) => ({ ...prev, ...data }))
      })
      .catch(() => {})
  }, [])

  const setSelectedCurrency = useCallback((c: CurrencyOption) => {
    setSelectedCurrencyState(c)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, c.code)
  }, [])

  const toNPR = useCallback(
    (amount: number, fromCurrency: string): number => {
      const cu = fromCurrency.toUpperCase()
      if (cu === 'NPR') return amount
      const rate = exchangeRates[cu]
      if (!rate || rate <= 0) return amount
      return amount * rate
    },
    [exchangeRates]
  )

  const fromNPR = useCallback(
    (nprAmount: number, toCurrency: string): number => {
      const cu = toCurrency.toUpperCase()
      if (cu === 'NPR') return nprAmount
      const rate = exchangeRates[cu]
      if (!rate || rate <= 0) return nprAmount
      return nprAmount / rate
    },
    [exchangeRates]
  )

  const formatPrice = useCallback(
    (amount: number, fromCurrency: string): string => {
      const npr = toNPR(amount, fromCurrency)
      const displayAmount = fromNPR(npr, selectedCurrency.code)
      const symbol = getSymbol(selectedCurrency.code)
      const fixed = selectedCurrency.code === 'NPR' ? Math.round(displayAmount) : displayAmount.toFixed(2)
      return `${symbol}${fixed}`
    },
    [selectedCurrency, toNPR, fromNPR]
  )

  const getDisplayAmount = useCallback(
    (amount: number, fromCurrency: string): number => {
      const npr = toNPR(amount, fromCurrency)
      return fromNPR(npr, selectedCurrency.code)
    },
    [selectedCurrency, toNPR, fromNPR]
  )

  const value: CurrencyContextValue = {
    selectedCurrency,
    setSelectedCurrency,
    exchangeRates,
    formatPrice,
    getDisplayAmount,
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
