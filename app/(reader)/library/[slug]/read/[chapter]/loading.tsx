import Skeleton from '@/components/ui/Skeleton';

/* Reader loading state — the toolbar strip and a page of calm prose lines,
 * so opening a chapter feels like the page is being set, not stalled. */

export default function ReaderLoading() {
  return (
    <div>
      <Skeleton className="h-12 w-full rounded-none" />
      <div className="flex justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-[680px] rounded-xl border border-border/50 px-8 py-14 sm:px-12 sm:py-16">
          <Skeleton className="mx-auto h-3 w-40" />
          <Skeleton className="mx-auto mt-6 h-9 w-2/3" />
          <Skeleton className="mx-auto mt-4 h-3 w-52" />
          <div className="mt-12 space-y-4">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton
                key={i}
                className={`h-4 ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
