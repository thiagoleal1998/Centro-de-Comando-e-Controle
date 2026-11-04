import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { readFileSync } from "node:fs"

function loadEnvLocal() {
  const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8")
  const env = {}
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) env[match[1]] = match[2]
  }
  return env
}

async function supabaseLogin(env) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.argv[2], password: process.argv[3] }),
  })
  return res.json()
}

async function getRow(env, accessToken) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/provider_tokens?provider=eq.kairogen&select=*`,
    { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` } }
  )
  const rows = await res.json()
  return rows[0]
}

async function getKairogenAccessToken(row) {
  const res = await fetch("https://api.kairogen.ai/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
      client_id: row.client_id,
    }),
  })
  const body = await res.json()
  if (!res.ok || body.error) throw new Error(JSON.stringify(body))
  return body
}

async function main() {
  const env = loadEnvLocal()
  const login = await supabaseLogin(env)
  const row = await getRow(env, login.access_token)
  const token = await getKairogenAccessToken(row)

  // Persiste o novo refresh_token já rotacionado, pra não invalidar o nosso.
  await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/provider_tokens?provider=eq.kairogen`, {
    method: "PATCH",
    headers: {
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${login.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
    }),
  })

  const transport = new StreamableHTTPClientTransport(new URL("https://mcp.kairogen.ai/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${token.access_token}` } },
  })
  const client = new Client({ name: "centro-de-comando", version: "0.1.0" })
  await client.connect(transport)

  console.log("--- get_credits ---")
  const credits = await client.callTool({ name: "get_credits", arguments: {} })
  console.log(JSON.stringify(credits, null, 2))

  console.log("")
  console.log("--- estimate_cost (seedream-v4, 1x, 1024x1024) ---")
  const estimate = await client.callTool({
    name: "estimate_cost",
    arguments: { model: "seedream-v4", quantity: 1, size: "1024x1024", plan_key: "free" },
  })
  console.log(JSON.stringify(estimate, null, 2))

  await client.close()
}

main().catch((err) => {
  console.error("ERRO:", err)
  process.exit(1)
})
