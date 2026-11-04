import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function DashboardStatCard({
  icon: Icon,
  title,
  emptyMessage,
  href,
  linkLabel,
}: {
  icon: LucideIcon
  title: string
  emptyMessage: string
  href: string
  linkLabel: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="text-muted-foreground size-4" />
          {title}
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={href} />}>
            {linkLabel}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <CardDescription>{emptyMessage}</CardDescription>
      </CardContent>
    </Card>
  )
}
