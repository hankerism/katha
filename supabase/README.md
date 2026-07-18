# KATHA · Supabase infrastructure

Sprint 8 Step 3 scaffolding. **Nothing in the app talks to Supabase yet** —
every repository still runs on its local (localStorage / static catalogue)
implementation. This directory and `lib/supabase/` exist so the future
`SupabaseCatalogue`, `SupabaseWorkRepository`, and `SupabaseReadingData`
implementations land against infrastructure that is already agreed.

## Setup (when a project is provisioned)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env.local`; fill both values from
   **Project Settings → API** (the project URL and the `anon` public key).
3. Apply the schema — either paste `migrations/0001_initial_schema.sql` into
   the dashboard's SQL editor, or with the CLI:

   ```sh
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

4. Regenerate the hand-written types once a live schema exists:

   ```sh
   npx supabase gen types typescript --linked > lib/supabase/database-types.ts
   ```

   (Until then, `lib/supabase/database-types.ts` is maintained by hand in
   lockstep with the migration.)

## The pieces

| Path | Role |
|---|---|
| `migrations/0001_initial_schema.sql` | Tables + indexes + RLS for the approved Sprint 8 schema (profiles, authors, works, chapters, reading_history, bookmarks, reading_progress). |
| `../lib/supabase/env.ts` | The ONE reader of the env vars. `isSupabaseConfigured()` is what future repositories gate on; unconfigured always means "run local". |
| `../lib/supabase/client.ts` | Browser singleton (`@supabase/ssr` createBrowserClient, cookie-based sessions). |
| `../lib/supabase/server.ts` | Request-scoped server client (`server-only`; cookies from `next/headers`). |
| `../lib/supabase/database-types.ts` | Typed `Database` mirror of the migration. |

## Deliberate decisions

- **Optional by contract.** No env vars → the app runs exactly as before,
  entirely local. CI, local dev, and the deployed demo need no backend.
- **Text primary keys** for domain rows (`work_…`, `ch_…`, `auth…`) — the
  app's ids are already meaningful and stable; a uuid layer would force
  translation at every seam.
- **RLS from day one**: published works + author bylines are public; drafts
  and all reading data are owner-only. Policies ship with the schema, not as
  an afterthought.
- **Deferrable chapter ordering** (`unique (work_id, position) deferrable`)
  so reorders can swap positions inside one transaction.
- Seeding the static catalogue into `works`/`chapters` belongs to the
  read-only-library migration step, not this one.
