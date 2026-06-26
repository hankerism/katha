import Link from 'next/link';

/* ---------------------------------------------------------------------------
 * KATHA · Footer
 * components/layout/Footer.tsx
 *
 * A calm, editorial sign-off on a cream band: the wordmark and a short brand
 * line beside three tidy link columns, closed by a quiet copyright row.
 * Server component, data separated from the markup.
 * ------------------------------------------------------------------------- */

const NAV_GROUPS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Library', href: '/library' },
      { label: 'Authors', href: '/authors' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Become an Author', href: '/authors' },
      { label: 'Help Center', href: '/help' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Facebook', href: 'https://facebook.com' },
  { label: 'X', href: 'https://x.com' },
] as const;

const linkClass =
  'inline-block text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-secondary rounded-sm';

const headingClass = 'text-xs font-semibold uppercase tracking-[0.18em] text-foreground';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container-katha py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link
              href="/"
              aria-label="KATHA — home"
              className="logo inline-block rounded-sm tracking-[0.18em] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-secondary"
            >
              KATHA
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A quiet, premium home for Filipino literature—novels, serials, and short fiction,
              beautifully typeset for unhurried reading.
            </p>
          </div>

          {/* Internal link groups */}
          {NAV_GROUPS.map((group) => {
            const headingId = `footer-${group.heading.toLowerCase()}`;
            return (
              <nav key={group.heading} aria-labelledby={headingId}>
                <h2 id={headingId} className={headingClass}>
                  {group.heading}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}

          {/* Connect (external) */}
          <nav aria-labelledby="footer-connect">
            <h2 id="footer-connect" className={headingClass}>
              Connect
            </h2>
            <ul className="mt-4 space-y-3">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`KATHA on ${social.label} (opens in a new tab)`}
                    className={linkClass}
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            © 2026 KATHA. Made with love in the Philippines.
          </p>
        </div>
      </div>
    </footer>
  );
}