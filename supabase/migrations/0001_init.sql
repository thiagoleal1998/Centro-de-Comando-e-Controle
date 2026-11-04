-- Centro de Comando e Controle — Neuro Botics
-- Schema inicial: Projetos, Produtos, Assets, Criativos, Versões, Jobs, Exportações.
-- Aplicar via `supabase db push` ou pelo SQL editor do painel Supabase.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type channel_type as enum ('mercado_livre', 'meta_ads');

create type asset_type as enum ('image', 'video', 'document', 'reference');

create type creative_type as enum ('image', 'video', 'copy', 'full_ad');

create type creative_status as enum (
  'DRAFT',
  'GENERATING',
  'PREVIEW',
  'NEEDS_REVISION',
  'APPROVED',
  'EXPORTED',
  'FAILED'
);

create type job_status as enum ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED');

-- ---------------------------------------------------------------------
-- Produtos
-- ---------------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  features text[] not null default '{}',
  benefits text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  price numeric,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Projetos
-- ---------------------------------------------------------------------

create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  product_id uuid references products (id) on delete set null,
  channel channel_type not null,
  objective text,
  notes text,
  status text not null default 'ACTIVE',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_created_by_idx on projects (created_by);
create index projects_product_id_idx on projects (product_id);

-- ---------------------------------------------------------------------
-- Assets (biblioteca)
-- ---------------------------------------------------------------------

create table assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  type asset_type not null,
  category text,
  storage_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'READY',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index assets_project_id_idx on assets (project_id);
create index assets_product_id_idx on assets (product_id);

-- ---------------------------------------------------------------------
-- Criativos
-- ---------------------------------------------------------------------

create table creatives (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects (id) on delete cascade,
  channel channel_type not null,
  type creative_type not null,
  briefing jsonb not null default '{}'::jsonb,
  status creative_status not null default 'DRAFT',
  current_version_id uuid,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index creatives_project_id_idx on creatives (project_id);

-- ---------------------------------------------------------------------
-- Versões de criativo (append-only)
-- ---------------------------------------------------------------------

create table creative_versions (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references creatives (id) on delete cascade,
  version_number integer not null,
  parent_version_id uuid references creative_versions (id),
  content jsonb not null default '{}'::jsonb,
  instruction_text text,
  generated_by text,
  status text not null default 'READY',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  unique (creative_id, version_number)
);

create index creative_versions_creative_id_idx on creative_versions (creative_id);

alter table creatives
  add constraint creatives_current_version_fk
  foreign key (current_version_id) references creative_versions (id);

-- ---------------------------------------------------------------------
-- Jobs de geração (fila)
-- ---------------------------------------------------------------------

create table generation_jobs (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references creatives (id) on delete cascade,
  version_id uuid references creative_versions (id),
  type text not null,
  status job_status not null default 'QUEUED',
  provider text,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generation_jobs_status_idx on generation_jobs (status);
create index generation_jobs_creative_id_idx on generation_jobs (creative_id);

-- ---------------------------------------------------------------------
-- Exportações
-- ---------------------------------------------------------------------

create table exports (
  id uuid primary key default gen_random_uuid(),
  creative_id uuid not null references creatives (id) on delete cascade,
  version_id uuid not null references creative_versions (id),
  channel channel_type not null,
  format text not null,
  resolution text,
  file_url text not null,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create index exports_creative_id_idx on exports (creative_id);

-- ---------------------------------------------------------------------
-- Extensões por canal
-- ---------------------------------------------------------------------

create table mercado_livre_listings (
  creative_id uuid primary key references creatives (id) on delete cascade,
  title text,
  description text,
  image_sequence jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb
);

create table meta_ads_creatives (
  creative_id uuid primary key references creatives (id) on delete cascade,
  hook text,
  headline text,
  primary_text text,
  cta text,
  angle text,
  format text
);

-- ---------------------------------------------------------------------
-- Row Level Security — cada usuário só vê o que criou
-- (single-tenant hoje; isolamento por created_by permite crescer depois)
-- ---------------------------------------------------------------------

alter table products enable row level security;
alter table projects enable row level security;
alter table assets enable row level security;
alter table creatives enable row level security;
alter table creative_versions enable row level security;
alter table generation_jobs enable row level security;
alter table exports enable row level security;
alter table mercado_livre_listings enable row level security;
alter table meta_ads_creatives enable row level security;

create policy "products_owner_all" on products
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "projects_owner_all" on projects
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "assets_owner_all" on assets
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "creatives_owner_all" on creatives
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "creative_versions_owner_all" on creative_versions
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "generation_jobs_owner_all" on generation_jobs
  for all using (
    exists (
      select 1 from creatives c
      where c.id = generation_jobs.creative_id and c.created_by = auth.uid()
    )
  );

create policy "exports_owner_all" on exports
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "mercado_livre_listings_owner_all" on mercado_livre_listings
  for all using (
    exists (
      select 1 from creatives c
      where c.id = mercado_livre_listings.creative_id and c.created_by = auth.uid()
    )
  );

create policy "meta_ads_creatives_owner_all" on meta_ads_creatives
  for all using (
    exists (
      select 1 from creatives c
      where c.id = meta_ads_creatives.creative_id and c.created_by = auth.uid()
    )
  );
