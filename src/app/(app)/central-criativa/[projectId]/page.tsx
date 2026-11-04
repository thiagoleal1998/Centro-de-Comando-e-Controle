import Link from "next/link"
import { notFound } from "next/navigation"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreativeStatusBadge, CreativeTypeBadge } from "@/components/creative/badges"
import { EmptyState } from "@/components/layout/empty-state"
import type { Creative } from "@/types/domain"

export default async function ProjectCreativesPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .maybeSingle()

  if (!project) {
    notFound()
  }

  const { data: creatives } = await supabase
    .from("creatives")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Link href="/central-criativa" className="text-muted-foreground text-xs hover:underline">
            Central Criativa
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        </div>
        <Button nativeButton={false} render={<Link href={`/central-criativa/${projectId}/novo`} />}>
          <Plus /> Criar criativo
        </Button>
      </div>

      {!creatives || creatives.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            title="Nenhum criativo neste projeto ainda."
            action={
              <Button
                nativeButton={false}
                render={<Link href={`/central-criativa/${projectId}/novo`} />}
                className="mt-2"
              >
                <Plus /> Criar criativo
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(creatives as Creative[]).map((creative) => (
            <Link
              key={creative.id}
              href={`/central-criativa/${projectId}/criativo/${creative.id}`}
            >
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-sm font-medium">
                    <CreativeTypeBadge type={creative.type} />
                    <CreativeStatusBadge status={creative.status} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {creative.briefing.instruction || "Sem briefing."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
