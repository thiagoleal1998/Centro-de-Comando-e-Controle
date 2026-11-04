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

async function getAccessToken(clientId, refreshToken) {
  const res = await fetch("https://api.kairogen.ai/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  })
  const body = await res.json()
  if (!res.ok || body.error) throw new Error(`Falha ao renovar token: ${JSON.stringify(body)}`)
  return body.access_token
}

async function main() {
  const env = loadEnvLocal()
  const accessToken = await getAccessToken(env.KAIROGEN_CLIENT_ID, env.KAIROGEN_REFRESH_TOKEN)

  const transport = new StreamableHTTPClientTransport(new URL("https://mcp.kairogen.ai/mcp"), {
    requestInit: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const client = new Client({ name: "centro-de-comando", version: "0.1.0" })
  await client.connect(transport)

  const result = await client.callTool({ name: "get_credits", arguments: {} })
  console.log(JSON.stringify(result, null, 2))

  await client.close()
}

main().catch((err) => {
  console.error("ERRO:", err)
  process.exit(1)
})
