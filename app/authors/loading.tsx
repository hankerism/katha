import Skeleton from '@/components/ui/Skeleton';

/* Authors index loading state — hero bars above a grid of author-card
 * placeholders (portrait circle, name, bio lines). */

export default function AuthorsLoading() {
  return (
    <div className="container-katha py-20 md:py-28">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-12 w-full max-w-xl" />
      <Skeleton className="mt-5 h-5 w-full max-w-2xl" />

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-[18px] border border-border bg-card p-6"
          >
            <Skeleton className="size-20 rounded-full" />
            <Skeleton className="mt-5 h-4 w-32" />
            <Skeleton className="mt-3 h-3 w-20" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
