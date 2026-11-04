# Arquitetura — Centro de Comando e Controle

> Aprovado em 2026-09-28. Este documento é a referência viva da arquitetura; atualize-o quando decisões estruturais mudarem.

## Visão geral

Sistema interno modular da Neuro Botics. Primeiro módulo: a **Central Criativa**, com o fluxo:

```
Produto → Briefing → IA → Assets → Criativo → Preview → Feedback → Nova versão → Aprovação → Exportação
```

Mercado Livre e Meta Ads/Cash on Delivery são **fluxos criativos distintos** (regras, objetivos e estrutura próprios), não dois formatos de um mesmo fluxo.

## Stack e decisões

| Camada | Escolha | Motivo |
|---|---|---|
| Frontend + Backend | Next.js 16 (App Router, TS), app único | Server Components mantêm chaves de API no servidor; um único deploy; modularidade via pastas de domínio em vez de monorepo. |
| UI | Tailwind CSS v4 + shadcn/ui (estilo `base-nova`, base-ui) | Consistência visual rápida, sem depender de design system pago. |
| Database | Supabase Postgres | Exigência do projeto; RLS para isolar dados por usuário mesmo em single-tenant. |
| Auth | Supabase Auth | Nativo do Supabase, sem infraestrutura extra. |
| Storage | Supabase Storage (buckets `products`, `references`, `assets`, `exports`) | Integrado ao mesmo projeto Supabase. |
| AI Layer | Interface `AIProvider` + registry por capability | Não travar o sistema a um único modelo; trocar provider sem reescrever fluxos. |
| Providers ativos | Kairogen (imagem/vídeo via MCP, free tier com crédito limitado) | **Regra do projeto: nenhuma API paga** (decisão de 2026-10-01). Anthropic foi cogitado e revertido por ser pago. Texto/copy fica como placeholder até existir uma opção de texto sem custo. |
| Fila de jobs | Tabela `generation_jobs` no Postgres + worker Node com polling | Sem Docker/Redis disponíveis nesta máquina; trocável depois por Inngest/Trigger.dev/BullMQ sem mudar a lógica de domínio. |
| MCP | Não integrado ainda | Ponto de extensão é a própria interface `AIProvider` — um adapter MCP futuro implementa a mesma interface. |
| Mercado Livre / Meta Ads | Exportação de arquivos, sem publicação automática via API | Fora de escopo até Fases 7/8. |

## Estrutura de pastas

```
Centro de comando e controle/
├── .env.example
├── ARCHITECTURE.md / ENVIRONMENT.md / README.md
├── supabase/
│   └── migrations/           # schema versionado
├── src/
│   ├── app/
│   │   ├── (app)/             # shell autenticado: sidebar + header
│   │   │   ├── dashboard/
│   │   │   ├── projetos/[projectId]/
│   │   │   ├── central-criativa/[projectId]/criativo/[creativeId]/
│   │   │   ├── assets/ produtos/ campanhas/ automacoes/ configuracoes/
│   │   └── api/               # route handlers (IA, jobs)
│   ├── components/{ui,layout,dashboard,creative,projects,assets}/
│   ├── lib/
│   │   ├── supabase/          # clients browser/server
│   │   ├── ai/                # provider.interface.ts, registry.ts, providers/
│   │   ├── jobs/               # fila baseada em Postgres
│   │   ├── channels/{mercado-livre,meta-ads}/
│   │   └── validations/       # zod schemas
│   └── types/
└── public/
```

## Modelo de dados (principais entidades)

- **projects** — id, name, product_id, channel (`mercado_livre` | `meta_ads`), objective, notes, status, created_by, timestamps.
- **products** — id, name, description, features[], benefits[], specs (jsonb), price, source_images[].
- **assets** — id, project_id, product_id (nullable), type (image/video/document/reference), category, storage_path, metadata (jsonb), status.
- **creatives** — id, project_id, channel, type (image/video/copy/full_ad), briefing (jsonb), status, current_version_id.
  - status: `DRAFT` → `GENERATING` → `PREVIEW` → `NEEDS_REVISION` → `APPROVED` → `EXPORTED` (ou `FAILED` em qualquer ponto de geração).
- **creative_versions** — id, creative_id, version_number, parent_version_id, content (jsonb/url), instruction_text, generated_by, status, created_at. **Append-only, nunca sobrescrita.**
- **generation_jobs** — id, creative_id, version_id, type, status (`QUEUED`/`RUNNING`/`SUCCEEDED`/`FAILED`), provider, payload (jsonb), error_message, timestamps.
- **exports** — id, creative_id, version_id, channel, format, resolution, file_url, created_at.
- **mercado_livre_listings** / **meta_ads_creatives** — extensões 1:1 de `creatives` com campos específicos de cada canal.

