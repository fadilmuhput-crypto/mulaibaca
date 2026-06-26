-- Ensure username has a unique index (may already exist)
create unique index if not exists members_username_idx on members(username)
  where username is not null;
