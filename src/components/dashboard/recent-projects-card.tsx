import Link from "next/link"
import { FolderKanban } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChannelBadge } from "@/components/projects/badges"
import { createClient } from "@/lib/supabase/server"
import type { Project } from "@/types/domain"

export async function RecentProjectsCard() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, channel, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <FolderKanban className="text-muted-foreground size-4" />
          Projetos recentes
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/projetos" />}>
            Ver projetos
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {!projects || projects.length === 0 ? (
          <CardDescription>Nenhum projeto criado ainda.</CardDescription>
        ) : (
          <ul className="flex flex-col gap-2">
            {(projects as Pick<Project, "id" | "name" | "channel" | "created_at">[]).map(
              (project) => (
                <li key={project.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/projetos/${project.id}`}
                    className="truncate text-sm hover:underline"
                  >
                    {project.name}
                  </Link>
                  <ChannelBadge channel={project.channel} />
                </li>
              )
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
