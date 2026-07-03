import Skeleton from '@/components/ui/Skeleton';

/* Book detail loading state — cover beside title/synopsis bars, then the
 * contents rows, mirroring the hub's layout. */

export default function BookDetailLoading() {
  return (
    <div className="container-katha py-16 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
        <Skeleton className="mx-auto aspect-[3/4] w-full max-w-[280px] rounded-[18px] lg:mx-0 lg:max-w-none" />
        <div className="flex flex-col justify-center">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-5 h-11 w-4/5" />
          <Skeleton className="mt-4 h-5 w-48" />
          <Skeleton className="mt-7 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-2xl" />
          <Skeleton className="mt-9 h-12 w-44 rounded-full" />
        </div>
      </div>

      <div className="mt-16 space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
