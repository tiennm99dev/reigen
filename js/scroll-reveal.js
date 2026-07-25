/**
 * Reveals [data-reveal] elements as they enter the viewport.
 *
 * Progressive enhancement contract:
 *  - the hidden state lives behind `html.js`, so without this module running
 *    every element is already visible;
 *  - if IntersectionObserver is missing, everything is revealed immediately;
 *  - under `prefers-reduced-motion: reduce` the class is applied with no
 *    transition (CSS neutralises the transform/opacity), so nothing animates.
 */

const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 4;

/** Marks the module as having completed, so the inline failsafe stands down. */
function markReady() {
  document.documentElement.dataset.revealReady = 'true';
}

export function initScrollReveal(selector = '[data-reveal]') {
  const targets = Array.from(document.querySelectorAll(selector));
  if (targets.length === 0) {
    markReady();
    return;
  }

  const revealAll = () => targets.forEach((el) => el.classList.add('is-revealed'));

  // On every path below, everything is revealed before we return, so marking
  // ready is honest: the flag means "this module finished", not "an observer is
  // attached". Letting the failsafe fire instead would also be harmless, but it
  // would make a successful run look like a failure.
  if (!('IntersectionObserver' in window)) {
    revealAll();
    markReady();
    return;
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    revealAll();
    markReady();
    return;
  }

  // Stagger siblings that share a parent so grids cascade instead of popping.
  const indexInGroup = new Map();
  targets.forEach((el) => {
    const parent = el.parentElement;
    const next = (indexInGroup.get(parent) ?? -1) + 1;
    indexInGroup.set(parent, next);
    const step = Math.min(next, MAX_STAGGER_STEPS);
    if (step > 0) el.style.setProperty('--reveal-delay', `${step * STAGGER_MS}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
  );

  targets.forEach((el) => observer.observe(el));

  // Last statement on purpose: signalling any earlier would let a throw further
  // down disarm the failsafe while elements are still hidden.
  markReady();
}
