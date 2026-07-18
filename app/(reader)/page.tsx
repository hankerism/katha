import HomeHero from '@/components/home/HomeHero';
import FeaturedBooks from '@/components/home/FeaturedBooks';
import PopularCategories from '@/components/home/PopularCategories';
import ContinueReading from '@/components/home/ContinueReading';
import BookmarksShelf from '@/components/home/BookmarksShelf';
import RecentlyRead from '@/components/home/RecentlyRead';
import WhyKatha from '@/components/home/WhyKatha';
import ReaderLove from '@/components/home/ReaderLove';
import FeaturedAuthors from '@/components/home/FeaturedAuthors';
import FinalCTA from '@/components/home/FinalCTA';

/* ---------------------------------------------------------------------------
 * KATHA · Home
 * app/(reader)/page.tsx
 *
 * SERVER component (Sprint 8): the catalogue-backed shelves (FeaturedBooks,
 * PopularCategories, FeaturedAuthors) await CatalogueRepository and render on
 * the server — their content stays in the SSR HTML exactly as before. The
 * hero's two router-driven CTAs are the page's only client interactivity,
 * extracted verbatim into HomeHero; the member shelves (ContinueReading,
 * BookmarksShelf, RecentlyRead) are client components as they always were —
 * personal data mounts after hydration.
 * ------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <ContinueReading />

      <BookmarksShelf />

      <RecentlyRead />

      <FeaturedBooks />

      <PopularCategories />

      <WhyKatha />

      <ReaderLove />

      <FeaturedAuthors />

      <FinalCTA />
    </>
  );
}
