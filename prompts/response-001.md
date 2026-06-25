/* ==========================================================================
   KATHA — Global Design System
   A Filipino-inspired digital reading platform.
   Stack: Next.js 16 · TypeScript · Tailwind CSS v4 (App Router)

   Feel: Kindle · Notion · Kinokuniya · Apple — premium, elegant, cozy.

   Structure
   1. Font + Tailwind imports
   2. Dark mode variant
   3. Static theme tokens (brand colors, fonts, radii, motion, animation)
   4. Semantic tokens — Light Mode (:root)
   5. Semantic tokens — Dark Mode (.dark)
   6. Theme mapping (@theme inline → Tailwind utilities)
   7. Base layer (reset, typography, selection, focus, scrollbar)
   8. Components layer (buttons, cards, inputs, reader, helpers)
   9. Keyframes
   ========================================================================== */

/* 1 · IMPORTS ------------------------------------------------------------- */
/* Loaded here so the stylesheet is self-contained. In production you can
   swap these for `next/font` and feed the variables into --font-* below.   */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;450;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,500&display=swap');

@import "tailwindcss";

/* 2 · DARK MODE VARIANT --------------------------------------------------- */
/* Class-based so readers can toggle (and persist) their preference.
   Add `class="dark"` to <html> to activate.                               */
@custom-variant dark (&:where(.dark, .dark *));

/* 3 · STATIC THEME TOKENS ------------------------------------------------- */
/* Values that never change between light and dark live here and generate
   Tailwind utilities directly (bg-brand-accent, font-logo, rounded-xl …).  */
@theme {
  /* — Raw brand palette ————————————————————————————————— */
  --color-brand-primary:    #5C3B28;  /* Primary    · roasted coffee  */
  --color-brand-secondary:  #F8F5F1;  /* Secondary  · warm cream      */
  --color-brand-accent:     #D4A646;  /* Accent     · antique gold    */
  --color-brand-ink:        #1F1F1F;  /* Ink        · near-black       */
  --color-brand-mist:       #FAFAF8;  /* Mist       · paper white      */
  --color-brand-forest:     #2E7D5B;  /* Forest     · deep green       */
  --color-brand-clay:       #B56A44;  /* Clay       · burnt sienna     */
  --color-brand-terracotta: #C45A3C;  /* Terracotta · warm red-orange  */

  /* — Typeface roles ———————————————————————————————————— */
  --font-logo:    "Cormorant Garamond", "Literata", ui-serif, Georgia, serif;
  --font-heading: "Literata", ui-serif, Georgia, Cambria, "Times New Roman", serif;
  --font-body:    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-reader:  "Literata", ui-serif, Georgia, Cambria, serif;
  --font-sans:    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-serif:   "Literata", ui-serif, Georgia, Cambria, serif;
  --font-mono:    ui-monospace, "SF Mono", "JetBrains Mono", "Cascadia Code", Menlo, Consolas, monospace;

  /* — Radius scale ——————————————————————————————————————— */
  --radius:     0.75rem;                       /* base — soft, premium */
  --radius-xs:  calc(var(--radius) - 0.5rem);
  --radius-sm:  calc(var(--radius) - 0.25rem);
  --radius-md:  calc(var(--radius) - 0.125rem);
  --radius-lg:  var(--radius);
  --radius-xl:  calc(var(--radius) + 0.25rem);
  --radius-2xl: calc(var(--radius) + 0.75rem);
  --radius-3xl: calc(var(--radius) + 1.5rem);

  /* — Responsive spacing (fluid, viewport-aware) ——————————————— */
  --spacing-gutter:  clamp(1.25rem, 4vw, 4rem);   /* page side padding   */
  --spacing-section: clamp(3rem, 8vw, 7rem);      /* vertical rhythm     */
  --spacing-measure: 68ch;                        /* ideal reading width */

  /* — Animation ——————————————————————————————————————————— */
  --animate-fade-in: fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-fade-up: fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-scale-in: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  --animate-shimmer: shimmer 1.6s linear infinite;
}

