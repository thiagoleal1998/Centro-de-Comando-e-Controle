import { createClient } from "@/lib/supabase/server"
import { ProviderNotConfiguredError } from "../errors"

const PROVIDER = "kairogen"
const TOKEN_ENDPOINT = "https://api.kairogen.ai/oauth/token"

/**
 * Retorna um access_token válido para a Kairogen, renovando via
 * refresh_token quando necessário. A Kairogen ROTACIONA o refresh_token a
 * cada renovação — o novo valor é sempre regravado na tabela
 * `provider_tokens`, nunca reaproveitamos um refresh_token já usado.
 */
export async function getKairogenAccessToken(): Promise<string> {
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("provider_tokens")
    .select("*")
    .eq("provider", PROVIDER)
    .maybeSingle()

  if (!row) {
    throw new ProviderNotConfiguredError(
      "Kairogen ainda não autenticado. Rode scripts/kairogen-device-auth.mjs."
    )
  }

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0
  const hasMargin = expiresAt - Date.now() > 60_000 // 1 min de folga

  if (row.access_token && hasMargin) {
    return row.access_token as string
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token as string,
      client_id: row.client_id as string,
    }),
  })
  const body = await res.json()

  if (!res.ok || body.error) {
    throw new Error(
      `Falha ao renovar token Kairogen: ${body.error_description ?? body.error ?? res.status}`
    )
  }

  const newExpiresAt = new Date(Date.now() + body.expires_in * 1000).toISOString()

  await supabase
    .from("provider_tokens")
    .update({
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", PROVIDER)

  return body.access_token as string
}
