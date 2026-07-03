import Skeleton from '@/components/ui/Skeleton';

/* Author profile loading state — banner band, overlapping portrait, bio and
 * stats bars, then bibliography card placeholders. */

export default function AuthorProfileLoading() {
  return (
    <div>
      <Skeleton className="h-32 w-full rounded-none sm:h-40" />
      <div className="container-katha">
        <div className="-mt-12 flex items-end gap-6 sm:-mt-14">
          <Skeleton className="size-24 rounded-full border-4 border-background sm:size-28" />
          <div className="pb-1">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-3 h-3 w-40" />
          </div>
        </div>
        <Skeleton className="mt-7 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-2xl" />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] w-full rounded-[18px]" />
              <Skeleton className="mt-4 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
