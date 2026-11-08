import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/layout/empty-state"
import { monthName } from "@/lib/validations/sales"
import type { SalesMonth } from "@/types/domain"

export function SalesMonthsList({ months }: { months: SalesMonth[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button nativeButton={false} render={<Link href="/vendas/lancamentos/novo" />}>
          <Plus /> Novo mês
        </Button>
      </div>

      {months.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            title="Nenhum mês lançado ainda."
            description="Cadastre um mês e comece a lançar as vendas diárias de cada produto."
            action={
              <Button
                nativeButton={false}
                render={<Link href="/vendas/lancamentos/novo" />}
                className="mt-2"
              >
                <Plus /> Novo mês
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {months.map((m) => (
            <Link key={m.id} href={`/vendas/lancamentos/${m.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="py-5">
                  <p className="font-medium">
                    {monthName(m.month)} / {m.year}
                  </p>
                  {m.meta_faturamento !== null ? (
                    <p className="text-muted-foreground text-sm">
                      Meta: {m.meta_faturamento.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
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
