// Setup único de autenticação OAuth (device flow) com a Kairogen.
// Não consome créditos de geração — é só autenticação.
//
// Ao concluir, salva o token na tabela provider_tokens do Supabase (não no
// .env.local) porque a Kairogen rotaciona o refresh_token a cada uso — o
// valor precisa poder ser reescrito pelo próprio app depois.
//
// Uso: node scripts/kairogen-device-auth.mjs

import { readFileSync } from "node:fs"

const AUTH_SERVER = "https://api.kairogen.ai"
const SCOPES = "openid profile kairogen:read kairogen:generate"

function loadEnvLocal() {
  const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
  const env = {}
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) env[match[1]] = match[2]
  }
  return env
}

async function registerClient() {
  const res = await fetch(`${AUTH_SERVER}/oauth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "Centro de Comando e Controle - Neuro Botics",
      token_endpoint_auth_method: "none",
      grant_types: ["urn:ietf:params:oauth:grant-type:device_code", "refresh_token"],
      response_types: [],
      scope: SCOPES,
    }),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(`Falha ao registrar client: ${res.status} ${JSON.stringify(body)}`)
  return body
}

async function startDeviceAuthorization(clientId) {
  const res = await fetch(`${AUTH_SERVER}/oauth/device_authorization`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, scope: SCOPES }),
  })
  const body = await res.json()
  if (!res.ok) {
    throw new Error(`Falha ao iniciar device authorization: ${res.status} ${JSON.stringify(body)}`)
  }
  return body
}

async function pollToken(clientId, deviceCode, intervalSeconds, expiresInSeconds) {
  const deadline = Date.now() + expiresInSeconds * 1000
  let interval = intervalSeconds

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, interval * 1000))

    const res = await fetch(`${AUTH_SERVER}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
        client_id: clientId,
      }),
    })
    const body = await res.json()

    if (!body.error && body.access_token) {
      return body
    }
    if (body.error === "authorization_pending") continue
    if (body.error === "slow_down") {
      interval += 5
      continue
    }
    throw new Error(`Erro no token endpoint: ${body.error} ${body.error_description ?? ""}`)
  }

  throw new Error("Tempo esgotado esperando a aprovação.")
}

async function saveToSupabase(env, clientId, token) {
  const email = env.KAIROGEN_SETUP_EMAIL
  const password = env.KAIROGEN_SETUP_PASSWORD
  if (!email || !password) {
    console.log("(KAIROGEN_SETUP_EMAIL/PASSWORD não definidos — pulei o save automático no Supabase.)")
    return false
  }

  const login = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json())

  if (!login.access_token) {
    throw new Error(`Falha ao logar no Supabase: ${JSON.stringify(login)}`)
  }

  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString()

  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/provider_tokens`, {
    method: "POST",
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${login.access_token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      provider: "kairogen",
      client_id: clientId,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!res.ok) {
    throw new Error(`Falha ao salvar no Supabase: ${res.status} ${await res.text()}`)
  }
  return true
}

async function main() {
  const env = loadEnvLocal()

  console.log("1/4 — Registrando client na Kairogen...")
  const client = await registerClient()
  console.log(`    client_id: ${client.client_id}`)

  console.log("2/4 — Iniciando device authorization...")
  const device = await startDeviceAuthorization(client.client_id)

  console.log("")
  console.log("=".repeat(60))
  console.log("ABRA ESTE LINK E APROVE O ACESSO:")
  console.log(device.verification_uri_complete ?? device.verification_uri)
  if (!device.verification_uri_complete) {
    console.log(`Código: ${device.user_code}`)
  }
  console.log("=".repeat(60))
  console.log("")
  console.log(`3/4 — Aguardando aprovação (expira em ${Math.round(device.expires_in / 60)} min)...`)

  const token = await pollToken(client.client_id, device.device_code, device.interval ?? 5, device.expires_in)

  console.log("4/4 — Aprovado! Salvando no Supabase (tabela provider_tokens)...")
  const saved = await saveToSupabase(env, client.client_id, token)

  if (!saved) {
    console.log("")
    console.log("Salve manualmente — rode isto no SQL Editor do Supabase:")
    console.log("")
    console.log(
      `insert into provider_tokens (provider, client_id, access_token, refresh_token, expires_at) values ('kairogen', '${client.client_id}', '${token.access_token}', '${token.refresh_token}', '${new Date(Date.now() + token.expires_in * 1000).toISOString()}') on conflict (provider) do update set client_id = excluded.client_id, access_token = excluded.access_token, refresh_token = excluded.refresh_token, expires_at = excluded.expires_at, updated_at = now();`
    )
  } else {
    console.log("Salvo com sucesso. Nada a fazer manualmente.")
  }
}

main().catch((err) => {
  console.error("ERRO:", err.message)
  process.exit(1)
})
