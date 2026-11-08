"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { strategyExpenseSchema, strategyPlanSchema } from "@/lib/validations/strategy"

export type ActionState = { error?: string } | undefined

function toNumberOrNull(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export async function createStrategyPlan(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = strategyPlanSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    targetProfit: formData.get("targetProfit"),
    targetMarginPct: formData.get("targetMarginPct"),
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
    .from("strategy_plans")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description || null,
      target_profit: toNumberOrNull(parsed.data.targetProfit),
      target_margin_pct: toNumberOrNull(parsed.data.targetMarginPct),
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error) {
    return { error: `Não foi possível criar o plano: ${error.message}` }
  }

  revalidatePath("/estrategia")
  redirect(`/estrategia/planos/${data.id}`)
}

export async function updateStrategyPlan(
  planId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = strategyPlanSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    targetProfit: formData.get("targetProfit"),
    targetMarginPct: formData.get("targetMarginPct"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("strategy_plans")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      target_profit: toNumberOrNull(parsed.data.targetProfit),
      target_margin_pct: toNumberOrNull(parsed.data.targetMarginPct),
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId)

  if (error) {
    return { error: `Não foi possível salvar: ${error.message}` }
  }

  revalidatePath("/estrategia")
  revalidatePath(`/estrategia/planos/${planId}`)
  return { error: undefined }
}

export async function deleteStrategyPlan(planId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("strategy_plans").delete().eq("id", planId)

  if (error) {
    throw new Error(`Não foi possível excluir o plano: ${error.message}`)
  }

  revalidatePath("/estrategia")
  redirect("/estrategia")
}

export async function createStrategyExpense(
  planId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = strategyExpenseSchema.safeParse({
    name: formData.get("name"),
    monthlyAmount: formData.get("monthlyAmount"),
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

  const { error } = await supabase.from("strategy_plan_expenses").insert({
    plan_id: planId,
    name: parsed.data.name,
    monthly_amount: parsed.data.monthlyAmount,
    notes: parsed.data.notes || null,
    created_by: user.id,
  })

  if (error) {
    return { error: `Não foi possível adicionar a despesa: ${error.message}` }
  }

  revalidatePath(`/estrategia/planos/${planId}`)
  return { error: undefined }
}

export async function deleteStrategyExpense(planId: string, expenseId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("strategy_plan_expenses")
    .delete()
    .eq("id", expenseId)

  if (error) {
    throw new Error(`Não foi possível excluir a despesa: ${error.message}`)
  }

  revalidatePath(`/estrategia/planos/${planId}`)
}
