import { useEffect, useState } from 'react'

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(hover: none), (pointer: coarse)').matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)')
    const onChange = (e) => setIsTouch(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isTouch
}
