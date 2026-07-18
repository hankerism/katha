-- ---------------------------------------------------------------------------
-- KATHA · Catalogue columns (Sprint 13 — Cloud Catalogue)
--
-- Three ADDITIVE columns the KathaBook domain model already declares, so the
-- database can be the catalogue's source of truth:
--
--   chapters.slug        The chapter's public address segment. STORED, not
--                        derived: these slugs live inside reader URLs and
--                        inside every reader's bookmarks / history /
--                        Continue Reading records — deriving them from
--                        titles at read time risks drift that would orphan
--                        all of that. Nullable because draft chapters gain a
--                        slug at publish time (the publishing swap owns
--                        that); unique per work where present.
--
--   works.featured       Editorial state for the featured shelves.
--
--   works.free_chapters  The book's free-preview boundary; NULL falls back
--                        to the app's DEFAULT_FREE_CHAPTERS, matching the
--                        domain's optional field.
-- ---------------------------------------------------------------------------

alter table public.chapters add column slug text;

-- One address per chapter within a book (drafts may be null until publish).
create unique index chapters_work_slug_key
  on public.chapters (work_id, slug)
  where slug is not null;

alter table public.works add column featured boolean not null default false;
alter table public.works add column free_chapters integer;
