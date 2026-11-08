"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { salesEntrySchema, salesMonthSchema } from "@/lib/validations/sales"

export type ActionState = { error?: string } | undefined

function toNumberOrNull(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function createSalesMonth(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = salesMonthSchema.safeParse({
    year: formData.get("year"),
    month: formData.get("month"),
    metaFaturamento: formData.get("metaFaturamento"),
    superMetaFaturamento: formData.get("superMetaFaturamento"),
    despesasPrevistas: formData.get("despesasPrevistas"),
    margemPrevistaPct: formData.get("margemPrevistaPct"),
    notes: formData.get("notes"),
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

  const { data, error } = await supabase
    .from("sales_months")
    .insert({
      year: parsed.data.year,
      month: parsed.data.month,
      meta_faturamento: toNumberOrNull(parsed.data.metaFaturamento),
      super_meta_faturamento: toNumberOrNull(parsed.data.superMetaFaturamento),
      despesas_previstas: toNumberOrNull(parsed.data.despesasPrevistas),
      margem_prevista_pct: toNumberOrNull(parsed.data.margemPrevistaPct),
      notes: parsed.data.notes || null,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error) {
    const message = error.code === "23505" ? "Esse mês já foi cadastrado." : error.message
    return { error: `Não foi possível criar o mês: ${message}` }
  }

  revalidatePath("/vendas")
  redirect(`/vendas/lancamentos/${data.id}`)
}

export async function updateSalesMonth(
  monthId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = salesMonthSchema.safeParse({
    year: formData.get("year"),
    month: formData.get("month"),
    metaFaturamento: formData.get("metaFaturamento"),
    superMetaFaturamento: formData.get("superMetaFaturamento"),
    despesasPrevistas: formData.get("despesasPrevistas"),
    margemPrevistaPct: formData.get("margemPrevistaPct"),
    notes: formData.get("notes"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("sales_months")
    .update({
      year: parsed.data.year,
      month: parsed.data.month,
      meta_faturamento: toNumberOrNull(parsed.data.metaFaturamento),
      super_meta_faturamento: toNumberOrNull(parsed.data.superMetaFaturamento),
      despesas_previstas: toNumberOrNull(parsed.data.despesasPrevistas),
      margem_prevista_pct: toNumberOrNull(parsed.data.margemPrevistaPct),
      notes: parsed.data.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", monthId)

  if (error) {
    return { error: `Não foi possível salvar: ${error.message}` }
  }

  revalidatePath("/vendas")
  revalidatePath(`/vendas/lancamentos/${monthId}`)
  return { error: undefined }
}

export async function deleteSalesMonth(monthId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("sales_months").delete().eq("id", monthId)

  if (error) {
    throw new Error(`Não foi possível excluir o mês: ${error.message}`)
  }

  revalidatePath("/vendas")
  redirect("/vendas")
}

export async function createSalesEntry(
  monthId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = salesEntrySchema.safeParse({
    productId: formData.get("productId"),
    day: formData.get("day"),
    units: formData.get("units"),
    revenue: formData.get("revenue"),
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

  const { error } = await supabase.from("sales_entries").upsert(
    {
      month_id: monthId,
      product_id: parsed.data.productId,
      day: parsed.data.day,
      units: parsed.data.units,
      revenue: parsed.data.revenue,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "month_id,product_id,day" }
  )

  if (error) {
    return { error: `Não foi possível lançar a venda: ${error.message}` }
  }

  revalidatePath(`/vendas/lancamentos/${monthId}`)
  return { error: undefined }
}

export async function deleteSalesEntry(monthId: string, entryId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("sales_entries").delete().eq("id", entryId)

  if (error) {
    throw new Error(`Não foi possível excluir o lançamento: ${error.message}`)
  }

  revalidatePath(`/vendas/lancamentos/${monthId}`)
}
