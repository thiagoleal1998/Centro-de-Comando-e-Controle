import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Acessível sem login.
const PUBLIC_PATHS = ["/login", "/privacidade"]
// Dentre as públicas, essas mandam o usuário já logado para o dashboard
// (não faz sentido ver a tela de login estando logado; já /privacidade
// precisa ficar acessível também para quem está logado, e para o Google
// revisar a página sem autenticação).
const REDIRECT_IF_LOGGED_IN_PATHS = ["/login"]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )
  const shouldRedirectIfLoggedIn = REDIRECT_IF_LOGGED_IN_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (!user && !isPublicPath && request.nextUrl.pathname !== "/") {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (user && shouldRedirectIfLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
}
