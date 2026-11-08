import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatBrl } from "@/lib/format"
import { DeleteStrategyExpenseButton } from "@/components/strategy/delete-strategy-expense-button"
import type { StrategyPlan, StrategyPlanExpense } from "@/types/domain"

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : undefined}>
      <CardContent className="flex flex-col gap-1 py-4">
        <p className="text-muted-foreground text-xs leading-tight">{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}

export function StrategyPlanDashboard({
  plan,
  expenses,
}: {
  plan: StrategyPlan
  expenses: StrategyPlanExpense[]
}) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.monthly_amount, 0)
  const targetProfit = plan.target_profit ?? 0
  const requiredRevenue = totalExpenses + targetProfit

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Despesas mensais totais" value={formatBrl(totalExpenses)} />
        <Kpi
          label="Lucro desejado"
          value={plan.target_profit !== null ? formatBrl(plan.target_profit) : "—"}
        />
        <Kpi
          label="Faturamento necessário"
          value={formatBrl(requiredRevenue)}
          highlight
        />
      </div>

      <Card>
        <CardContent className="py-5">
          <p className="mb-3 text-sm font-semibold">Despesas mensais ({expenses.length})</p>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma despesa adicionada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Despesa</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead className="text-right">Valor mensal</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.name}</TableCell>
                    <TableCell className="text-muted-foreground">{e.notes ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBrl(e.monthly_amount)}
                    </TableCell>
                    <TableCell>
                      <DeleteStrategyExpenseButton planId={plan.id} expenseId={e.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
