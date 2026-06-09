/* ============================================================
   DisasterDoc — Global CSS
   Import this file once in your entry point (main.jsx / index.js)
   ============================================================ */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Base layer overrides ─────────────────────────────────── */
@layer base {

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    scroll-behavior: smooth;
  }

  body {
    @apply bg-parchment text-stone-900 font-sans;
    font-size: 1rem;
    line-height: 1.6;
  }

  /* h1, h2 use display (DM Serif Display) */
  h1, h2 {
    @apply font-display font-normal tracking-tighter leading-tight text-stone-900;
  }

  /* h3–h6 use body sans */
  h3, h4, h5, h6 {
    @apply font-sans font-medium leading-snug text-stone-900;
  }

  a {
    @apply text-leaf underline underline-offset-[3px] transition-fast;
  }
  a:hover {
    @apply text-forest;
  }

  /* Accessibility: visible focus ring for keyboard nav */
  :focus-visible {
    outline: none;
    box-shadow: theme('boxShadow.focus');
    border-radius: theme('borderRadius.sm');
  }

  /* Custom scrollbar — subtle sage tint */
  ::-webkit-scrollbar       { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-stone-100; }
  ::-webkit-scrollbar-thumb { @apply bg-sage rounded-full; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-leaf; }

  /* Text selection */
  ::selection {
    @apply bg-moss text-forest;
  }
}

/* ── Transitions shorthand (used in Tailwind classes) ──────── */
@layer utilities {
  .transition-fast   { transition: all 150ms ease; }
  .transition-base   { transition: all 220ms ease; }
  .transition-slow   { transition: all 350ms cubic-bezier(0.4, 0, 0.2, 1); }
  .transition-spring { transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
}