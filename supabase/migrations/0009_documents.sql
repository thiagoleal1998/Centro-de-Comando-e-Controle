-- Documentos — PDFs enviados ou links externos (Google Drive, OneDrive,
-- etc.). Reaproveita o bucket "assets" do Storage (já existe, já é
-- público, já tem as policies de owner por pasta) com o prefixo
-- "<user_id>/documentos/..." — não precisa de bucket novo.

create type document_kind as enum ('file', 'link');

create table documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind document_kind not null,
  storage_path text, -- preenchido quando kind = 'file'
  url text, -- preenchido quando kind = 'link'
  description text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

grant usage on schema public to authenticated;
grant select, insert, update, delete on documents to authenticated;

alter table documents enable row level security;

create policy "documents_owner_all" on documents
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);
