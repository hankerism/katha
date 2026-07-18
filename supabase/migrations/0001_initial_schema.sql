-- ---------------------------------------------------------------------------
-- KATHA · Initial schema (Sprint 8 Step 3 — infrastructure only)
--
-- The approved Sprint 8 design, verbatim in intent:
--   • profiles/authors stay TWO tables — the domain separates the person
--     from the pen (lib/membership.ts's core design).
--   • works flattens WorkBookMeta into columns; no JSON blobs.
--   • chapters carry an explicit position (array order, made honest).
--   • reading locations turn the deterministic string id
--     `${book}:${chapter}:${paragraph}` into its honest form: composite keys.
--   • reading_progress is one row per user (the Continue Reading contract).
--   • Domain ids are TEXT ('work_…', 'ch_…', 'auth…') matching the existing
--     model — no uuid translation between the app and its rows.
--
-- Nothing in the app queries these tables yet; this migration exists so the
-- future SupabaseCatalogue / SupabaseWorkRepository / SupabaseReadingData
-- implementations land against a schema that is already agreed and reviewed.
-- ---------------------------------------------------------------------------

-- ── Identity ───────────────────────────────────────────────────────────────

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  first_name  text not null default '',
  last_name   text not null default '',
  tier        text not null default 'reader' check (tier in ('reader', 'author')),
  joined_at   timestamptz not null default now()
);

create table public.authors (
  id            text primary key,
  user_id       uuid references public.profiles (id) on delete set null,
  slug          text not null unique,
  display_name  text not null,
  bio           text not null default '',
  location      text not null default '',
  avatar_url    text,
  banner_url    text
);

create index authors_user_id_idx on public.authors (user_id);

-- ── Works & chapters ───────────────────────────────────────────────────────

create table public.works (
  id            text primary key,
  author_id     text not null references public.authors (id),
  lifecycle     text not null default 'draft'
                check (lifecycle in ('draft', 'published', 'archived')),
  slug          text not null unique,
  title         text not null,
  category      text not null default '',
  language      text not null default '',
  status        text not null default 'Ongoing',
  synopsis      text not null default '',
  cover_url     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz,
  archived_at   timestamptz
);

create index works_author_id_idx on public.works (author_id);
create index works_lifecycle_idx on public.works (lifecycle);

create table public.chapters (
  id          text primary key,
  work_id     text not null references public.works (id) on delete cascade,
  position    integer not null,
  title       text not null default '',
  manuscript  text not null default '',
  -- Deferrable: chapter reordering swaps positions inside one transaction.
  constraint chapters_work_position_key
    unique (work_id, position) deferrable initially deferred
);

create index chapters_work_id_idx on public.chapters (work_id);

-- ── Reading data (private per user) ────────────────────────────────────────

create table public.reading_history (
  user_id          uuid not null references public.profiles (id) on delete cascade,
  work_id          text not null references public.works (id) on delete cascade,
  chapter_id       text not null references public.chapters (id) on delete cascade,
  paragraph_index  integer not null,
  visited_at       timestamptz not null default now(),
  primary key (user_id, work_id, chapter_id, paragraph_index)
);

create index reading_history_recency_idx
  on public.reading_history (user_id, visited_at desc);

create table public.bookmarks (
  user_id          uuid not null references public.profiles (id) on delete cascade,
  work_id          text not null references public.works (id) on delete cascade,
  chapter_id       text not null references public.chapters (id) on delete cascade,
  paragraph_index  integer not null,
  preview          text not null default '',
  created_at       timestamptz not null default now(),
  primary key (user_id, work_id, chapter_id, paragraph_index)
);

create index bookmarks_recency_idx
  on public.bookmarks (user_id, created_at desc);

create table public.reading_progress (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  work_id     text not null references public.works (id) on delete cascade,
  chapter_id  text not null references public.chapters (id) on delete cascade,
  updated_at  timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Authors write their own works; published works are readable by everyone
-- (including anonymous readers); reading data is visible only to its owner.

alter table public.profiles         enable row level security;
alter table public.authors          enable row level security;
alter table public.works            enable row level security;
alter table public.chapters         enable row level security;
alter table public.reading_history  enable row level security;
alter table public.bookmarks        enable row level security;
alter table public.reading_progress enable row level security;

-- profiles: you may see and edit yourself.
create policy "profiles are self-readable"
  on public.profiles for select using (id = auth.uid());
create policy "profiles are self-updatable"
  on public.profiles for update using (id = auth.uid());
create policy "profiles are self-insertable"
  on public.profiles for insert with check (id = auth.uid());

-- authors: public bylines; only the linked user writes their pen.
create policy "authors are public"
  on public.authors for select using (true);
create policy "authors are self-insertable"
  on public.authors for insert with check (user_id = auth.uid());
create policy "authors are self-updatable"
  on public.authors for update using (user_id = auth.uid());

-- works: published works are the public catalogue; owners see and manage
-- everything of their own, whatever the lifecycle.
create policy "published works are public"
  on public.works for select using (lifecycle = 'published');
create policy "own works are visible"
  on public.works for select using (
    author_id in (select id from public.authors where user_id = auth.uid())
  );
create policy "own works are insertable"
  on public.works for insert with check (
    author_id in (select id from public.authors where user_id = auth.uid())
  );
create policy "own works are updatable"
  on public.works for update using (
    author_id in (select id from public.authors where user_id = auth.uid())
  );
create policy "own works are deletable"
  on public.works for delete using (
    author_id in (select id from public.authors where user_id = auth.uid())
  );

-- chapters: readable when their work is; writable by the work's owner.
create policy "chapters of published works are public"
  on public.chapters for select using (
    work_id in (select id from public.works where lifecycle = 'published')
  );
create policy "own chapters are visible"
  on public.chapters for select using (
    work_id in (
      select w.id from public.works w
      join public.authors a on a.id = w.author_id
      where a.user_id = auth.uid()
    )
  );
create policy "own chapters are writable"
  on public.chapters for all using (
    work_id in (
      select w.id from public.works w
      join public.authors a on a.id = w.author_id
      where a.user_id = auth.uid()
    )
  );

-- reading data: strictly the owner's.
create policy "own history" on public.reading_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own bookmarks" on public.bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own progress" on public.reading_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Grants ─────────────────────────────────────────────────────────────────
-- Surfaced by live execution (Sprint 8 Step 4): tables created by a raw
-- migration carry no privileges for the API roles, so every request — even
-- service_role — failed with "permission denied". The platform posture is
-- broad grants with RLS as the real gate (this is hosted Supabase's default
-- for API-exposed schemas); the policies above stay the security boundary.

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
