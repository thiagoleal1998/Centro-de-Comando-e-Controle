export function parseBrNumber(value: string | undefined): number {
  if (!value) return 0
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

/** Rótulo compacto para eixos/tiles: 1.500 -> "1,5K", 0 -> "0". */
export function formatCompactNumber(value: number): string {
  if (value === 0) return "0"
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}K`
  }
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
}
