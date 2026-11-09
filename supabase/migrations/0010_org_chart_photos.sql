-- Ajuste de posição/zoom das fotos do Organograma. Diferente das demais
-- tabelas do projeto (owner-only), esta é compartilhada: qualquer usuário
-- autenticado pode ver e ajustar, pois o organograma é único para toda a
-- empresa, não um dado pessoal por usuário.

create table org_chart_photos (
  person_key text primary key,
  position_x numeric not null default 50,
  position_y numeric not null default 50,
  zoom numeric not null default 100,
  updated_by uuid not null references auth.users (id),
  updated_at timestamptz not null default now()
);

grant usage on schema public to authenticated;
grant select, insert, update, delete on org_chart_photos to authenticated;

alter table org_chart_photos enable row level security;

create policy "org_chart_photos_select_all" on org_chart_photos
  for select to authenticated using (true);

create policy "org_chart_photos_insert_all" on org_chart_photos
  for insert to authenticated with check (true);

create policy "org_chart_photos_update_all" on org_chart_photos
  for update to authenticated using (true) with check (true);

create policy "org_chart_photos_delete_all" on org_chart_photos
  for delete to authenticated using (true);
