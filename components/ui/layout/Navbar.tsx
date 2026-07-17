
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '../Button';
import { SearchIcon, MenuIcon, CloseIcon } from '@/components/ui/icons';
import { useViewer } from '@/components/membership/use-viewer';
/* ---------------------------------------------------------------------------
 * KATHA · Navbar
 * components/layout/Navbar.tsx
 *
 * Sticky glass navigation in the Kindle / Apple Books register: a quiet,
 * warm bar that floats over the content with a soft backdrop blur.
 *   logo    → .logo (Cormorant Garamond, Katha Brown / Ginto in dark)
 *   surface → bg-background/80 + backdrop-blur (soft, never harsh)
 *   accents → Ginto gold underline on active/hover links, gold focus ring
 *   width   → container-katha (1280px max, per spacing.md)
 * No external deps — inline SVGs and a tiny class joiner.
 * ------------------------------------------------------------------------- */

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Authors', href: '/authors' },
] as const;

/** Members also see their personal home. Appears after the viewer mount-gate
 *  resolves (the Join button's pattern), so hydration stays clean. */
const MEMBER_NAV_LINKS = [
  ...NAV_LINKS,
  { label: 'Dashboard', href: '/dashboard' },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* Shared square icon-button affordance (search + mobile toggle) */
const iconButton = cx(
  'inline-flex size-10 items-center justify-center rounded-full',
  'text-foreground/75 transition-colors duration-200',
  'hover:bg-muted hover:text-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
);

/* — Desktop nav link with a sliding Ginto underline ——————————————————————— */
function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'group relative py-1 text-sm font-medium tracking-wide transition-colors duration-200',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left rounded-full bg-accent',
          'motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
        )}
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { viewer, loaded } = useViewer();
  const isGuest = loaded && viewer.tier === 'guest';
  const links = loaded && viewer.tier !== 'guest' ? MEMBER_NAV_LINKS : NAV_LINKS;

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While open: lock body scroll and allow Escape to dismiss.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {/* Keyboard skip link — first focusable element on the page */}
      <a
        href="#main-content"
        className={cx(
          'sr-only z-[60] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground',
          'focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-3',
        )}
      >
        Skip to content
      </a>

      <div className="border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/70">
        <div className="container-katha relative flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          {/* Left · wordmark */}
          <Link
            href="/"
            aria-label="KATHA — home"
            className="logo shrink-0 tracking-[0.18em] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm"
          >
            KATHA
          </Link>

          {/* Center · primary nav (desktop, absolutely centered) */}
          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex"
          >
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isActivePath(pathname, link.href)}
              />
            ))}
          </nav>

          {/* Right · actions */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              aria-label="Search"
              onClick={() => router.push('/search')}
              className={iconButton}
            >
              <SearchIcon className="size-[1.15rem]" />
            </button>

            {/* The invitation, quietly — guests only; members carry no chrome */}
            {isGuest && (
              <Link
                href="/join"
                className="hidden items-center rounded-full bg-primary px-5 py-2 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex"
              >
                Join KATHA
              </Link>
            )}

            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="primary-menu"
              onClick={() => setOpen((value) => !value)}
              className={cx(iconButton, 'md:hidden')}
            >
              {open ? <CloseIcon className="size-[1.3rem]" /> : <MenuIcon className="size-[1.3rem]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile disclosure panel */}
      <div
        id="primary-menu"
        hidden={!open}
        className="animate-fade-in border-b border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
      >
        <nav aria-label="Mobile" className="container-katha flex flex-col gap-1 py-4">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={cx(
                  'rounded-[14px] px-3 py-3 text-base font-medium transition-colors duration-200',
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="my-2 h-px bg-border/70" />

          <Button
            variant="secondary"
            fullWidth
            leftIcon={<SearchIcon />}
            onClick={() => {
              setOpen(false);
              router.push('/search');
            }}
          >
            Search
          </Button>
          {isGuest && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setOpen(false);
                router.push('/join');
              }}
            >
              Join KATHA
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}