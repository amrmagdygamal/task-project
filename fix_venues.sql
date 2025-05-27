-- Drop existing venues table and related objects
drop table if exists public.venues cascade;

-- Drop the existing table first to avoid conflicts
drop table if exists public.venues cascade;

-- Create venues table with proper field types
create table public.venues (  id uuid default extensions.uuid_generate_v4() primary key,
  name text not null,
  "ownerId" uuid references auth.users on delete cascade not null,
  address text not null,
  capacity integer not null,
  description text,
  image_url text,
  available boolean default true not null,
  dayprice decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function if it doesn't exist
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

-- Create the trigger
create trigger update_venues_updated_at
    before update on public.venues
    for each row
    execute function public.update_updated_at_column();

-- Enable RLS
alter table venues enable row level security;

-- Create RLS policies
create policy "Venues are viewable by everyone"
    on venues for select
    using (true);

create policy "Venues can be created by authenticated users with admin role"
    on venues for insert
    with check (auth.role() = 'authenticated' and exists (
        select 1 from user_details
        where user_details.id = auth.uid()
        and user_details.role = 'admin'
    ));

create policy "Venues can be updated by their owners"
    on venues for update
    using (auth.uid() = "ownerId");

create policy "Venues can be deleted by their owners"
    on venues for delete
    using (auth.uid() = "ownerId");

-- Grant necessary permissions
grant all on public.venues to authenticated;
grant all on public.venues to service_role;
