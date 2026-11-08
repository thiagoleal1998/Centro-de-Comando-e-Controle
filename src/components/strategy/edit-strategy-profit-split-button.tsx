import { Pencil } from "lucide-react"

import type { ActionState } from "@/lib/actions/strategy"
import type { StrategyPlanProfitSplit } from "@/types/domain"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { StrategyProfitSplitForm } from "@/components/strategy/strategy-profit-split-form"

export function EditStrategyProfitSplitButton({
  split,
  action,
}: {
  split: StrategyPlanProfitSplit
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
          <DialogTitle>Editar divisão</DialogTitle>
        </DialogHeader>
        <StrategyProfitSplitForm
          action={action}
          split={split}
          idPrefix={`edit-split-${split.id}-`}
          submitLabel="Salvar"
        />
      </DialogContent>
    </Dialog>
  )
}
