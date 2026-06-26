import { useState, useCallback, useRef } from 'react'
export function useToast() {
  const [toast, setToast] = useState({ visible: false, icon: '✓', message: '' })
  const r = useRef(null)
  const showToast = useCallback((icon, message) => {
    if (r.current) clearTimeout(r.current)
    setToast({ visible: true, icon, message })
    r.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }, [])
  return { toast, showToast }
}