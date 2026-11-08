import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createSalesEntry, updateSalesMonth } from "@/lib/actions/sales"
import { monthName } from "@/lib/validations/sales"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SalesEntryForm } from "@/components/sales/sales-entry-form"
import { SalesMonthForm } from "@/components/sales/sales-month-form"
import { SalesMonthDashboard } from "@/components/sales/sales-month-dashboard"
import { DeleteSalesMonthButton } from "@/components/sales/delete-sales-month-button"
import { Pencil } from "lucide-react"
import type { Product, SalesEntryWithProduct, SalesMonth } from "@/types/domain"

export const dynamic = "force-dynamic"

export default async function MesDeVendasPage({
  params,
}: {
  params: Promise<{ monthId: string }>
}) {
  const { monthId } = await params
  const supabase = await createClient()

  const { data: salesMonth } = await supabase
    .from("sales_months")
    .select("*")
    .eq("id", monthId)
    .maybeSingle()

  if (!salesMonth) {
    notFound()
  }

  const [{ data: entries }, { data: products }] = await Promise.all([
    supabase
      .from("sales_entries")
      .select("*, products(name)")
      .eq("month_id", monthId)
      .order("day", { ascending: true }),
    supabase.from("products").select("*").order("name", { ascending: true }),
  ])

  const month = salesMonth as SalesMonth
  const boundUpdate = updateSalesMonth.bind(null, month.id)
  const boundCreateEntry = createSalesEntry.bind(null, month.id)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {monthName(month.month)} / {month.year}
          </h1>
          <p className="text-muted-foreground text-sm">
            Lançamento manual de vendas — nativo do sistema, não vem do Google Sheets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm">
                  <Pencil /> Editar metas
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar {monthName(month.month)} / {month.year}</DialogTitle>
              </DialogHeader>
              <SalesMonthForm
                action={boundUpdate}
                salesMonth={month}
                submitLabel="Salvar alterações"
              />
            </DialogContent>
          </Dialog>
          <DeleteSalesMonthButton monthId={month.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lançar venda</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesEntryForm action={boundCreateEntry} products={(products as Product[]) ?? []} />
        </CardContent>
      </Card>

      <SalesMonthDashboard
        salesMonth={month}
        entries={(entries as SalesEntryWithProduct[]) ?? []}
      />
    </div>
  )
}
