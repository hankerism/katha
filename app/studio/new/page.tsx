'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllBooks } from '@/lib/books';
import { collectCategories } from '@/lib/search';
import { getCurrentAuthorId } from '@/lib/studio/current-author';
import { useWorks } from '@/components/studio/use-works';

/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — begin a new work
 * app/studio/new/page.tsx
 *
 * One calm page, three questions: what is it called, which shelf does it
 * belong on, and — if the words are there yet — what is it about. Everything
 * else can wait; a new work opens onto its first page, not onto a form.
 * Creates the draft and lands in its workspace.
 * ------------------------------------------------------------------------- */

const inputClass =
  'w-full rounded-xl border border-border bg-card px-4 py-3 font-body text-base text-foreground placeholder:text-muted-foreground/70 shadow-sm transition-shadow focus:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const labelClass =
  'block font-body text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground';

export default function NewWorkPage() {
  const router = useRouter();
  const { begin } = useWorks(getCurrentAuthorId());
  const categories = collectCategories(getAllBooks());

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [creating, setCreating] = useState(false);

  const ready = title.trim().length > 0 && category.trim().length > 0;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!ready || creating) return;
    setCreating(true);
    const work = await begin({ title, category, synopsis });
    router.push(`/studio/works/${work.id}`);
  }

  return (
    <div className="container-katha py-14 md:py-20">
      <div className="mx-auto max-w-xl">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-clay">
          A new work
        </p>
        <h1 className="mt-3 font-heading text-3xl leading-tight text-foreground sm:text-4xl">
          Begin something.
        </h1>
        <p className="mt-3 font-body text-base leading-relaxed text-muted-foreground">
          A title and a shelf are enough to start — the rest belongs to the
          writing.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-7">
          <div>
            <label htmlFor="work-title" className={labelClass}>
              Title
            </label>
            <input
              id="work-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What will it be called?"
              autoFocus
              autoComplete="off"
              className={`${inputClass} mt-2 font-heading text-lg`}
            />
          </div>

          <div>
            <label htmlFor="work-category" className={labelClass}>
              Shelf
            </label>
            <input
              id="work-category"
              type="text"
              list="studio-categories"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Romance, Poetry, Fantasy — or a shelf of your own"
              autoComplete="off"
              className={`${inputClass} mt-2`}
            />
            <datalist id="studio-categories">
              {categories.map((option) => (
                <option key={option.slug} value={option.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="work-synopsis" className={labelClass}>
              Synopsis{' '}
              <span className="normal-case tracking-normal text-muted-foreground/70">
                — optional, it can wait
              </span>
            </label>
            <textarea
              id="work-synopsis"
              value={synopsis}
              onChange={(event) => setSynopsis(event.target.value)}
              placeholder="A few lines readers will meet the story through."
              rows={4}
              className={`${inputClass} mt-2 resize-y leading-relaxed`}
            />
          </div>

          <div className="flex items-center gap-5 pt-2">
            <button
              type="submit"
              disabled={!ready || creating}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {creating ? 'Opening your workspace…' : 'Begin this work'}
            </button>
            <Link
              href="/studio"
              className="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
            >
              Not yet
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
