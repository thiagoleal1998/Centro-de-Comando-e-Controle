"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "cn"
import type { OrgNode } from "@/lib/org-chart"
import type { OrgChartPhotoAdjustment } from "@/types/domain"
import { EditOrgPhotoButton } from "@/components/org-chart/edit-org-photo-button"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

type AdjustmentMap = Record<string, OrgChartPhotoAdjustment>

function OrgCard({
  node,
  isLeaf,
  adjustments,
}: {
  node: OrgNode
  isLeaf: boolean
  adjustments: AdjustmentMap
}) {
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
          {node.people.map((person) => {
            const adjustment = adjustments[person.key]
            const positionX = adjustment?.position_x ?? 50
            const positionY = adjustment?.position_y ?? 50
            const zoom = adjustment?.zoom ?? 100

            return (
              <div key={person.key} className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <Avatar size="sm">
                    {person.photo ? (
                      <AvatarImage
                        src={person.photo}
                        alt={person.name}
                        style={{
                          objectPosition: `${positionX}% ${positionY}%`,
                          transform: `scale(${zoom / 100})`,
                        }}
                      />
                    ) : null}
                    <AvatarFallback>{initials(person.name)}</AvatarFallback>
                  </Avatar>
                  {person.photo ? (
                    <EditOrgPhotoButton
                      personKey={person.key}
                      name={person.name}
                      photo={person.photo}
                      initial={{ positionX, positionY, zoom }}
                    />
                  ) : null}
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium">{person.name}</span>
                  <span className="text-muted-foreground text-xs">{person.role}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function OrgChartNode({
  node,
  adjustments,
}: {
  node: OrgNode
  adjustments: AdjustmentMap
}) {
  const children = node.children ?? []

  return (
    <div className="flex flex-col items-center">
      <OrgCard node={node} isLeaf={children.length === 0} adjustments={adjustments} />

      {children.length > 0 ? (
        <>
          <div className="bg-border h-6 w-px" />
          <div className="relative flex items-start gap-10 border-t px-5 pt-6">
            {children.map((child) => (
              <div key={child.title} className="relative flex flex-col items-center">
                <div className="bg-border absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2" />
                <OrgChartNode node={child} adjustments={adjustments} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
