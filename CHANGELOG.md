# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [0.7.1] — 2026-11-07

### Adicionado
- Despesas e Compras (Financeira) agora mostram cada item como um card — nome em destaque, badges para colunas de texto (Banco, Vencimento, Forma de Pagamento etc.) e uma mini barra por coluna monetária, em vez de uma tabela densa. Não inventa nenhum total novo — só reapresenta o mesmo valor de cada célula de forma mais visual (nem a planilha nomeia a maioria dos meses, então as barras não são rotuladas, mas o valor exato aparece ao passar o mouse). Botão "Ver como tabela" alterna para a visão detalhada quando precisar.

### Infraestrutura
- Detecção de cabeçalho/colunas vazias extraída para `src/lib/sheet-table-detect.ts`, compartilhada entre `SheetSmartTable` e o novo `SheetItemCards`.

## [0.7.0] — 2026-11-07

### Adicionado
- **Lançamentos de vendas** (nova aba em Vendas) — cadastro manual de meses, produtos (reaproveita o cadastro de Produtos já existente) e vendas diárias, nativo do sistema (Supabase), independente da planilha do Google. Inclui: criar/editar/excluir mês com metas opcionais (faturamento, super meta, despesas previstas, margem prevista), lançar venda por produto/dia (unidades + faturamento), e um dashboard com KPIs calculados, ranking de faturamento por produto e grade produto × dia — no mesmo estilo visual das abas da planilha JT.
- A aba "Planilha JT" (antes "Vendas Brutas"/"2026" direto) passa a ficar ao lado de "Lançamentos" dentro de Vendas.

### Infraestrutura
- Tabelas `sales_months` e `sales_entries` no Supabase (RLS por `created_by`, mesmo padrão de Produtos/Projetos) — migration `supabase/migrations/0005_sales.sql`. **Precisa ser aplicada manualmente no SQL Editor do Supabase antes de usar a funcionalidade.**

## [0.6.5] — 2026-11-07

### Corrigido
- Ainda vazavam produtos como card de KPI (Descascador Elétrico, Ovo de Páscoa, Álbum e Figurinha da Copa, Copo Térmico Brasil) — vêm de uma mini-tabela de produtos à parte na planilha, fora das colunas onde fica a grade principal, então o cruzamento por nome da correção anterior não os via. Linhas com 2-5 valores em R$ agora só viram KPI se o rótulo tiver cara de métrica de negócio (meta, despesa, margem, líquido, mês, dia, etc.) — testado com o cenário exato reportado antes de publicar.

## [0.6.4] — 2026-11-07

### Corrigido
- Produtos com poucas vendas no mês (poucas células em R$ na linha, abaixo do limiar que identifica "linha de produto") apareciam como cards de KPI por engano. Agora a extração de KPIs cruza com a lista de produtos já identificada e descarta qualquer rótulo que seja na verdade um nome de produto.
- Removido o card espúrio "#DIV/0!" (erro de fórmula da planilha sendo tratado como rótulo).

## [0.6.3] — 2026-11-07

### Corrigido
- Dashboard mensal só mostrava Orgânico/Ads, sem Meta/Despesas/Margem/etc. Duas causas: (1) o rótulo desses KPIs ocupa uma célula mesclada na planilha, deixando uma célula vazia entre o rótulo e o valor — a busca agora procura nas próximas colunas em vez de só na imediatamente seguinte; (2) linhas de KPI com valores "R$ 0,00" residuais de fórmulas vazias estavam sendo confundidas com linhas de produto — o limite de quantos valores em R$ uma linha pode ter antes de contar como "linha de produto" foi recalibrado.

## [0.6.2] — 2026-11-07

### Corrigido
- Dashboard mensal (Abril-Julho) deixava de fora boa parte do painel de metas da planilha original (MÊS ANTERIOR, LÍQUIDO PREVISTO, DESPESAS PREVISTAS, Dias corridos/Realizados/Restantes, e até REALIZADO/MARGEM por causa de uma terminação de palavra diferente). A extração de KPIs usava uma lista fixa de palavras-chave; trocada por uma detecção pelo FORMATO da linha (poucos valores = KPI, dezenas de valores = linha de produto na grade diária), que captura qualquer rótulo do painel sem depender de adivinhar o texto exato.

## [0.6.1] — 2026-11-07

### Adicionado
- Dashboard mensal (Abril-Julho, em Vendas) ganhou uma grade "Vendas por produto e dia" — cada célula mostra unidades (ou faturamento, com um botão pra alternar) por produto/dia, com intensidade de cor proporcional ao valor e tooltip com os dois números ao passar o mouse. Identifica o bloco de colunas de cada dia pela distância até a próxima data no cabeçalho, e dentro do bloco reconhece faturamento/quantidade pelo formato da célula (R$ vs. número puro) em vez de uma posição fixa — mais resistente a blocos de largura inconsistente entre os meses.

