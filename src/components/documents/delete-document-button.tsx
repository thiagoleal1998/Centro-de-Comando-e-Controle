"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import { deleteDocument } from "@/lib/actions/documents"
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

export function DeleteDocumentButton({
  documentId,
  storagePath,
}: {
  documentId: string
  storagePath: string | null
}) {
  const [pending, startTransition] = React.useTransition()

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Trash2 className="text-muted-foreground" />
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir este documento?</AlertDialogTitle>
          <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={() => startTransition(() => deleteDocument(documentId, storagePath))}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
