import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { updateProject } from "@/lib/actions/projects"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectForm } from "@/components/projects/project-form"
import { DeleteProjectButton } from "@/components/projects/delete-project-button"
import type { Project } from "@/types/domain"

export default async function ProjetoDetalhePage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle()

  if (!project) {
    notFound()
  }

  const boundUpdate = updateProject.bind(null, (project as Project).id)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {(project as Project).name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Criado em{" "}
            {new Date((project as Project).created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <DeleteProjectButton projectId={(project as Project).id} />
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            action={boundUpdate}
            project={project as Project}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>
    </div>
  )
}
