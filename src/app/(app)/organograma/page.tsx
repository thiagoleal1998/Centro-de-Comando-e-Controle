import { Card, CardContent } from "@/components/ui/card"
import { OrgChartNode } from "@/components/org-chart/org-chart-node"
import { ORG_CHART } from "@/lib/org-chart"

export default function OrganogramaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Organograma</h1>
        <p className="text-muted-foreground text-sm">
          Estrutura organizacional da Neuro Botics (JT Group).
        </p>
      </div>

      <Card>
        <CardContent className="overflow-x-auto py-10">
          <div className="flex min-w-fit justify-center">
            <OrgChartNode node={ORG_CHART} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
