import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Cliente com service role: ignora RLS. NUNCA importar em código que
// roda no browser. Uso restrito ao worker de jobs e operações admin.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Defina em .env.local (Project Settings > API no Supabase)."
    )
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
