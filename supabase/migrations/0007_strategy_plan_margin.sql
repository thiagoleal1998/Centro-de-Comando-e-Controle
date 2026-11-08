-- Adiciona rentabilidade desejada ao plano. O faturamento necessário passa
-- a ser lucro desejado / rentabilidade (ex.: lucrar R$20.000 com 10% de
-- rentabilidade exige R$200.000 de faturamento) em vez de só despesas +
-- lucro — essa conta reflete melhor como lucro se relaciona com vendido
-- bruto no negócio do usuário.

alter table strategy_plans add column target_margin_pct numeric;
