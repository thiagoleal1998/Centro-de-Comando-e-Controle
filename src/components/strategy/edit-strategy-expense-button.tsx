import { Pencil } from "lucide-react"

import type { ActionState } from "@/lib/actions/strategy"
import type { StrategyPlanExpense } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StrategyExpenseForm } from "@/components/strategy/strategy-expense-form"

export function EditStrategyExpenseButton({
  expense,
  action,
}: {
  expense: StrategyPlanExpense
  action: (state: ActionState, formData: FormData) => Promise<ActionState>
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Pencil className="text-muted-foreground" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar despesa</DialogTitle>
        </DialogHeader>
        <StrategyExpenseForm
          action={action}
          expense={expense}
          idPrefix={`edit-expense-${expense.id}-`}
          submitLabel="Salvar"
        />
      </DialogContent>
    </Dialog>
  )
}