/* 4 · SEMANTIC TOKENS — LIGHT MODE ---------------------------------------- */
:root {
  color-scheme: light;

  /* Surfaces & text */
  --background:           #FAFAF8;  /* mist  */
  --foreground:           #1F1F1F;  /* ink   */
  --card:                 #FFFFFF;
  --card-foreground:      #2A2320;
  --popover:              #FFFFFF;
  --popover-foreground:   #1F1F1F;

  /* Interactive */
  --primary:              #5C3B28;
  --primary-foreground:   #FAF6F0;
  --secondary:            #F8F5F1;
  --secondary-foreground: #4A382C;
  --accent:               #D4A646;
  --accent-foreground:    #2A2117;
  --muted:                #F1ECE4;
  --muted-foreground:     #6E6357;

  /* Expressive / status */
  --forest:               #2E7D5B;
  --forest-foreground:    #F3FBF7;
  --clay:                 #B56A44;
  --clay-foreground:      #FFF7F2;
  --destructive:          #C45A3C;  /* terracotta */
  --destructive-foreground: #FFF6F2;

  /* Lines & form */
  --border:               #E8E1D6;
  --border-strong:        #DAD0C1;
  --input:                #E8E1D6;
  --ring:                 #D4A646;

  /* Reading surface — a touch warmer than the UI, like book paper */
  --reader-bg:            #FBF8F2;
  --reader-foreground:    #2B2620;
  --reader-muted:         #6B6258;
  --reader-highlight:     rgba(212, 166, 70, 0.30);

  /* Selection */
  --selection:            rgba(212, 166, 70, 0.32);
  --selection-foreground: #1F1F1F;

  /* Scrollbar */
  --scrollbar-thumb:       #DBD2C4;
  --scrollbar-thumb-hover: #C5B8A4;

  /* Soft, warm-tinted elevation (Apple/Notion calm) */
  --ds-shadow-xs:   0 1px 2px rgba(31, 25, 20, 0.05);
  --ds-shadow-sm:   0 1px 2px rgba(31, 25, 20, 0.05), 0 1px 3px rgba(31, 25, 20, 0.05);
  --ds-shadow-soft: 0 1px 2px rgba(31, 25, 20, 0.04), 0 6px 16px rgba(31, 25, 20, 0.05), 0 12px 32px rgba(31, 25, 20, 0.04);
  --ds-shadow-md:   0 2px 6px rgba(31, 25, 20, 0.06), 0 10px 28px rgba(31, 25, 20, 0.07);
  --ds-shadow-lg:   0 6px 16px rgba(31, 25, 20, 0.08), 0 24px 56px rgba(31, 25, 20, 0.10);
  --ds-shadow-xl:   0 12px 28px rgba(31, 25, 20, 0.10), 0 40px 80px rgba(31, 25, 20, 0.12);
  --ds-shadow-glow: 0 0 0 1px rgba(212, 166, 70, 0.35), 0 6px 22px rgba(212, 166, 70, 0.20);

  /* Motion */
  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-soft:    cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: 120ms var(--ease-soft);
  --transition:      200ms var(--ease-soft);
  --transition-slow: 320ms var(--ease-soft);
}

/* 5 · SEMANTIC TOKENS — DARK MODE ---------------------------------------- */
/* A cozy "reading lamp at night" dark: warm espresso surfaces, cream text,
   lifted brand tones so buttons and links stay legible.                    */
.dark {
  color-scheme: dark;

  --background:           #16120E;
  --foreground:           #ECE5DA;
  --card:                 #1F1A15;
  --card-foreground:      #ECE5DA;
  --popover:              #1F1A15;
  --popover-foreground:   #ECE5DA;

  --primary:              #D9B488;  /* lifted from coffee → warm tan */
  --primary-foreground:   #211810;
  --secondary:            #241E18;
  --secondary-foreground: #E5DDD0;
  --accent:               #E0B65A;  /* brighter gold for dark contrast */
  --accent-foreground:    #221A0B;
  --muted:                #241E18;
  --muted-foreground:     #A99C8B;

  --forest:               #4FA980;
  --forest-foreground:    #06150D;
  --clay:                 #CB8862;
  --clay-foreground:      #1E120A;
  --destructive:          #D7724E;
  --destructive-foreground: #1E0D06;

  --border:               #332A22;
  --border-strong:        #463A2E;
  --input:                #3A3026;
  --ring:                 #E0B65A;

  --reader-bg:            #1A1510;  /* dark sepia, gentle on eyes */
  --reader-foreground:    #DCD3C5;
  --reader-muted:         #998D7B;
  --reader-highlight:     rgba(224, 182, 90, 0.22);

  --selection:            rgba(224, 182, 90, 0.26);
  --selection-foreground: #FFF8EC;

  --scrollbar-thumb:       #3A3128;
  --scrollbar-thumb-hover: #4C4136;

  /* Dark needs deeper, near-black shadows to read as elevation */
  --ds-shadow-xs:   0 1px 2px rgba(0, 0, 0, 0.40);
  --ds-shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(0, 0, 0, 0.40);
  --ds-shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.45), 0 10px 28px rgba(0, 0, 0, 0.42);
  --ds-shadow-md:   0 4px 12px rgba(0, 0, 0, 0.50), 0 16px 40px rgba(0, 0, 0, 0.46);
  --ds-shadow-lg:   0 10px 28px rgba(0, 0, 0, 0.58), 0 28px 64px rgba(0, 0, 0, 0.50);
  --ds-shadow-xl:   0 16px 36px rgba(0, 0, 0, 0.62), 0 44px 88px rgba(0, 0, 0, 0.55);
  --ds-shadow-glow: 0 0 0 1px rgba(224, 182, 90, 0.40), 0 6px 24px rgba(224, 182, 90, 0.24);
}

