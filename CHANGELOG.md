# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui. Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

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
