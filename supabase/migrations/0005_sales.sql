-- Vendas — lançamentos manuais, nativos do sistema (não vêm do Google
-- Sheets). Um mês (sales_months) tem metas opcionais e várias linhas de
-- venda por produto/dia (sales_entries), referenciando o cadastro de
-- produtos já existente.

create table sales_months (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  month integer not null check (month between 1 and 12),
  meta_faturamento numeric,
  super_meta_faturamento numeric,
  despesas_previstas numeric,
  margem_prevista_pct numeric,
  notes text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (created_by, year, month)
);

create table sales_entries (
  id uuid primary key default gen_random_uuid(),
  month_id uuid not null references sales_months (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  day integer not null check (day between 1 and 31),
  units integer not null default 0 check (units >= 0),
  revenue numeric not null default 0 check (revenue >= 0),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (month_id, product_id, day)
);

create index sales_entries_month_id_idx on sales_entries (month_id);
create index sales_entries_product_id_idx on sales_entries (product_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on sales_months, sales_entries to authenticated;

alter table sales_months enable row level security;
alter table sales_entries enable row level security;

create policy "sales_months_owner_all" on sales_months
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "sales_entries_owner_all" on sales_entries
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);
