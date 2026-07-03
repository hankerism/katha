import Skeleton from '@/components/ui/Skeleton';

/* Library loading state — hero bars, the pill row, and the card grid,
 * page-shaped so the real content lands without a jolt. */

export default function LibraryLoading() {
  return (
    <div className="container-katha py-20 md:py-28">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-5 h-12 w-full max-w-xl" />
      <Skeleton className="mt-5 h-5 w-full max-w-2xl" />
      <Skeleton className="mt-9 h-13 w-full max-w-xl rounded-full" />

      <div className="mt-6 flex flex-wrap gap-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] w-full rounded-[18px]" />
            <Skeleton className="mt-4 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
