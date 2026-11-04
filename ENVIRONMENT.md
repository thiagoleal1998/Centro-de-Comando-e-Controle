# Variáveis de ambiente

Copie `.env.example` para `.env.local` (ignorado pelo git) e preencha os valores abaixo. Nenhuma dessas chaves deve aparecer no código, em commits ou em texto versionado.

## Supabase (obrigatório a partir da Fase 2)

Crie um projeto em [supabase.com](https://supabase.com) e pegue os valores em **Project Settings → API**:

| Variável | Onde encontrar | Exposta ao browser? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key | Sim (protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **Não** — só em código server-side (route handlers, worker) |

Alternativa: se preferir, posso operar o Supabase diretamente via o conector MCP "claude.ai Supabase" — nesse caso, autorize o conector nas configurações do claude.ai em vez de colar as chaves aqui.

## Providers de IA (Fase 5)

**Regra do projeto: nenhuma API paga.** Texto/copy fica como placeholder até existir uma opção de texto genuinamente sem custo — nada de Anthropic/OpenAI pagas.

| Variável | Uso |
|---|---|
| `KAIROGEN_CLIENT_ID` / `KAIROGEN_REFRESH_TOKEN` | Geração de imagem e vídeo (Seedream, Flux, Nano Banana, GPT Image, Sora, Veo, Kling, etc.) via MCP da Kairogen. Ver nota abaixo — não é uma API key simples. Free tier com crédito limitado (veja o aviso de créditos do projeto). |

### Kairogen (OAuth device flow, não API key)

Kairogen autentica por **OAuth 2.0 device flow**, não por chave estática:
1. Conta já criada em [app.kairogen.ai](https://app.kairogen.ai).
2. O adapter gera um link de autorização para aprovar uma única vez; o refresh token resultante é o que vai para `.env.local`.
3. Free tier com crédito limitado — testar geração real com moderação.

## Vídeo (a partir da Fase 6)

Geração de clipes/imagens de apoio via Kairogen (acima). A **montagem/edição final** (cortes, legendas, B-roll, timeline — o que o HyperFrames faz) ainda não tem solução definida: não é uma API tradicional, e exigiria um agente rodando no servidor. Ver `ARCHITECTURE.md` → "HyperFrames — não é um AIProvider".

## Análise de Produtos (Google Sheets)

A página busca os dados **ao vivo** direto da planilha a cada carregamento — não há cópia local, a planilha é sempre a fonte da verdade.

Autentica como o **usuário dono da planilha** via OAuth padrão de redirect (não é Service Account — a organização do Google Workspace bloqueia criação de chaves de service account via política `iam.disableServiceAccountKeyCreation`; e o escopo de planilhas também não é aceito no device flow). O refresh token fica na tabela `provider_tokens` do Supabase (mesmo esquema da Kairogen), não em `.env.local`.

| Variável | Uso |
|---|---|
| `GOOGLE_SHEETS_CLIENT_ID` / `GOOGLE_SHEETS_CLIENT_SECRET` | Credenciais do OAuth Client (tipo "Aplicativo da Web") criado no Google Cloud Console. |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | ID da planilha (o trecho entre `/d/` e `/edit` na URL). |

Setup (gratuito): Google Cloud Console → projeto → ativar "Google Sheets API" → configurar a tela de consentimento OAuth (externo, com o próprio e-mail como usuário de teste, escopo `spreadsheets.readonly` adicionado em "Escopos") → criar um "ID do cliente OAuth" tipo "Aplicativo da Web" com os redirect URIs `http://localhost:3000/api/auth/google-sheets/callback` e `https://<seu-dominio>/api/auth/google-sheets/callback` → logado no Centro de Comando, acessar `/api/auth/google-sheets/start` e aprovar. Para reautorizar (ex.: trocar de conta), revogue o acesso em [myaccount.google.com/permissions](https://myaccount.google.com/permissions) antes.

## Aplicação

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Base URL usada em links/redirects (ex.: `http://localhost:3000` em dev). |
