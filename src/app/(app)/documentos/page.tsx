import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"
import { DocumentLinkForm } from "@/components/documents/document-link-form"
import { DocumentList } from "@/components/documents/document-list"
import type { Document } from "@/types/domain"

export const dynamic = "force-dynamic"

export default async function DocumentosPage() {
  const supabase = await createClient()
  const { data: documents, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Documentos</h1>
        <p className="text-muted-foreground text-sm">
          PDFs e links (Google Drive, OneDrive etc.) da operação.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enviar arquivo</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Adicionar link</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentLinkForm />
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="text-destructive py-6 text-sm">
            Não foi possível carregar os documentos: {error.message}
          </CardContent>
        </Card>
      ) : (
        <DocumentList documents={(documents as Document[]) ?? []} />
      )}
    </div>
  )
}
