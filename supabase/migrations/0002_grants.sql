-- Corrige "permission denied for table X": RLS restringe LINHAS, mas o
-- Postgres ainda exige GRANT de privilégio na tabela em si para o role
-- avaliar a policy. Sem isso, toda operação é negada antes mesmo do RLS.
--
-- Escopo: só `authenticated`, porque toda policy exige auth.uid() =
-- created_by — não há necessidade de acesso anônimo nestas tabelas.

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  products,
  projects,
  assets,
  creatives,
  creative_versions,
  generation_jobs,
  exports,
  mercado_livre_listings,
  meta_ads_creatives
to authenticated;
