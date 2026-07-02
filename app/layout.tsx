import Navbar from '@/components/ui/layout/Navbar';
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
  title: {
    default: 'KATHA',
    template: '%s · KATHA',
  },
  description:
    'KATHA is a calm, premium home for Filipino literature — novels, serials, and short fiction, beautifully typeset for slow, unhurried reading.',
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
      </body>
    </html>
  );
}
