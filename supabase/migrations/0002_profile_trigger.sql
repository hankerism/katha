-- ---------------------------------------------------------------------------
-- KATHA · Profile-on-signup trigger (Sprint 9 — Authentication)
--
-- Every auth user gets a profiles row the moment the account exists, with
-- the names the calm sign-up collected (carried in auth's user metadata).
-- A trigger rather than a client-side insert: it cannot be forgotten, cannot
-- race RLS, and holds for every future signup path (invites, OAuth later).
--
-- SECURITY DEFINER with a pinned search_path — the standard Supabase pattern:
-- the trigger runs as the function owner (postgres), so RLS on profiles does
-- not apply to this system-initiated insert; users still cannot touch other
-- profiles through the API (the validated policies govern that).
-- ---------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
