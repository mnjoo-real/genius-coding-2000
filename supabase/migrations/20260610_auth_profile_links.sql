create table if not exists public.auth_profile_links (
  auth_user_id uuid primary key,
  profile_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists auth_profile_links_set_updated_at on public.auth_profile_links;

create trigger auth_profile_links_set_updated_at
before update on public.auth_profile_links
for each row
execute function public.set_updated_at();

alter table public.auth_profile_links enable row level security;

drop policy if exists "auth_profile_links_select_own" on public.auth_profile_links;
create policy "auth_profile_links_select_own"
on public.auth_profile_links
for select
using (auth.uid() = auth_user_id);

drop policy if exists "auth_profile_links_insert_own" on public.auth_profile_links;
create policy "auth_profile_links_insert_own"
on public.auth_profile_links
for insert
with check (auth.uid() = auth_user_id);

drop policy if exists "auth_profile_links_update_own" on public.auth_profile_links;
create policy "auth_profile_links_update_own"
on public.auth_profile_links
for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);
