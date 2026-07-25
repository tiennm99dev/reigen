/**
 * Marks the in-page nav link for the section currently in view with
 * aria-current="true" (styled in CSS).
 *
 * Without this module the nav is still a plain list of working anchor links.
 */

export function initNavHighlight(navSelector = '.site-nav') {
  const nav = document.querySelector(navSelector);
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const entries = links
    .map((link) => ({ link, section: document.querySelector(link.hash) }))
    .filter((entry) => entry.section);

  if (entries.length === 0 || !('IntersectionObserver' in window)) return;

  let currentLink = null;

  const setCurrent = (link) => {
    if (link === currentLink) return;
    if (currentLink) currentLink.removeAttribute('aria-current');
    if (link) link.setAttribute('aria-current', 'true');
    currentLink = link;
    if (link) keepInView(nav, link);
  };

  const visible = new Set();

  const observer = new IntersectionObserver(
    (records) => {
      for (const record of records) {
        if (record.isIntersecting) visible.add(record.target);
        else visible.delete(record.target);
      }
      // Highest section still in view wins, so scrolling up feels right too.
      const active = entries.find((entry) => visible.has(entry.section));
      setCurrent(active ? active.link : null);
    },
    { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
  );

  entries.forEach((entry) => observer.observe(entry.section));
}

/** Scrolls the horizontal nav strip so the active chip stays reachable. */
function keepInView(nav, link) {
  const strip = nav.querySelector('ul');
  if (!strip || strip.scrollWidth <= strip.clientWidth) return;

  const linkBox = link.getBoundingClientRect();
  const stripBox = strip.getBoundingClientRect();
  if (linkBox.left >= stripBox.left && linkBox.right <= stripBox.right) return;

  const delta = linkBox.left - stripBox.left - (stripBox.width - linkBox.width) / 2;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
  strip.scrollBy({ left: delta, behavior });
}
