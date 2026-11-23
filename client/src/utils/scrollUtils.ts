/**
 * Scroll utility for TrustNest.
 * Ensures smooth scrolling with appropriate offset for the sticky navigation header.
 */

export function scrollToSection(sectionIdOrHash: string, offset = 80): boolean {
  if (typeof window === 'undefined') return false;

  const id = sectionIdOrHash.startsWith('#') ? sectionIdOrHash.slice(1) : sectionIdOrHash;
  const element = document.getElementById(id);

  if (!element) {
    // If element by ID not found, attempt query selector
    try {
      const el = document.querySelector(sectionIdOrHash.startsWith('#') ? sectionIdOrHash : `#${sectionIdOrHash}`);
      if (el) {
        const topPos = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
        return true;
      }
    } catch {
      // Ignore invalid selector
    }
    return false;
  }

  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = Math.max(0, elementPosition - offset);

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });

  return true;
}