/* 6 · THEME MAPPING ------------------------------------------------------- */
/* `inline` keeps utilities pointing at the live variables, so every
   bg-*/text-*/border-*/shadow-* utility flips automatically with the theme. */
@theme inline {
  --color-background:           var(--background);
  --color-foreground:           var(--foreground);
  --color-card:                 var(--card);
  --color-card-foreground:      var(--card-foreground);
  --color-popover:              var(--popover);
  --color-popover-foreground:   var(--popover-foreground);

  --color-primary:              var(--primary);
  --color-primary-foreground:   var(--primary-foreground);
  --color-secondary:            var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent:               var(--accent);
  --color-accent-foreground:    var(--accent-foreground);
  --color-muted:                var(--muted);
  --color-muted-foreground:     var(--muted-foreground);

  --color-forest:               var(--forest);
  --color-forest-foreground:    var(--forest-foreground);
  --color-clay:                 var(--clay);
  --color-clay-foreground:      var(--clay-foreground);
  --color-destructive:          var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);

  --color-border:               var(--border);
  --color-border-strong:        var(--border-strong);
  --color-input:                var(--input);
  --color-ring:                 var(--ring);

  --color-reader:               var(--reader-bg);
  --color-reader-foreground:    var(--reader-foreground);
  --color-reader-muted:         var(--reader-muted);

  /* Adaptive elevation utilities: shadow-soft, shadow-glow, plus tuned defaults */
  --shadow-xs:   var(--ds-shadow-xs);
  --shadow-sm:   var(--ds-shadow-sm);
  --shadow-soft: var(--ds-shadow-soft);
  --shadow-md:   var(--ds-shadow-md);
  --shadow-lg:   var(--ds-shadow-lg);
  --shadow-xl:   var(--ds-shadow-xl);
  --shadow-glow: var(--ds-shadow-glow);
}

