
-- Create a table for public profiles to store admin status
create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  is_admin boolean not null default false
);

comment on table public.profiles is 'Stores user-specific data like admin status.';
comment on column public.profiles.id is 'References auth.users.id';
comment on column public.profiles.is_admin is 'True if the user is an administrator.';

-- Set up Row Level Security (RLS) for profiles table
alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users." on public.profiles
  for select to authenticated using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update to authenticated using (auth.uid() = id);

-- This trigger automatically creates a profile for new users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, is_admin)
  values (new.id, false);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
