# KATHA · Production Deployment Runbook

First production deployment (Sprint 12). Executable from a **blank** Supabase
and Vercel account by someone unfamiliar with the project.

## What this deployment ships — read this first

Real **authentication** (sign-up, email confirmation, sign-in, author
profiles) over the hardened application. By deliberate architecture, in this
release:

- The **catalogue** is still the built-in demo library (compile-time data).
- **Works and reading data are device-local** (browser storage). An author's
  second device shows an empty desk; publishing distributes on-device only.
- The house manuscript does **not** seed in production (supabase mode).
- Authentication failure degrades to a guest experience — reading never
  breaks (verified: the app renders fully with the auth backend down).

Cloud content sync is the next migration ladder, not this deployment.

---

## Part 1 — Supabase project

### 1.1 Create the project  *(dashboard — account owner only)*

**Purpose:** the production database + auth backend.

1. https://supabase.com → sign in → **New project**.
2. Name `katha`, strong database password (store in a password manager —
   never in the repo), region nearest your readers (e.g. Southeast Asia).
3. Note the **project ref** (the `xyz` in `https://xyz.supabase.co`).

**Verify:** Project Settings → API shows a Project URL and an `anon` public
key.

### 1.2 Apply migrations  *(CLI)*

**Purpose:** create the validated schema — tables, indexes, grants, RLS
policies (0001) and the profile-on-signup trigger (0002).

```sh
npx supabase login                 # opens browser; needs your account
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

**Verify:**

```sh
npx supabase migration list --linked
# expect BOTH 0001 and 0002 listed as applied, none pending
```

Then in the dashboard SQL editor, sanity-check the load-bearing facts:

```sql
-- 7 tables, RLS enabled on every one (all rows must show 't')
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r' order by 1;

-- 17 policies attached
select count(*) from pg_policies where schemaname = 'public';  -- expect 17

-- the signup trigger is installed
select tgname from pg_trigger where tgname = 'on_auth_user_created';
```

### 1.3 Confirm generated types still match  *(CLI, optional but recommended)*

**Purpose:** the committed `lib/supabase/database-types.ts` must mirror the
production schema.

```sh
npx supabase gen types typescript --linked > /tmp/prod-types.ts
# diff against the committed file (ignore the 10-line header comment):
tail -n +11 lib/supabase/database-types.ts | diff - /tmp/prod-types.ts
```

**Verify:** no diff. A diff means a migration drifted — stop and reconcile.

### 1.4 Authentication configuration  *(dashboard)*

**Purpose:** confirmation emails must land on the app's callback route.

Authentication → **URL Configuration**:

| Setting | Value | Why |
|---|---|---|
| Site URL | `https://<YOUR-DOMAIN>` | base for auth redirects (`https://katha.vercel.app` until a custom domain exists) |
| Redirect URLs | `https://<YOUR-DOMAIN>/auth/confirm` | the app's callback route; sign-up passes exactly this URL, and the allow-list matches **exact** URLs |

Authentication → **Sign In / Providers → Email**: leave **Confirm email ON**
(hosted default). The app is built for it: sign-up shows "check your inbox,"
the link completes at `/auth/confirm`, expired links land on `/join` with a
calm explanation.

**Email delivery caution:** the built-in SMTP is for evaluation — a few
emails per hour. Fine for the first smoke test; before inviting real users,
configure custom SMTP (Authentication → Emails → SMTP) with a provider like
Resend/Postmark.

**Verify:** after Part 2, the smoke test's confirmation email arrives and its
link opens `https://<YOUR-DOMAIN>/auth/confirm?...`.

### 1.5 RLS spot-check  *(dashboard SQL editor)*

**Purpose:** confirm production enforces what the local harness proved
(15/15).

```sql
-- as the anon role, drafts must be invisible (set local needs a transaction)
begin;
set local role anon;
select count(*) from public.works where lifecycle = 'draft';  -- expect count = 0
rollback;
```

Behavioral RLS verification (drafts private across accounts, reading data
owner-only) is exercised by the two-account smoke test in Part 3.

---

## Part 2 — Vercel deployment

### 2.1 Create the Vercel project  *(dashboard — account owner only)*

1. https://vercel.com → **Add New → Project** → import the
   `hankerism/katha` GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Build command / output:
   defaults. **Do not deploy yet** — set env vars first (they are inlined at
   build time).

### 2.2 Environment variables  *(dashboard → Project → Settings → Environment Variables)*

