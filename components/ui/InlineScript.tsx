/* ---------------------------------------------------------------------------
 * KATHA · InlineScript
 * components/ui/InlineScript.tsx
 *
 * The flash-prevention helper from the Next.js "Preventing Flash Before
 * Hydration" guide. Renders an inline <script> that the browser executes
 * synchronously while parsing the HTML — before first paint — on hard loads.
 *
 * On the server it renders `type="text/javascript"` (executable); on the
 * client, `type="text/plain"` (inert), because on soft navigations the client
 * component that owns it already renders the correct result and the script
 * must not run again. suppressHydrationWarning absorbs the type mismatch.
 *
 * The `html` MUST be built from trusted, code-owned constants only (class
 * maps, storage keys) — never from user or stored content.
 * ------------------------------------------------------------------------- */

export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
