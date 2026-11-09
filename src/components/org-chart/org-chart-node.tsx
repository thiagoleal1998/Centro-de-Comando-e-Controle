import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "cn"
import type { OrgNode } from "@/lib/org-chart"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function OrgCard({ node, isLeaf }: { node: OrgNode; isLeaf: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card px-5 py-4 shadow-sm",
        isLeaf ? "min-w-40 items-center text-center" : "min-w-56"
      )}
    >
      <p className="text-sm font-semibold tracking-tight">{node.title}</p>
      {node.people?.length ? (
        <div className={cn("flex flex-col gap-2.5", isLeaf && "items-center")}>
          {node.people.map((person) => (
            <div key={person.name} className="flex items-center gap-2.5">
              <Avatar size="sm">
                {person.photo ? <AvatarImage src={person.photo} alt={person.name} /> : null}
                <AvatarFallback>{initials(person.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{person.name}</span>
                <span className="text-muted-foreground text-xs">{person.role}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function OrgChartNode({ node }: { node: OrgNode }) {
  const children = node.children ?? []

  return (
    <div className="flex flex-col items-center">
      <OrgCard node={node} isLeaf={children.length === 0} />

      {children.length > 0 ? (
        <>
          <div className="bg-border h-6 w-px" />
          <div className="relative flex items-start gap-10 border-t px-5 pt-6">
            {children.map((child) => (
              <div key={child.title} className="relative flex flex-col items-center">
                <div className="bg-border absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2" />
                <OrgChartNode node={child} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
