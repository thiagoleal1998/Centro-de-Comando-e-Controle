# Centro de Comando e Controle — Neuro Botics

Sistema interno da Neuro Botics (marca do **JT Group**). Reúne:

- **Projetos** e **Produtos** — organização das campanhas e cadastro de produtos.
- **Central Criativa** — briefing, geração de criativos (texto/imagem), preview, comandos em linguagem natural e versionamento, para Mercado Livre e Meta Ads/Cash on Delivery. (Fora do menu principal desde a v0.3.1 — rotas e dados continuam ativos.)
- **Assets** — biblioteca central de imagens, vídeos e referências.
- **Documentos** — PDFs enviados e links externos (Google Drive, OneDrive etc.) da operação.
- **Análise de Produtos** — sincronização ao vivo com múltiplas planilhas do Google Sheets (Esteira de Mineração, Shortlist Pronix), incluindo uma calculadora de viabilidade/rentabilidade por modalidade de envio.
- **Estratégia** — planilha do JT Group (projeção de crescimento e metas) ao lado de **Planos**: cenários de projeção nativos do sistema (despesas mensais + lucro desejado → faturamento necessário), guardados no Supabase.
- **Financeira** — despesas e compras, da mesma planilha de vendas.
- **Vendas** — planilha do JT Group (vendas brutas e detalhe mensal) ao lado de **Lançamentos** nativos do sistema: cadastro manual de mês, produto e vendas diárias, guardado no Supabase.
- **Organograma** — estrutura organizacional da Neuro Botics (Conselho Administrativo, Diretoria, Operações).
- **Administrativo** e **RH** — páginas dedicadas para cada área (ainda vazias, prontas para conteúdo).

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para a arquitetura completa, [ENVIRONMENT.md](./ENVIRONMENT.md) para as variáveis de ambiente necessárias e [CHANGELOG.md](./CHANGELOG.md) para o histórico de versões.

## Stack

- **Next.js 16** (App Router, TypeScript) — frontend e backend em um único app.
- **Tailwind CSS v4 + shadcn/ui** — interface.
- **Supabase** — banco de dados, auth e storage.
- **Kairogen** (MCP) — geração de imagem/vídeo. Nenhuma API paga é usada neste projeto.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis (veja ENVIRONMENT.md)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Deploy

Produção na Vercel, conta própria da Neuro Botics (`jt-group` — nunca a conta pessoal do usuário):

```bash
npm run lint && npm run build   # tem que passar limpo antes de qualquer deploy
npx vercel --prod
```

## Status do projeto

Em desenvolvimento por fases — veja o plano completo em `ARCHITECTURE.md`. Módulos ainda não implementados aparecem na interface como "Em desenvolvimento". A versão atual do app aparece no rodapé da barra lateral e em `package.json`.