## [0.6.0] — 2026-11-07

### Alterado
- Página Vendas reestruturada: "Vendas Brutas" ao lado de uma aba "2026" (anos futuros entram do mesmo jeito), com os meses (Abril-Julho) como sub-abas dentro do ano, em vez de uma lista plana.
- Abas mensais (Abril-Julho) ganharam um dashboard em vez da grade de 90+ colunas diárias: cards com os KPIs do mês (meta, realizado, projeção, margem, rentabilidade, resultado) e um ranking de faturamento por produto com barra proporcional — o detalhe dia a dia continua só na planilha original.

### Infraestrutura
- `src/lib/sales-sheet-config.ts` — abas mensais agora agrupadas por ano (`VENDAS_MONTHS_BY_YEAR`) em vez de uma lista plana.
- `SheetContent`/`SheetLoadError` extraídos para `sheet-content.tsx`, compartilhados entre `SheetGroupTabs` (Estratégia/Financeira) e o novo `VendasNestedTabs` (Vendas, com a hierarquia ano → mês).

## [0.5.3] — 2026-11-07

### Removido
- Abas Produtos e Promotores removidas da página Vendas (a critério do usuário).

## [0.5.2] — 2026-11-07

### Corrigido
- O gráfico de Vendas Brutas não carregava dados. Causa: a aba "Dados de vendas Brutas" tem uma linha em branco antes do cabeçalho de verdade, e `rangeToTable()` assumia que a primeira linha da planilha é sempre o cabeçalho — com isso, `headers`/`rows` saíam vazios para essa aba (o `raw`, usado pelas outras visualizações, não era afetado). Corrigido para usar a primeira linha com conteúdo como cabeçalho, em vez da linha 0.

## [0.5.1] — 2026-11-07

### Alterado
- Substituída a grade bruta (letras de coluna estilo planilha) das páginas Estratégia/Financeira/Vendas por renderizações mais visuais:
  - `SheetSmartTable` — detecta a linha de cabeçalho de verdade (a com mais células preenchidas, em vez de assumir que é sempre a linha 1), esconde colunas totalmente vazias e alinha valores monetários/percentuais à direita. Usado como padrão em Meta, Despesas, Compras, Produtos, Promotores e nas abas mensais (Abril-Julho).
  - `ProjecaoCards` — a aba Projeção (Estratégia) agora mostra um card de destaque com a meta final e um card por mês (Faturamento, Vendas e Realizado/Diferença quando preenchidos), em vez de linhas de planilha. Também corrige um typo da planilha de origem ("Janiero/27") que faria esse mês herdar por engano os dados do mês anterior.
  - `VendasBrutasChart` — a aba Vendas Brutas (Vendas) agora é um gráfico de barras por mês com total do período em destaque, tooltip ao passar o mouse e alternância para visualização em tabela.
- `SheetRawGrid` removido (substituído pelos componentes acima).

### Infraestrutura
- `src/lib/format.ts` — funções `parseBrNumber`/`formatBrl`/`formatCompactNumber` compartilhadas (antes duplicadas em `analise-produtos/page.tsx`).

## [0.5.0] — 2026-11-07

### Adicionado
- **Estratégia** (nova página no menu) e **Vendas** (nova página no menu), além da página **Financeira** (antes vazia) agora preenchida — todas sincronizadas ao vivo com a "Planilha de Vendas" do Google Sheets: Projeção/Meta em Estratégia, Despesas/Compras em Financeira, e Vendas Brutas/Produtos/Promotores/Abril-Julho em Vendas.
- `SheetRawGrid` — novo componente que espelha uma aba como grade bruta (letras de coluna, números de linha, como no Google Sheets), usado nessas três páginas porque várias abas da planilha de vendas têm cabeçalhos em duas linhas e blocos mesclados que não cabem numa tabela com header fixo.

### Corrigido
- `fetchSheetTables()` não escapava nomes de aba com espaço no range da API do Sheets (ex.: "Dados de vendas Brutas"), o que quebraria a busca dessa aba — corrigido para sempre citar o nome da aba entre aspas simples.

### Infraestrutura
- `src/lib/sales-sheet-config.ts` e `src/lib/sheets-source.ts` (helper `loadSheetGroup` compartilhado) — novo padrão de configuração para planilhas cujas abas se espalham por páginas diferentes do menu, em vez de ficarem juntas numa só página como a Análise de Produtos.

## [0.4.1] — 2026-11-03

### Adicionado
- Páginas **Administrativo**, **Financeira** e **RH** no menu principal — vazias por enquanto, prontas para receber conteúdo.

