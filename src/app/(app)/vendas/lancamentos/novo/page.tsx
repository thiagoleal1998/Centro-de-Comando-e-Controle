import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesMonthForm } from "@/components/sales/sales-month-form"
import { createSalesMonth } from "@/lib/actions/sales"

export default function NovoMesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Novo mês</h1>
        <p className="text-muted-foreground text-sm">
          Depois de criar, você poderá lançar as vendas diárias de cada produto.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Dados do mês</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesMonthForm action={createSalesMonth} submitLabel="Criar mês" />
        </CardContent>
      </Card>
    </div>
  )
}
