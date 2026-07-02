import Navbar from '@/components/ui/layout/Navbar';
import Footer from '@/components/ui/layout/Footer';
import type { Metadata } from 'next';
import './globals.css';

/* ---------------------------------------------------------------------------
 * KATHA · Root layout
 * app/layout.tsx
 *
 * The app shell: brand metadata (a `%s · KATHA` title template that every
 * page's title composes into) and the sticky Navbar above the routed content.
 *
 * Typography loads via the Google Fonts @import in globals.css (Cormorant
 * Garamond · Literata · Inter), which feeds the --font-* tokens; per the note
 * there, moving that to next/font is a future optimization — the unused
 * create-next-app Geist fonts are gone.
 * ------------------------------------------------------------------------- */

export const metadata: Metadata = {
  metadataBase: new URL('https://katha.ph'),
  title: {
    default: 'KATHA',
    template: '%s · KATHA',
  },
  description:
    'KATHA is a calm, premium home for Filipino literature — novels, serials, and short fiction, beautifully typeset for slow, unhurried reading.',
  openGraph: {
    siteName: 'KATHA',
    type: 'website',
    locale: 'en_PH',
    description:
      'A calm, premium home for Filipino literature — beautifully typeset for slow, unhurried reading.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Site-wide footer. The immersive reader opts out via a CSS gate:
            its page carries data-reader-page, and globals.css hides the
            footer with body:has() — server-rendered correctly, no JS. */}
        <Footer />
      </body>
    </html>
  );
}