**Purpose:** exactly three values; set for **Production** (and Preview if
you want preview deployments in supabase mode).

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<PROJECT_REF>.supabase.co` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the `anon` **public** key | safe to expose; RLS is the boundary |
| `NEXT_PUBLIC_AUTH_PROVIDER` | `supabase` | the EXPLICIT mode switch — without it the deploy runs the local demo membership |
| `NEXT_PUBLIC_CATALOGUE_PROVIDER` | `supabase` | library serves published works from the database (apply migration 0003 + run `supabase/seed.sql` once, or shelves are empty) |

**Secrets policy:** the **service_role key is never configured anywhere in
this deployment** — the application does not use it. The database password
lives only in your password manager. `NEXT_PUBLIC_*` values are inlined into
the client bundle at build time — changing any of them requires a redeploy,
not just an env edit.

### 2.3 Deploy

Dashboard: **Deploy**. Or CLI:

```sh
npx vercel --prod
```

**Verify (immediately post-deploy):**

```sh
curl -s -o /dev/null -w "%{http_code}\n" https://<YOUR-DOMAIN>/            # 200
curl -s -o /dev/null -w "%{http_code}\n" https://<YOUR-DOMAIN>/library     # 200
curl -s -o /dev/null -w "%{http_code}\n" "https://<YOUR-DOMAIN>/auth/confirm"  # 307 → /join?auth_error=invalid
```

The third line proves the callback route deployed and its error path works.

### 2.4 DNS  *(optional now)*

The runbook works on `katha.vercel.app`. When the custom domain
(`katha.ph`) arrives: add it in Vercel → Domains, point DNS (A/CNAME per
Vercel's instructions), then **update Supabase Site URL + Redirect URLs to
the new domain and redeploy** — auth emails embed the domain, so this is not
optional. (`metadataBase` in `app/layout.tsx` already says katha.ph.)

---

## Part 3 — Production smoke test

Run against the deployed URL, in order. Steps 1–13 need one browser; step 8's
RLS check needs a second browser or private window.

| # | Step | Action | Pass looks like |
|---|---|---|---|
| 1 | Guest reads | Open `/library/table-for-two/read/prologue`; then chapter 2 of `/library/ang-huling-tag-araw` | First chapter renders for guests; chapter 2 of the multi-chapter book shows the free-preview membership invitation |
| 2 | Sign up | `/join` → first/last/email/password | "Check your inbox" screen — **no** session yet |
| 3 | Email confirmation | Open the email, click the link | Lands on `/auth/confirm` → redirected into the app, signed in |
| 4 | Viewer resolves | Visit `/join` | "You're already part of the library" with your join date |
| 5 | Become author | `/studio` → Become a KATHA author → pen name → open the desk | Studio dashboard, empty desk welcome ("Every library begins with a single story") — **no seeded manuscript** |
| 6 | Create work | New work → title/category → workspace → write a chapter | Autosave whisper "Draft saved just now"; text survives navigating away and back |
| 7 | Publish | Workspace → Place it in the Library | Badge "In the Library"; book appears on `/library` under "From this device's Studio"; readable at its real URL |
| 8 | RLS behavioral check | Second browser (guest): open `/library` and your published book's URL; also confirm your DRAFT's slug 404s/misses | Published readable by strangers; drafts invisible — **works and reading data are device-local, so the second browser must not show your desk data either** |
| 9 | Reading records | Read your published book + a catalogue book | Dashboard (`/dashboard`) shows Continue Reading, history, stats |
| 10 | Bookmarks | Ribbon a paragraph while reading | Appears on `/bookmarks`, deep link returns to the paragraph |
| 11 | Sign out | `/join` → Sign out | Guest experience; member shelves quiet; reading still works |
| 12 | Sign in again | `/join` → Already a member? → credentials | Author tier restored, desk intact (same device) |
| 13 | Resilience spot-check | (Optional, staging only) block `*.supabase.co` in DevTools → reload a chapter | Page renders as guest — reading never blanks |

---

## Part 4 — Failure recovery

| Failure | Symptoms | Diagnosis | Fix |
|---|---|---|---|
| **Missing/wrong env vars** | Site loads but sign-up button behaves like the local one-click demo, or console warns "AUTH_PROVIDER=supabase but env missing" | `NEXT_PUBLIC_AUTH_PROVIDER` unset → explicit-local fallback (by design) | Set all three vars in Vercel; **redeploy** (build-time inlining) |
| **Bad redirect URL / callback mismatch** | Confirmation email's link lands on the Site URL root (or Supabase error page) instead of `/auth/confirm`; user confirmed but not signed in | `redirect_to` failed the allow-list → GoTrue fell back to Site URL | Add the exact `https://<domain>/auth/confirm` to Redirect URLs; re-send by signing up again |
| **Expired/used confirmation link** | User reports the link "doesn't work" | Links are single-use and time-limited | Working as designed: they land on `/join?auth_error=expired` with instructions; user signs in or re-registers |
| **Failed migration** | Sign-up 500s; API errors "relation does not exist" or "permission denied" | `migration list --linked` shows pending/missing; the grants block (in 0001) missing reproduces the exact "permission denied" the local run caught | `npx supabase db push`; re-run 1.2's verify block |
| **Trigger not installed** | Sign-up succeeds but the app shows empty names / weird tier; `profiles` has no row for the new user | 1.2's trigger query returns nothing | Re-push migrations; for already-created users, insert their profile row manually in SQL editor |
| **RLS denial (legit user blocked)** | Author can't create their pen ("row-level security" error becoming author) | Policy expects `user_id = auth.uid()`; token stale or clock skew | Sign out/in (fresh JWT); confirm policies count = 17; check the exact error in dashboard logs (Auth + Postgres) |
| **Cookie issues** | Signed in, but refresh forgets the session; or session dies after ~1h | Cookies not refreshing → `proxy.ts` not running (check Vercel Functions logs for `/` requests) or domain mismatch after DNS change | Confirm proxy deployed (it ships with the build); after domain changes, users must re-login once; verify Site URL matches the serving domain |
| **Email delivery** | No confirmation email | Built-in SMTP rate limit (a few/hour) or spam folder | Wait + retry, check spam; for real usage configure custom SMTP (1.4) |
| **Auth outage** | Supabase incident | App continues as guest everywhere — reading unaffected (Sprint 11 guarantee); sign-in recovers when the backend does | Nothing to do app-side; watch status.supabase.com |

---

## Appendix — value reference card

```
Supabase Site URL          https://<YOUR-DOMAIN>
Supabase Redirect URLs     https://<YOUR-DOMAIN>/auth/confirm
Confirm email              ON (hosted default; app built for it)
Vercel env (Production):
  NEXT_PUBLIC_SUPABASE_URL       https://<PROJECT_REF>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY  <anon public key>
  NEXT_PUBLIC_AUTH_PROVIDER      supabase
Never deployed             service_role key, database password
Local dev unchanged        .env.local keeps AUTH_PROVIDER=local
```