Regra de negócio chave: um criativo `APPROVED` só aceita nova versão — nunca edição in-place.

## Camada de IA (`src/lib/ai`)

```
AIProvider
├── generateText(prompt, context)
├── generateImage(prompt, context)
├── editImage(image, instruction, context)
├── generateVideo(...)   // StubProvider por enquanto
├── editVideo(...)       // StubProvider por enquanto
└── analyzeAsset(asset)
```

Um `registry` (`src/lib/ai/registry.ts`) seleciona o provider por capability. Capabilities sem provider configurado retornam erro explícito — nunca dado simulado. Não há provider de texto ativo (ver regra "nenhuma API paga" acima); `getImageProvider()` está reservado para o adapter Kairogen.

### Kairogen (imagem e vídeo) — nota de integração

Kairogen (`mcp.kairogen.ai`) é um servidor MCP com catálogo multi-modelo (Seedream, Flux, Nano Banana, GPT Image, Sora, Veo, Kling, Seedance). Autenticação é **OAuth 2.0 device flow** (sem API key estática) — o adapter `KairogenProvider` precisa:
1. Completar o device flow uma vez (gera um link de autorização que o usuário aprova na conta Kairogen).
2. Guardar o refresh token com segurança (nunca no client) e renovar automaticamente.
3. Chamar as tools MCP (`generate_image`, `generate_video`, `get_generation`) com `wait_for_completion: false` e fazer polling — encaixa bem no nosso `generation_jobs`.

Requer conta em [app.kairogen.ai](https://app.kairogen.ai/auth/register); o free tier tem crédito limitado, então volume real provavelmente exige plano pago.

### HyperFrames — não é um AIProvider

HyperFrames (`heygen-com/hyperframes`) **não é uma API de geração/edição de vídeo** — é um framework open-source que renderiza HTML/CSS/JS em MP4, pensado para ser operado por um agente de código (instalado como skill do Claude Code via `npx skills add heygen-com/hyperframes`) que escreve as composições e roda o CLI de render. Não existe endpoint HTTP para chamar de uma rota de servidor comum.

Se quisermos reproduzir esse fluxo de edição (cortes, legendas, B-roll, timeline) dentro do Centro de Comando, a Fase 6 precisaria embutir um agente de verdade rodando no servidor (ex.: Claude Agent SDK escrevendo as composições HTML e invocando o CLI do HyperFrames) — uma peça de infraestrutura mais pesada do que uma chamada de API, e ainda não desenhada. Fica registrado como decisão em aberto para quando chegarmos na Fase 6.

## Fases de desenvolvimento

0. **Arquitetura** — este documento. ✅
1. **Shell do sistema** — layout, sidebar, header, dashboard, navegação, tema. ✅
2. **Projetos** — CRUD completo, ligado ao Supabase (+ auth). ✅
3. **Produtos e Assets** — cadastro, upload, biblioteca. ✅
4. **Central Criativa** — briefing, geração (via stub), preview, comandos, versionamento. ✅ (só "copy" gera de verdade nesta fase; imagem/vídeo/anúncio completo falham com erro explícito até a Fase 5). ← próxima: Fase 5
5. **Camada de IA real** — adapter Kairogen plugado no fluxo de imagem da Fase 4. Texto/copy segue como placeholder (sem API paga) até haver uma opção de texto sem custo. ← em andamento
6. **Vídeo** — pipeline de upload/análise/geração/edição/preview/exportação.
7. **Fluxo especializado Mercado Livre.**
8. **Fluxo especializado Meta Ads/COD.**
9. **Polimento** — testes, segurança, performance, tratamento de erros.

## Riscos conhecidos

- **Edição/montagem de vídeo (Fase 6)** é mais complexa do que uma chamada de API: reproduzir o fluxo tipo HyperFrames exige um agente rodando no servidor (não é um `AIProvider.editVideo()` simples). Ainda não desenhado.
- **Kairogen usa OAuth device flow**, não API key — o adapter precisa de um fluxo de autorização único + renovação de token, e o free tier tem crédito limitado.
- Fila via Postgres não foi desenhada para alto volume — documentada como trocável.
- Resolução de contexto hierárquico para comandos em linguagem natural tem complexidade moderada (Fase 4).
- Armazenamento de vídeo no Supabase Storage pode exigir revisão de custo/CDN quando o volume crescer.
