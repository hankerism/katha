import { ImageResponse } from 'next/og';

/* ---------------------------------------------------------------------------
 * KATHA · Social share image
 * app/opengraph-image.tsx
 *
 * The default OpenGraph/Twitter card, generated at build time: the wordmark
 * on the roasted-coffee brand gradient with the antique-gold accent rule —
 * the same register as the placeholder book covers. Brand hexes are inlined
 * (ImageResponse renders outside the CSS token system).
 * ------------------------------------------------------------------------- */

export const alt = 'KATHA — a calm home for Filipino literature';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BRAND_PRIMARY = '#5C3B28';
const BRAND_PRIMARY_DEEP = '#33210F';
const BRAND_SECONDARY = '#F8F5F1';
const BRAND_ACCENT = '#D4A646';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: `linear-gradient(155deg, ${BRAND_PRIMARY}, ${BRAND_PRIMARY_DEEP})`,
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: BRAND_ACCENT,
            fontSize: 26,
            letterSpacing: 6,
          }}
        >
          <span>A FILIPINO-INSPIRED DIGITAL LIBRARY</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              width: 96,
              height: 3,
              background: BRAND_ACCENT,
              marginBottom: 36,
            }}
          />
          <div
            style={{
              color: BRAND_SECONDARY,
              fontSize: 148,
              fontWeight: 700,
              letterSpacing: 24,
            }}
          >
            KATHA
          </div>
          <div
            style={{
              marginTop: 28,
              color: BRAND_SECONDARY,
              opacity: 0.75,
              fontSize: 34,
              fontStyle: 'italic',
            }}
          >
            Stories deserve a beautiful place to live.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            color: BRAND_SECONDARY,
            opacity: 0.6,
            fontSize: 24,
          }}
        >
          katha.ph
        </div>
      </div>
    ),
    size,
  );
}
