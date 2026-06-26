-- Tambah kolom is_anonymous pada tabel reviews
alter table reviews add column if not exists is_anonymous boolean not null default false;
