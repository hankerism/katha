import Navbar from '@/components/ui/layout/Navbar';
import Footer from '@/components/ui/layout/Footer';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, Literata } from 'next/font/google';
import './globals.css';

/* Brand typefaces, self-hosted via next/font (no render-blocking @import).
 * The CSS variables feed the --font-* role tokens in globals.css. Literata
 * and Inter are variable fonts (full weight axis); Cormorant Garamond is
 * static, so its weights are enumerated. */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});
const literata = Literata({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-literata',
  display: 'swap',
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/* ---------------------------------------------------------------------------
 * KATHA · Root layout
 * app/layout.tsx
 *
 * The app shell: brand metadata (a `%s · KATHA` title template that every
 * page's title composes into), the self-hosted brand typefaces, and the
 * sticky Navbar above the routed content.
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
    <html
      lang="en"
      className={`${cormorant.variable} ${literata.variable} ${inter.variable} h-full antialiased`}
    >
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
