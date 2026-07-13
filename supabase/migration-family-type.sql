-- Add type column to families table (family vs circle)
alter table families add column if not exists type text not null default 'family' check (type in ('family', 'circle'));
