-- Add birth_year to members table
alter table members add column if not exists birth_year integer;

-- Allow family admin to insert members without auth (for child accounts)
-- Admin operations go through createAdminClient() so RLS is bypassed;
-- this policy is here as a safety net if we ever use user client for this.
create policy if not exists "members_admin_manage" on members
  for all using (
    family_id = my_family_id()
    and (select role from members where auth_user_id = auth.uid() limit 1) = 'admin'
  );
