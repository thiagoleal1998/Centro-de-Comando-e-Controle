"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import { deleteAsset } from "@/lib/actions/assets"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteAssetButton({
  assetId,
  storagePath,
  productId,
}: {
  assetId: string
  storagePath: string
  productId: string | null
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="destructive"
            size="icon-sm"
            className="absolute top-1.5 right-1.5"
          >
            <Trash2 />
            <span className="sr-only">Excluir</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir este asset?</AlertDialogTitle>
          <AlertDialogDescription>
            O arquivo será removido do armazenamento e da biblioteca. Essa
            ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() =>
              startTransition(() => deleteAsset(assetId, storagePath, productId))
            }
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
