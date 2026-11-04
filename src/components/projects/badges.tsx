import { Badge } from "@/components/ui/badge"
import { channelOptions, projectStatusOptions } from "@/lib/validations/project"
import type { ChannelType, ProjectStatus } from "@/types/domain"

export function ChannelBadge({ channel }: { channel: ChannelType }) {
  const label = channelOptions.find((o) => o.value === channel)?.label ?? channel
  return <Badge variant="outline">{label}</Badge>
}

const statusVariant: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  PAUSED: "secondary",
  ARCHIVED: "outline",
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const label = projectStatusOptions.find((o) => o.value === status)?.label ?? status
  return <Badge variant={statusVariant[status]}>{label}</Badge>
}
