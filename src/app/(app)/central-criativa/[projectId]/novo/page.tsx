import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NewCreativeForm } from "@/components/creative/new-creative-form"
import { createCreative } from "@/lib/actions/creatives"

export default async function NovoCriativoPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const boundCreate = createCreative.bind(null, projectId)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Criar criativo</h1>
        <p className="text-muted-foreground text-sm">
          Descreva o que você quer e a Central Criativa gera a primeira versão.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Briefing</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCreativeForm action={boundCreate} />
        </CardContent>
      </Card>
    </div>
  )
}
