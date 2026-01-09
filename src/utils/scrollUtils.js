/**
 * Utility function untuk smooth scroll ke section tertentu
 * @param {string} id - ID element yang akan di-scroll
 * @param {Function} callback - Optional callback setelah scroll
 */
export const scrollToSection = (id, callback) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
    if (callback) callback()
  }
}

