"use client"

import { useActionState, useState } from "react"
import { Loader2, Pencil, RotateCcw } from "lucide-react"

import {
  resetOrgChartPhotoAdjustment,
  updateOrgChartPhotoAdjustment,
  type OrgChartPhotoActionState,
} from "@/lib/actions/org-chart-photos"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

const DEFAULT_ADJUSTMENT = { positionX: 50, positionY: 50, zoom: 100 }

export function EditOrgPhotoButton({
  personKey,
  name,
  photo,
  initial,
}: {
  personKey: string
  name: string
  photo: string
  initial: { positionX: number; positionY: number; zoom: number }
}) {
  const [positionX, setPositionX] = useState(initial.positionX)
  const [positionY, setPositionY] = useState(initial.positionY)
  const [zoom, setZoom] = useState(initial.zoom)
  const [state, formAction, pending] = useActionState<OrgChartPhotoActionState, FormData>(
    updateOrgChartPhotoAdjustment,
    undefined
  )

  function handleSubmit(formData: FormData) {
    formData.set("personKey", personKey)
    formData.set("positionX", String(positionX))
    formData.set("positionY", String(positionY))
    formData.set("zoom", String(zoom))
    formAction(formData)
  }

  function handleReset() {
    setPositionX(DEFAULT_ADJUSTMENT.positionX)
    setPositionY(DEFAULT_ADJUSTMENT.positionY)
    setZoom(DEFAULT_ADJUSTMENT.zoom)
    resetOrgChartPhotoAdjustment(personKey)
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="bg-background absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border shadow-sm"
            aria-label={`Ajustar foto de ${name}`}
          >
            <Pencil className="size-3" />
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar foto — {name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5">
          <div className="border-border size-40 overflow-hidden rounded-full border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={name}
              className="size-full object-cover"
              style={{
                objectPosition: `${positionX}% ${positionY}%`,
                transform: `scale(${zoom / 100})`,
              }}
            />
          </div>

          <form action={handleSubmit} className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Posição horizontal</Label>
              <Slider
                min={0}
                max={100}
                value={positionX}
                onValueChange={(value) => setPositionX(value as number)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Posição vertical</Label>
              <Slider
                min={0}
                max={100}
                value={positionY}
                onValueChange={(value) => setPositionY(value as number)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Zoom</Label>
              <Slider
                min={100}
                max={220}
                value={zoom}
                onValueChange={(value) => setZoom(value as number)}
              />
            </div>

            {state?.error ? <p className="text-destructive text-sm">{state.error}</p> : null}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleReset}>
                <RotateCcw />
                Redefinir
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
