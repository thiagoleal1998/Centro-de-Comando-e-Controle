import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectForm } from "@/components/projects/project-form"
import { createProject } from "@/lib/actions/projects"

export default function NovoProjetoPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Novo projeto</h1>
        <p className="text-muted-foreground text-sm">
          Defina o essencial — você poderá ajustar tudo depois.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm action={createProject} submitLabel="Criar projeto" />
        </CardContent>
      </Card>
    </div>
  )
}
