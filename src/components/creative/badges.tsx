import { Badge } from "@/components/ui/badge"
import { creativeStatusOptions, creativeTypeOptions } from "@/lib/validations/creative"
import type { CreativeStatus, CreativeType } from "@/types/domain"

export function CreativeTypeBadge({ type }: { type: CreativeType }) {
  const label = creativeTypeOptions.find((o) => o.value === type)?.label ?? type
  return <Badge variant="outline">{label}</Badge>
}

const statusVariant: Record<CreativeStatus, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "outline",
  GENERATING: "secondary",
  PREVIEW: "secondary",
  NEEDS_REVISION: "secondary",
  APPROVED: "default",
  EXPORTED: "default",
  FAILED: "destructive",
}

export function CreativeStatusBadge({ status }: { status: CreativeStatus }) {
  const label = creativeStatusOptions.find((o) => o.value === status)?.label ?? status
  return <Badge variant={statusVariant[status]}>{label}</Badge>
}
