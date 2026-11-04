# Centro de Comando e Controle — Neuro Botics (by JT Group)

Sistema interno da Neuro Botics (marca do JT Group). Veja `README.md` para visão geral, `ARCHITECTURE.md` para arquitetura completa e `CHANGELOG.md` para o histórico de versões.

## Regras do projeto (não negociáveis)

- **Nenhuma API paga.** Anthropic/OpenAI foram descartadas por decisão do usuário. Kairogen (free tier, créditos limitados) é a única exceção, e mesmo assim com moderação — ver aviso de créditos. Antes de integrar qualquer SDK/API nova, confirmar que é genuinamente gratuita ou perguntar primeiro.
- **Interface em PT-BR.** Código e nomes internos em inglês; textos visíveis ao usuário em português.
- **Conta Vercel separada**: este projeto fica na conta/time `jt-group` na Vercel, nunca na conta pessoal `people-and-growth` do usuário (outro negócio dele). Sempre rodar `vercel whoami` antes de `vercel --prod` para confirmar a conta certa.
- **Sem dados/progresso falso.** Funcionalidade que depende de integração não configurada mostra erro claro, nunca resultado simulado.

## Comandos

```bash
npm run dev     # dev server
npm run build   # build de produção (rodar antes de qualquer deploy)
npm run lint    # eslint
```

## Antes de cada deploy

1. `npm run lint` e `npm run build` — ambos precisam passar limpos.
2. `npx vercel whoami` — confirmar que está em `contatoneurobotics-8836` / time `jt-group`.
3. `npx vercel --prod --yes`.

## Versionamento

O usuário pediu para manter isso sempre atualizado:

- **A cada mudança que vai para produção**: incrementar `version` em `package.json` (semver — patch para correções, minor para funcionalidade nova) e adicionar uma entrada em `CHANGELOG.md`.
- A versão aparece no rodapé da sidebar do app (lida de `package.json` em `src/components/layout/app-sidebar.tsx`).
- Depois de commitar, dar `git push` para `origin main` — o repositório GitHub deve sempre refletir o estado atual do projeto.
- Manter este arquivo (`CLAUDE.md`) e o `README.md` atualizados quando a arquitetura, stack ou fluxo de trabalho mudar — não deixá-los defasados.

## Infraestrutura externa (ver `ENVIRONMENT.md` para detalhes)

- **Supabase**: Postgres/Auth/Storage. Plano free — projetos pausam após inatividade prolongada; se o login falhar com "Failed to fetch", é a causa mais provável (reative em supabase.com/dashboard).
- **Kairogen**: provider de imagem/vídeo via MCP, OAuth device flow, token em `provider_tokens` (Supabase), não em `.env`.
- **Google Sheets** (Análise de Produtos): OAuth redirect flow (não device flow — o escopo de planilhas não é aceito nesse fluxo pelo Google; não service account — a organização bloqueia criação de chaves). Reautorizar visitando `/api/auth/google-sheets/start` logado no app.

---

@AGENTS.md
