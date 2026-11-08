import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/layout/empty-state"
import { formatBrl } from "@/lib/format"
import type { StrategyPlan } from "@/types/domain"

export function StrategyPlansList({ plans }: { plans: StrategyPlan[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button nativeButton={false} render={<Link href="/estrategia/planos/novo" />}>
          <Plus /> Novo plano
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            title="Nenhum plano criado ainda."
            description="Crie um plano para projetar despesas mensais e o faturamento necessário — por exemplo, a transição de MEI para Simples Nacional."
            action={
              <Button
                nativeButton={false}
                render={<Link href="/estrategia/planos/novo" />}
                className="mt-2"
              >
                <Plus /> Novo plano
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <Link key={p.id} href={`/estrategia/planos/${p.id}`}>
              <Card className="hover:bg-muted/50 h-full transition-colors">
                <CardContent className="flex flex-col gap-1 py-5">
                  <p className="font-medium">{p.name}</p>
                  {p.description ? (
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {p.description}
                    </p>
                  ) : null}
                  {p.target_profit !== null ? (
                    <p className="text-muted-foreground text-sm">
                      Lucro desejado: {formatBrl(p.target_profit)}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
