import Link from "next/link"
import { ExternalLink, FileText } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/layout/empty-state"
import { getAssetPublicUrl } from "@/lib/supabase/storage"
import { DeleteDocumentButton } from "@/components/documents/delete-document-button"
import type { Document } from "@/types/domain"

export function DocumentList({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <Card className="border-dashed">
        <EmptyState
          title="Nenhum documento ainda."
          description="Envie um PDF ou adicione um link do Google Drive, OneDrive etc."
        />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => {
        const href = doc.kind === "file" ? getAssetPublicUrl(doc.storage_path!) : doc.url!
        return (
          <Card key={doc.id} className="flex-row items-center gap-3 px-4 py-3">
            {doc.kind === "file" ? (
              <FileText className="text-muted-foreground size-5 shrink-0" />
            ) : (
              <ExternalLink className="text-muted-foreground size-5 shrink-0" />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={href}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm font-medium hover:underline"
              >
                {doc.name}
              </Link>
              {doc.description ? (
                <p className="text-muted-foreground truncate text-xs">{doc.description}</p>
              ) : null}
            </div>
            <Badge variant="outline" className="shrink-0 font-normal">
              {doc.kind === "file" ? "Arquivo" : "Link"}
            </Badge>
            <DeleteDocumentButton documentId={doc.id} storagePath={doc.storage_path} />
          </Card>
        )
      })}
    </div>
  )
}
