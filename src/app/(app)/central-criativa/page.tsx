import Link from "next/link"
import { Sparkles } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChannelBadge } from "@/components/projects/badges"
import { EmptyState } from "@/components/layout/empty-state"

export default async function CentralCriativaPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, channel")
    .order("created_at", { ascending: false })

  const { data: creatives } = await supabase.from("creatives").select("project_id")
  const countByProject = new Map<string, number>()
  for (const c of creatives ?? []) {
    countByProject.set(c.project_id, (countByProject.get(c.project_id) ?? 0) + 1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Central Criativa</h1>
        <p className="text-muted-foreground text-sm">
          Escolha um projeto para criar ou revisar criativos.
        </p>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            title="Você precisa de um projeto antes de criar criativos."
            action={
              <Button nativeButton={false} render={<Link href="/projetos/novo" />} className="mt-2">
                Criar projeto
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/central-criativa/${project.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="text-muted-foreground size-4" />
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <ChannelBadge channel={project.channel} />
                  <span className="text-muted-foreground text-sm">
                    {countByProject.get(project.id) ?? 0} criativo(s)
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
