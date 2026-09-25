import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Cart state for the catalogue ordering flow. No backend — checkout hands the
 * order to WhatsApp (see src/utils/whatsappOrder.js). Each line item is a
 * self-contained snapshot so a saved cart and the WhatsApp message never
 * depend on a live catalogue lookup. One unit per piece (originals are
 * one-of-a-kind); add is idempotent and refuses sold pieces.
 */

const STORAGE_KEY = 'catalogue3.cart.v1' // namespaced + versioned for future invalidation
const CartContext = createContext(null)

function readCart() {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function toLineItem(art) {
  return {
    id: art.id,
    title: art.title,
    medium: art.medium,
    dimensions: art.dimensions,
    price: art.price,
    aspect: art.aspect,
    image: art.image,
    alt: art.alt,
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* quota / private mode — cart still works for the session */
    }
  }, [items])

  const add = useCallback((art) => {
    if (!art || !art.available || art.status === 'exhibition' || art.status === 'sold') return
    setItems((prev) => (prev.some((i) => i.id === art.id) ? prev : [...prev, toLineItem(art)]))
  }, [])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + (Number(i.price) || 0), 0), [items])

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      subtotal,
      add,
      remove,
      clear,
      isInCart: (id) => items.some((i) => i.id === id),
    }),
    [items, subtotal, add, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
