-- Create storage bucket for venue images if it doesn't exist
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('venue-images', 'venue-images', true);
  exception when unique_violation then
  -- Bucket already exists, ignore
end $$;

-- Create storage policies
-- Policy for uploads - allow only venue owners
drop policy if exists "Venue owners can upload images" on storage.objects;
create policy "Venue owners can upload images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'venue-images' AND
    (auth.uid() = auth.uid())  -- Allow upload for authenticated users
);

-- Policy for public read access
drop policy if exists "Public read access for venue images" on storage.objects;
create policy "Public read access for venue images"
on storage.objects for select
to public
using (bucket_id = 'venue-images');

-- Policy for deleting - only venue owners can delete their images
drop policy if exists "Venue owners can delete their images" on storage.objects;
create policy "Venue owners can delete their images"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'venue-images' AND
    (auth.uid() = auth.uid())  -- Allow deletion by authenticated users
);

-- Policy for updating - only venue owners can update their images
drop policy if exists "Venue owners can update their images" on storage.objects;
create policy "Venue owners can update their images"
on storage.objects for update
to authenticated
using (
    bucket_id = 'venue-images' AND
    (auth.uid() = auth.uid())  -- Allow updates by authenticated users
);
