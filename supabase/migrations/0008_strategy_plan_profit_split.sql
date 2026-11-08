-- Divisão do lucro desejado de um plano entre sócios/empresa (ex.: Thiago
-- 40%, Jonas 40%, Empresa 10%). Cada linha é um percentual aplicado sobre
-- o lucro desejado do plano — não precisa somar 100%.

create table strategy_plan_profit_splits (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references strategy_plans (id) on delete cascade,
  name text not null,
  percentage numeric not null check (percentage >= 0 and percentage <= 100),
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index strategy_plan_profit_splits_plan_id_idx on strategy_plan_profit_splits (plan_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on strategy_plan_profit_splits to authenticated;

alter table strategy_plan_profit_splits enable row level security;

create policy "strategy_plan_profit_splits_owner_all" on strategy_plan_profit_splits
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);
