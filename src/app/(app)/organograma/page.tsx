import { Card, CardContent } from "@/components/ui/card"
import { OrgChartNode } from "@/components/org-chart/org-chart-node"
import { ORG_CHART } from "@/lib/org-chart"
import { createClient } from "@/lib/supabase/server"
import type { OrgChartPhotoAdjustment } from "@/types/domain"

export default async function OrganogramaPage() {
  const supabase = await createClient()
  const { data } = await supabase.from("org_chart_photos").select("*")
  const adjustments: Record<string, OrgChartPhotoAdjustment> = Object.fromEntries(
    (data ?? []).map((row) => [row.person_key, row as OrgChartPhotoAdjustment])
  )

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Organograma</h1>
        <p className="text-muted-foreground text-sm">
          Estrutura organizacional da Neuro Botics (JT Group). Clique no lápis sobre uma foto
          para ajustar posição e zoom.
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto py-10">
          <div className="flex min-w-fit justify-center">
            <OrgChartNode node={ORG_CHART} adjustments={adjustments} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
