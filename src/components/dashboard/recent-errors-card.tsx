import { AlertTriangle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export async function RecentErrorsCard() {
  const supabase = await createClient()
  const { data: jobs } = await supabase
    .from("generation_jobs")
    .select("id, error_message, created_at")
    .eq("status", "FAILED")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="text-muted-foreground size-4" />
          Erros recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!jobs || jobs.length === 0 ? (
          <CardDescription>Nenhum erro registrado.</CardDescription>
        ) : (
          <ul className="flex flex-col gap-2">
            {jobs.map((job) => (
              <li key={job.id} className="text-muted-foreground truncate text-xs">
                {job.error_message}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
