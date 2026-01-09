import { useState } from 'react'

/**
 * Custom hook untuk mengelola state accordion
 */
export const useAccordion = () => {
  const [activeAccordion, setActiveAccordion] = useState(null)

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

  return { activeAccordion, toggleAccordion }
}

