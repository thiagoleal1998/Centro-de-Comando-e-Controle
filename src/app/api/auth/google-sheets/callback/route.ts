import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  if (error) {
    return new NextResponse(`Autorização cancelada: ${error}`, { status: 400 })
  }
  if (!code) {
    return new NextResponse("Código de autorização ausente.", { status: 400 })
  }

  const clientId = process.env.GOOGLE_SHEETS_CLIENT_ID
  const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return new NextResponse(
      "GOOGLE_SHEETS_CLIENT_ID / GOOGLE_SHEETS_CLIENT_SECRET não configurados.",
      { status: 500 }
    )
  }

  const redirectUri = new URL("/api/auth/google-sheets/callback", request.url).toString()

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })
  const token = await tokenRes.json()

  if (!tokenRes.ok || token.error) {
    return new NextResponse(
      `Falha ao trocar código por token: ${JSON.stringify(token)}`,
      { status: 500 }
    )
  }

  if (!token.refresh_token) {
    return new NextResponse(
      "O Google não retornou um refresh_token (provavelmente este app já tinha sido autorizado antes). Revogue o acesso em https://myaccount.google.com/permissions e tente de novo.",
      { status: 500 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse(
      "Sessão expirada — faça login no Centro de Comando e tente de novo.",
      { status: 401 }
    )
  }

  const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString()

  const { error: dbError } = await supabase.from("provider_tokens").upsert({
    provider: "google_sheets",
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  })

  if (dbError) {
    return new NextResponse(`Falha ao salvar o token: ${dbError.message}`, {
      status: 500,
    })
  }

  return NextResponse.redirect(new URL("/analise-produtos", request.url))
}
