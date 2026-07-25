/**
 * Entry point for the Reigen Arataka fan tribute page.
 *
 * All page content lives in index.html — this module only adds two optional
 * enhancements. If it fails to load, the page stays fully readable.
 */

import { initScrollReveal } from './scroll-reveal.js';
import { initNavHighlight } from './nav-highlight.js';

initScrollReveal();
initNavHighlight();
