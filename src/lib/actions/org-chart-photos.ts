"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { orgChartPhotoAdjustmentSchema } from "@/lib/validations/org-chart-photo"

export type OrgChartPhotoActionState = { error?: string } | undefined

export async function updateOrgChartPhotoAdjustment(
  _prevState: OrgChartPhotoActionState,
  formData: FormData
): Promise<OrgChartPhotoActionState> {
  const parsed = orgChartPhotoAdjustmentSchema.safeParse({
    personKey: formData.get("personKey"),
    positionX: formData.get("positionX"),
    positionY: formData.get("positionY"),
    zoom: formData.get("zoom"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." }
  }

  const { error } = await supabase.from("org_chart_photos").upsert(
    {
      person_key: parsed.data.personKey,
      position_x: parsed.data.positionX,
      position_y: parsed.data.positionY,
      zoom: parsed.data.zoom,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "person_key" }
  )

  if (error) {
    return { error: `Não foi possível salvar o ajuste: ${error.message}` }
  }

  revalidatePath("/organograma")
  return undefined
}

export async function resetOrgChartPhotoAdjustment(personKey: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("org_chart_photos").delete().eq("person_key", personKey)

  if (error) {
    throw new Error(`Não foi possível redefinir o ajuste: ${error.message}`)
  }

  revalidatePath("/organograma")
}
