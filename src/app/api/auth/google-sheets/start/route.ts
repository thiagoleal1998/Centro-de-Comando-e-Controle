import { NextResponse } from "next/server"

const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly"

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_SHEETS_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_SHEETS_CLIENT_ID não configurado." },
      { status: 500 }
    )
  }

  const redirectUri = new URL("/api/auth/google-sheets/callback", request.url).toString()

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", SCOPE)
  // offline + consent: garante que o Google devolve um refresh_token mesmo
  // se este app já foi autorizado antes.
  url.searchParams.set("access_type", "offline")
  url.searchParams.set("prompt", "consent")

  return NextResponse.redirect(url)
}
