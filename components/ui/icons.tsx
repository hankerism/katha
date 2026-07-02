import type { SVGProps } from 'react';

/* ---------------------------------------------------------------------------
 * KATHA · Icons
 * components/ui/icons.tsx
 *
 * The canonical inline icon set — every glyph the product uses, defined once.
 * Previously each surface carried its own copies (14 files defined their own
 * ArrowRightIcon, with drifting stroke widths); this module is the single
 * source. All icons render currentColor, are aria-hidden (decorative — pair
 * with text or an aria-label on the interactive parent), and spread props
 * LAST so any call site can still override strokeWidth or className.
 * ------------------------------------------------------------------------- */

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  } as const;
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 1.7, ...props })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Bookmark glyph; `filled` renders it solid (a saved state). */
export function BookmarkIcon({
  filled,
  ...props
}: { filled?: boolean } & IconProps) {
  return (
    <svg
      {...base({ strokeWidth: 2, ...props })}
      fill={filled ? 'currentColor' : 'none'}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** Passage marker — the ribbon glyph echoing the reader's chapter markers. */
export function RibbonIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 1.6, ...props })}>
      <path d="M6 3h12v18l-6-4-6 4z" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ContentsIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

export function BookOpenIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 1.5, ...props })}>
      <path d="M12 6.5C10.5 5.5 8 5 4 5v13c4 0 6.5.5 8 1.5 1.5-1 4-1.5 8-1.5V5c-4 0-6.5.5-8 1.5V20" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2.5, ...props })}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ChaptersIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 2, ...props })}>
      <path d="M5 6h14M5 12h14M5 18h9" />
    </svg>
  );
}

export function ShelfIcon(props: IconProps) {
  return (
    <svg {...base({ strokeWidth: 1.5, ...props })}>
      <path d="M4 4h4v16H4zM10 4h4v16h-4zM16.5 4.5l4 1-3.5 15-4-1z" />
    </svg>
  );
}
