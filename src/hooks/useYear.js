import { useEffect, useRef } from 'react'

/**
 * Custom hook untuk menampilkan tahun di footer
 */
export const useYear = () => {
  const yearRef = useRef(null)

  useEffect(() => {
    if (yearRef.current) {
      yearRef.current.textContent = new Date().getFullYear()
    }
  }, [])

  return yearRef
}