/* 7 · BASE LAYER ---------------------------------------------------------- */
@layer base {

  /* Sensible warm default border for any utility-bordered element */
  *,
  *::before,
  *::after {
    border-color: var(--border);
  }

  /* Gentle global color transitions so theme toggling glides rather than snaps.
     Scoped to color properties only — transforms/animations stay untouched. */
  *,
  *::before,
  *::after {
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, outline-color;
    transition-timing-function: var(--ease-soft);
    transition-duration: 200ms;
  }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "kern", "liga", "calt";
    tab-size: 4;
    accent-color: var(--accent);
    scrollbar-color: var(--scrollbar-thumb) transparent;
    scrollbar-width: thin;
  }

  body {
    min-height: 100dvh;
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-body);
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.6;
    letter-spacing: 0.003em;
  }

  /* — Headings ————————————————————————————————————————————— */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--foreground);
    font-weight: 600;
    line-height: 1.18;
    letter-spacing: -0.012em;
    text-wrap: balance;
  }
  h1 { font-size: clamp(2.25rem, 1.4rem + 3.4vw, 3.5rem);   font-weight: 700; }
  h2 { font-size: clamp(1.75rem, 1.2rem + 2.2vw, 2.5rem);   font-weight: 700; }
  h3 { font-size: clamp(1.375rem, 1.1rem + 1.3vw, 1.875rem); }
  h4 { font-size: clamp(1.15rem, 1rem + 0.7vw, 1.4rem); }
  h5 { font-size: 1.125rem; }
  h6 { font-size: 1rem; letter-spacing: 0.02em; text-transform: uppercase; color: var(--muted-foreground); }

  p { text-wrap: pretty; }

  small { font-size: 0.8125rem; color: var(--muted-foreground); }

  /* — Links ———————————————————————————————————————————————— */
  a {
    color: var(--primary);
    text-decoration: none;
    text-underline-offset: 0.22em;
    text-decoration-thickness: 1.5px;
    text-decoration-color: color-mix(in oklab, var(--primary) 30%, transparent);
  }
  a:hover {
    text-decoration-line: underline;
    text-decoration-color: var(--primary);
  }
  .dark a { color: var(--accent); }
  .dark a:hover { text-decoration-color: var(--accent); }

  /* — Lists ———————————————————————————————————————————————— */
  ::marker { color: var(--accent); }

  /* — Quotes, rules, code ——————————————————————————————————— */
  blockquote {
    border-inline-start: 3px solid var(--accent);
    padding-inline-start: 1.15rem;
    margin-inline: 0;
    font-family: var(--font-serif);
    font-style: italic;
    color: var(--muted-foreground);
  }

  hr {
    border: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--border-strong), transparent);
    margin-block: 2rem;
  }

  code, kbd, samp {
    font-family: var(--font-mono);
    font-size: 0.875em;
  }
  :not(pre) > code {
    background: var(--muted);
    color: var(--clay);
    padding: 0.15em 0.42em;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  kbd {
    background: var(--card);
    border: 1px solid var(--border-strong);
    border-bottom-width: 2px;
    border-radius: var(--radius-sm);
    padding: 0.1em 0.45em;
    font-size: 0.8em;
    color: var(--foreground);
  }

  /* — Media defaults ———————————————————————————————————————— */
  img, picture, video, canvas, svg { display: block; max-width: 100%; height: auto; }

  /* — Native form controls inherit the system ——————————————— */
  input, button, textarea, select { font: inherit; color: inherit; }
  button { cursor: pointer; background: none; border: none; }
  :disabled { cursor: not-allowed; }
  textarea { resize: vertical; }

  /* — Selection ————————————————————————————————————————————— */
  ::selection {
    background: var(--selection);
    color: var(--selection-foreground);
    text-shadow: none;
  }

  /* — Focus: visible, on-brand, and never on mouse clicks —————— */
  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: var(--radius-xs);
  }
  :focus:not(:focus-visible) { outline: none; }

  /* — Scrollbar (WebKit) ———————————————————————————————————— */
  ::-webkit-scrollbar { width: 12px; height: 12px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
    border-radius: 9999px;
    border: 3px solid transparent;
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:hover { background-color: var(--scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }

  /* — Respect reduced-motion preferences ———————————————————— */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

/* 8 · COMPONENTS LAYER ---------------------------------------------------- */
/* Global primitives for the design system — not app components. Compose
   freely (e.g. <button class="btn btn-primary">) or extend with Tailwind.  */
@layer components {

  /* — Brand wordmark ———————————————————————————————————————— */
  .logo {
    font-family: var(--font-logo);
    font-weight: 600;
    font-size: clamp(1.5rem, 1.2rem + 1vw, 2rem);
    line-height: 1;
    letter-spacing: 0.01em;
    color: var(--primary);
  }
  .dark .logo { color: var(--accent); }

  /* — Layout helpers ———————————————————————————————————————— */
  .container-katha {
    width: 100%;
    max-width: 80rem;
    margin-inline: auto;
    padding-inline: var(--spacing-gutter);
  }
  .section { padding-block: var(--spacing-section); }
  .measure { max-width: var(--spacing-measure); }

  /* — Buttons ——————————————————————————————————————————————— */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 0.9375rem;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    padding: 0.7rem 1.25rem;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    transition: transform var(--transition), box-shadow var(--transition),
                background-color var(--transition), color var(--transition),
                border-color var(--transition), filter var(--transition);
  }
  .btn:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
  .btn:active { transform: translateY(0); }
  .btn:disabled { opacity: 0.55; pointer-events: none; }

  .btn-primary {
    background: var(--primary);
    color: var(--primary-foreground);
    box-shadow: var(--ds-shadow-sm);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: var(--ds-shadow-md); filter: brightness(1.06); }

  .btn-accent {
    background: var(--accent);
    color: var(--accent-foreground);
    box-shadow: var(--ds-shadow-sm);
  }
  .btn-accent:hover { transform: translateY(-1px); box-shadow: var(--ds-shadow-glow); }

  .btn-secondary {
    background: var(--secondary);
    color: var(--secondary-foreground);
    border-color: var(--border);
  }
  .btn-secondary:hover { background: color-mix(in oklab, var(--secondary) 88%, var(--foreground)); }

  .btn-outline {
    background: transparent;
    color: var(--foreground);
    border-color: var(--border-strong);
  }
  .btn-outline:hover { background: var(--muted); border-color: color-mix(in oklab, var(--border-strong) 55%, var(--accent)); }

  .btn-ghost { background: transparent; color: var(--foreground); }
  .btn-ghost:hover { background: var(--muted); }

  .btn-sm { padding: 0.5rem 0.9rem; font-size: 0.875rem; border-radius: var(--radius-sm); }
  .btn-lg { padding: 0.9rem 1.6rem; font-size: 1rem; border-radius: var(--radius-lg); }

  /* — Cards ————————————————————————————————————————————————— */
  .card {
    background: var(--card);
    color: var(--card-foreground);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: var(--ds-shadow-soft);
    transition: transform var(--transition-slow), box-shadow var(--transition-slow),
                border-color var(--transition-slow), background-color var(--transition-slow);
  }
  .card-interactive { cursor: pointer; }
  .card-interactive:hover,
  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: var(--ds-shadow-lg);
    border-color: color-mix(in oklab, var(--border) 50%, var(--accent));
  }
  .card-interactive:focus-visible { outline: 2px solid var(--ring); outline-offset: 3px; }

  /* A flat tonal surface for sidebars, wells, and grouped content */
  .surface {
    background: var(--secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }

  /* — Inputs ———————————————————————————————————————————————— */
  .input {
    width: 100%;
    font-family: var(--font-body);
    font-size: 0.95rem;
    color: var(--foreground);
    background: var(--card);
    border: 1px solid var(--input);
    border-radius: var(--radius-md);
    padding: 0.65rem 0.85rem;
    transition: border-color var(--transition), box-shadow var(--transition), background-color var(--transition);
  }
  .input::placeholder { color: var(--muted-foreground); }
  .input:hover { border-color: var(--border-strong); }
  .input:focus {
    outline: none;
    border-color: var(--ring);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 26%, transparent);
  }

  /* — Badge / pill ————————————————————————————————————————— */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 0.25rem 0.65rem;
    border-radius: 9999px;
    background: var(--muted);
    color: var(--muted-foreground);
    border: 1px solid var(--border);
  }
  .badge-accent { background: color-mix(in oklab, var(--accent) 18%, transparent); color: var(--clay); border-color: color-mix(in oklab, var(--accent) 40%, transparent); }
  .badge-forest { background: color-mix(in oklab, var(--forest) 16%, transparent); color: var(--forest); border-color: color-mix(in oklab, var(--forest) 35%, transparent); }

  /* — Reader mode — the heart of KATHA ——————————————————————— */
  /* Apply `.reading-surface` to the page wrapper and `.reader` to the prose. */
  .reading-surface {
    background: var(--reader-bg);
    color: var(--reader-foreground);
  }

  .reader {
    font-family: var(--font-reader);
    color: var(--reader-foreground);
    font-size: clamp(1.0625rem, 0.95rem + 0.5vw, 1.25rem);
    line-height: 1.85;
    letter-spacing: 0.002em;
    max-width: var(--spacing-measure);
    margin-inline: auto;
    font-optical-sizing: auto;
    font-feature-settings: "kern", "liga", "onum", "pnum";
    hanging-punctuation: first last;
  }
  .reader p { margin-block: 0 1.4em; text-wrap: pretty; }
  .reader > :first-child { margin-top: 0; }
  .reader h1, .reader h2, .reader h3, .reader h4 {
    font-family: var(--font-heading);
    color: var(--foreground);
    margin-block: 1.8em 0.6em;
    text-wrap: balance;
  }
  .reader a { color: var(--clay); text-decoration-color: color-mix(in oklab, var(--clay) 40%, transparent); }
  .reader blockquote { margin-block: 1.6em; font-size: 1.05em; }
  .reader ::selection { background: var(--reader-highlight); }
  /* Optional literary flourish: <div class="reader reader-dropcap"> */
  .reader-dropcap > p:first-of-type::first-letter {
    font-family: var(--font-logo);
    float: left;
    font-size: 3.6em;
    line-height: 0.78;
    font-weight: 600;
    padding-right: 0.08em;
    margin-top: 0.04em;
    color: var(--primary);
  }
  .dark .reader-dropcap > p:first-of-type::first-letter { color: var(--accent); }

  /* — Utility flourishes ———————————————————————————————————— */
  .text-gold-gradient {
    background: linear-gradient(135deg, var(--accent), var(--clay));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .divider-ornament {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--accent);
    text-align: center;
  }
  .divider-ornament::before,
  .divider-ornament::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--border-strong), transparent);
  }

  /* Loading shimmer for skeleton states */
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--muted) 25%,
      color-mix(in oklab, var(--muted) 55%, var(--background)) 37%,
      var(--muted) 63%
    );
    background-size: 400% 100%;
    border-radius: var(--radius-md);
    animation: shimmer 1.6s linear infinite;
  }
}

/* 9 · KEYFRAMES ----------------------------------------------------------- */
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  from { background-position: 100% 0; }
  to   { background-position: -100% 0; }
}