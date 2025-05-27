
-- Drop existing table and related objects
drop table if exists public.user_details cascade;
drop function if exists public.update_updated_at_column cascade;

-- Create user_details table with UUID reference to auth.users
create table if not exists public.user_details (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'user')) not null,
  email text not null unique,
  full_name text not null,
  profile text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a trigger to automatically update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_user_details_updated_at
    before update on public.user_details
    for each row
    execute procedure public.update_updated_at_column();

-- Set up RLS (Row Level Security) policies
alter table user_details enable row level security;

-- Allow users to read their own profile
create policy \
Users
can
read
own
profile\
  on user_details for select
  using ( true );

-- Allow users to update their own profile
create policy \Users
can
update
own
profile\
  on user_details for update
  using ( true );

-- Allow signup
create policy \Allow
signup\
  on user_details for insert
  with check ( true );

