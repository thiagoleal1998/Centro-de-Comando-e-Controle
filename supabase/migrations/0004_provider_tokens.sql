-- Tokens OAuth de providers externos (ex.: Kairogen) que precisam ser
-- renovados em runtime. Diferente de API keys estáticas, refresh tokens
-- aqui sofrem rotação a cada uso — o valor precisa ser regravável pelo
-- próprio app, por isso não pode viver só no .env.local.
--
-- Single-tenant: uma linha por provider.

create table provider_tokens (
  provider text primary key,
  client_id text,
  access_token text,
  refresh_token text not null,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table provider_tokens enable row level security;

grant select, insert, update, delete on provider_tokens to authenticated;

create policy "provider_tokens_authenticated_all" on provider_tokens
  for all to authenticated
  using (true)
  with check (true);
