/* ---------------------------------------------------------------------------
 * KATHA · Skeleton
 * components/ui/Skeleton.tsx
 *
 * The one loading primitive: a calm pulsing block in the secondary tone.
 * Route-level loading.tsx files compose these into page-shaped placeholders.
 * The pulse is motion-safe: reduced-motion users see a static block.
 * ------------------------------------------------------------------------- */

export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`motion-safe:animate-pulse rounded-lg bg-secondary ${className}`}
    />
  );
}
