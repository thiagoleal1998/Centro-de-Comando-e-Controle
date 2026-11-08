-- Estratégia — planos de projeção, nativos do sistema (não vêm do Google
-- Sheets). Um plano (strategy_plans) tem um lucro mensal desejado e várias
-- despesas mensais (strategy_plan_expenses); o faturamento necessário é
-- calculado como despesas totais + lucro desejado.

create table strategy_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target_profit numeric,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table strategy_plan_expenses (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references strategy_plans (id) on delete cascade,
  name text not null,
  monthly_amount numeric not null default 0 check (monthly_amount >= 0),
  notes text,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index strategy_plan_expenses_plan_id_idx on strategy_plan_expenses (plan_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on strategy_plans, strategy_plan_expenses to authenticated;

alter table strategy_plans enable row level security;
alter table strategy_plan_expenses enable row level security;

create policy "strategy_plans_owner_all" on strategy_plans
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "strategy_plan_expenses_owner_all" on strategy_plan_expenses
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);
