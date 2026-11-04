import Link from "next/link"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChannelBadge, ProjectStatusBadge } from "@/components/projects/badges"
import { EmptyState } from "@/components/layout/empty-state"
import type { Project } from "@/types/domain"

export default async function ProjetosPage() {
  const supabase = await createClient()
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground text-sm">
            Campanhas e projetos criativos da Neuro Botics.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/projetos/novo" />}>
          <Plus /> Novo projeto
        </Button>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="text-destructive py-6 text-sm">
            Não foi possível carregar os projetos: {error.message}
          </CardContent>
        </Card>
      ) : !projects || projects.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            title="Nenhum projeto criado ainda."
            description="Crie o primeiro projeto para começar a organizar uma campanha."
            action={
              <Button nativeButton={false} render={<Link href="/projetos/novo" />} className="mt-2">
                <Plus /> Novo projeto
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(projects as Project[]).map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/projetos/${project.id}`}
                      className="hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ChannelBadge channel={project.channel} />
                  </TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={project.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(project.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
