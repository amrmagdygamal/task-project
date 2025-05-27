-- First drop the existing table and related objects
drop table if exists public.user_details cascade;
drop function if exists public.update_updated_at_column cascade;

-- Create user_details table with proper UUID reference to auth.users
create table public.user_details (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'user')) not null,
  email text not null unique,
  full_name text not null,
  profile text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Create the trigger
create trigger update_user_details_updated_at
    before update on public.user_details
    for each row
    execute function public.update_updated_at_column();

-- Enable RLS
alter table public.user_details enable row level security;

-- Create RLS policies
create policy "Users can read own profile"
    on public.user_details for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.user_details for update
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on public.user_details for insert
    with check (auth.uid() = id);

-- Allow the service role to manage all profiles
create policy "Service role can manage all profiles"
    on public.user_details for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Grant necessary permissions
grant all on public.user_details to authenticated;
grant all on public.user_details to service_role;