### Alterado
- Removidas as abas Administrativo/Financeira/RH do Organograma (viraram páginas próprias no menu em vez de nós da árvore).

## [0.4.0] — 2026-11-03

### Adicionado
- **Organograma** — nova área no menu principal mostrando a estrutura organizacional da Neuro Botics (Conselho Administrativo, Diretoria, Operações e as abas Administrativo/Financeira/RH), com cards de pessoa/cargo conectados em árvore.

## [0.3.1] — 2026-11-03

### Removido
- **Campanhas** e **Automações** (placeholders ainda não construídos) removidos do menu e das rotas.
- **Central Criativa** removida do menu principal — o código, as rotas e os dados continuam intactos, apenas sem acesso direto pela navegação.

## [0.3.0] — 2026-11-03

### Adicionado
- **Análise de Produtos** agora suporta múltiplas planilhas como fonte: além da "Esteira de Mineração", foi adicionada a planilha "Shortlist Pronix" (JT Magazine — Shortlist DVP + retorno Pronix), com suas 6 abas (Produtos, Resumo, Checklist de Fornecedores, Retorno Pronix, Como Decidir, Fluxo). A página agora tem um seletor de fonte (Esteira / Shortlist / Viabilidade) e cada fonte carrega e falha de forma independente.
- Aba "Resumo" (e outras no formato chave/valor, sem header tabular) ganharam um card dedicado em vez da tabela genérica.
- `statusTone()` (badges de status) ampliado para reconhecer o vocabulário da nova planilha: `PASSA_DVP_CONDICIONAL`, `BLOQUEADO_*`, `VERDE`, `TALVEZ`, `RESERVA`, `NÃO AGORA`.

### Infraestrutura
- `src/lib/sheets-config.ts` reestruturado de config fixa (uma planilha) para `SHEET_SOURCES`, um registro por fonte — cada uma com seu próprio ID de planilha (variável de ambiente), ordem de abas, colunas e regras de exibição.
- `fetchSheetTables()` agora recebe o ID da planilha como parâmetro em vez de um valor fixo, permitindo buscar qualquer planilha autorizada com o mesmo token OAuth.

## [0.2.1] — 2026-11-03

### Adicionado
- Página pública de Política de Privacidade (`/privacidade`), exigida pelo Google para publicar o app OAuth em modo "Em produção" (necessário porque o refresh token do Google Sheets expira em 7 dias em apps no modo "Testando" — descoberto ao vivo quando a sincronização parou de funcionar).

## [0.2.0] — 2026-11-03

Primeira versão publicada no GitHub. Reúne todo o trabalho das sessões anteriores (sem histórico de commits prévio).

### Adicionado
- **Fase 0-1**: arquitetura (Next.js 16 + Supabase + Tailwind v4/shadcn), shell do sistema (sidebar, header, dashboard, tema claro/escuro).
- **Fase 2**: autenticação (Supabase Auth) e CRUD completo de Projetos.
- **Fase 3**: cadastro de Produtos e biblioteca de Assets (upload para Supabase Storage).
- **Fase 4**: Central Criativa — briefing, geração (stub para imagem/vídeo, placeholder honesto para copy), preview, comandos em linguagem natural, versionamento com histórico e restauração.
- **Identidade visual**: rebranding completo para JT Group (paleta navy/azul, mascote "Neuro", fonte Montserrat).
- **Análise de Produtos**: nova área com sincronização ao vivo da planilha "Esteira de Mineração de Produtos" (Google Sheets, OAuth), 9 abas (Radar, Análises, Concorrentes, Fornecedores, Pilotos, Gates, Metodologia, Config, Scores) com busca, badges de status e tag "Novo" (24h) nos produtos recém-capturados.
- **Análise de Viabilidade**: calculadora de rentabilidade por produto/modalidade de envio (Pacto Full, Correios, Transportadora), com a regra de precificação da Pacto Full (R$1/unidade de etiquetagem + R$160 de frete rateado pelo lote).
- Deploy em produção na Vercel (conta própria da Neuro Botics, separada de outros projetos).

### Infraestrutura
- Kairogen (MCP, OAuth) como provider de imagem/vídeo — nenhuma API paga é usada no projeto.
- Tabela `provider_tokens` no Supabase para refresh tokens que precisam ser regravados em runtime (Kairogen, Google Sheets).
- Number da versão exibido no rodapé da sidebar (lido de `package.json`).

### Segurança
- Next.js atualizado para 16.4.5 (corrige vulnerabilidade de segurança sinalizada pelo próprio build do Next).

## [0.1.0] — 2026-09-28

Scaffold inicial do projeto (Fase 0 — arquitetura).
