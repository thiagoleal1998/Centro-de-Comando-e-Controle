import { createClient } from "@/lib/supabase/server"

const PROVIDER = "google_sheets"
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

/**
 * Retorna um access_token válido para a Google Sheets API, renovando via
 * refresh_token quando necessário. O refresh_token fica em `provider_tokens`
 * (mesma tabela usada pela Kairogen) — não em .env.local, para poder ser
 * reescrito pelo próprio app quando o Google rotacionar o token.
 */
export async function getGoogleSheetsAccessToken(): Promise<string> {
  const supabase = await createClient()

  const { data: row } = await supabase
    .from("provider_tokens")
    .select("*")
    .eq("provider", PROVIDER)
    .maybeSingle()

  if (!row) {
    throw new Error(
      "Google Sheets ainda não autenticado. Rode scripts/google-sheets-device-auth.mjs."
    )
  }

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0
  const hasMargin = expiresAt - Date.now() > 60_000

  if (row.access_token && hasMargin) {
    return row.access_token as string
  }

  const clientId = process.env.GOOGLE_SHEETS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_SHEETS_CLIENT_ID / GOOGLE_SHEETS_CLIENT_SECRET não configurados."
    )
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token as string,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  const body = await res.json()

  if (!res.ok || body.error) {
    throw new Error(
      `Falha ao renovar token do Google Sheets: ${body.error_description ?? body.error ?? res.status}`
    )
  }

  const newExpiresAt = new Date(Date.now() + body.expires_in * 1000).toISOString()

  await supabase
    .from("provider_tokens")
    .update({
      access_token: body.access_token,
      // O Google normalmente NÃO rotaciona o refresh_token no grant
      // refresh_token (ao contrário da Kairogen) — só regrava se vier um novo.
      ...(body.refresh_token ? { refresh_token: body.refresh_token } : {}),
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", PROVIDER)

  return body.access_token as string
}
