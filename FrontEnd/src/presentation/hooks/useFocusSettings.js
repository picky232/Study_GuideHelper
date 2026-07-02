import { useState } from 'react'

const STORAGE_KEY = 'minFocusMinutes'
const DEFAULT_MIN_FOCUS = 0 // 0 = 잠금 없음

export function getMinFocusMinutes() {
  const raw = localStorage.getItem(STORAGE_KEY)
  const n = parseInt(raw, 10)
  return Number.isNaN(n) || n < 0 ? DEFAULT_MIN_FOCUS : n
}

export function useFocusSettings() {
  const [minFocusMinutes, setState] = useState(getMinFocusMinutes)

  function setMinFocusMinutes(minutes) {
    const n = Math.max(0, Math.min(180, Math.floor(minutes) || 0))
    localStorage.setItem(STORAGE_KEY, String(n))
    setState(n)
  }

  return { minFocusMinutes, setMinFocusMinutes }
}
