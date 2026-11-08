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
import { updateStrategyExpense, updateStrategyProfitSplit } from "@/lib/actions/strategy"
import { DeleteStrategyExpenseButton } from "@/components/strategy/delete-strategy-expense-button"
import { DeleteStrategyProfitSplitButton } from "@/components/strategy/delete-strategy-profit-split-button"
import { EditStrategyExpenseButton } from "@/components/strategy/edit-strategy-expense-button"
import { EditStrategyProfitSplitButton } from "@/components/strategy/edit-strategy-profit-split-button"
import type { StrategyPlan, StrategyPlanExpense, StrategyPlanProfitSplit } from "@/types/domain"

function Kpi({
  label,
  value,
  sublabel,
  highlight,
}: {
  label: string
  value: string
  sublabel?: string
  highlight?: boolean
}) {
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : undefined}>
      <CardContent className="flex flex-col gap-1 py-4">
        <p className="text-muted-foreground text-xs leading-tight">{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
        {sublabel ? <p className="text-muted-foreground text-xs">{sublabel}</p> : null}
      </CardContent>
    </Card>
  )
}

export function StrategyPlanDashboard({
  plan,
  expenses,
  profitSplits,
}: {
  plan: StrategyPlan
  expenses: StrategyPlanExpense[]
  profitSplits: StrategyPlanProfitSplit[]
}) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.monthly_amount, 0)
  const targetProfit = plan.target_profit ?? 0
  const hasMargin = plan.target_margin_pct !== null && plan.target_margin_pct > 0

  // Com rentabilidade informada: lucro LÍQUIDO = faturamento x rentabilidade
  // - despesas (as despesas listadas aqui são custos fixos fora da conta de
  // rentabilidade, ex.: assinaturas, contabilidade). Pra atingir o lucro
  // desejado de verdade (depois de pagar essas despesas), o faturamento
  // precisa cobrir lucro + despesas antes de dividir pela rentabilidade —
  // senão sobra menos que o lucro desejado depois de pagar as despesas.
  const requiredRevenue = hasMargin
    ? (targetProfit + totalExpenses) / (plan.target_margin_pct! / 100)
    : totalExpenses + targetProfit

  const totalSplitPct = profitSplits.reduce((sum, s) => sum + s.percentage, 0)

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Despesas mensais totais" value={formatBrl(totalExpenses)} />
        <Kpi
          label="Lucro desejado"
          value={plan.target_profit !== null ? formatBrl(plan.target_profit) : "—"}
        />
        <Kpi
          label="Rentabilidade"
          value={hasMargin ? `${plan.target_margin_pct!.toLocaleString("pt-BR")}%` : "—"}
        />
        <Kpi
          label="Faturamento necessário"
          value={formatBrl(requiredRevenue)}
          sublabel={
            hasMargin
              ? "(lucro + despesas) ÷ rentabilidade"
              : "despesas + lucro (sem rentabilidade)"
          }
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
                  <TableHead className="w-16" />
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
                      <div className="flex items-center justify-end gap-1">
                        <EditStrategyExpenseButton
                          expense={e}
                          action={updateStrategyExpense.bind(null, plan.id, e.id)}
                        />
                        <DeleteStrategyExpenseButton planId={plan.id} expenseId={e.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">Divisão do lucro ({profitSplits.length})</p>
            {profitSplits.length > 0 ? (
              <p className="text-muted-foreground text-xs">
                {totalSplitPct.toLocaleString("pt-BR")}% alocado
              </p>
            ) : null}
          </div>
          {profitSplits.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma divisão adicionada ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sócio / empresa</TableHead>
                  <TableHead className="text-right">Percentual</TableHead>
                  <TableHead className="text-right">Valor do lucro desejado</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitSplits.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {s.percentage.toLocaleString("pt-BR")}%
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatBrl((targetProfit * s.percentage) / 100)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <EditStrategyProfitSplitButton
                          split={s}
                          action={updateStrategyProfitSplit.bind(null, plan.id, s.id)}
                        />
                        <DeleteStrategyProfitSplitButton planId={plan.id} splitId={s.id} />
                      </div>
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
