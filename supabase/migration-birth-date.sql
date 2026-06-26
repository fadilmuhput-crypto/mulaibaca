-- Replace birth_year (integer) with birth_date (date) for precise age calculation
alter table members add column if not exists birth_date date;

-- Migrate existing birth_year data (assume Jan 1st of that year)
update members set birth_date = make_date(birth_year, 1, 1) where birth_year is not null and birth_date is null;
