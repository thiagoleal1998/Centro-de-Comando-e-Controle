export const SHIPPING_MODES = [
  { value: "pacto_full", label: "Pacto Full" },
  { value: "correios", label: "Correios" },
  { value: "transportadora", label: "Transportadora" },
] as const

export type ShippingMode = (typeof SHIPPING_MODES)[number]["value"]

export type ViabilityInput = {
  shippingMode: ShippingMode
  unitValue: number
  totalValue: number
  quantity: number
  shippingCost: number
  hasLabelFee: boolean
  labelFee: number
  expectedSalePrice: number
}

export type ViabilityResult = {
  totalCostPerUnit: number
  profitPerUnit: number
  marginPercent: number
  totalProfit: number
}

// Regras da Pacto FULL (serviço de preparação da Pacto Distribuidora para
// envio ao CD do Mercado Livre — exclusivo mentorados Pronix, sem volume
// mínimo). Cobrança: etiquetagem por unidade + frete fixo por envio
// particular, rateado pela quantidade do lote.
export const PACTO_FULL_LABEL_FEE_PER_UNIT = 1
export const PACTO_FULL_PARTICULAR_SHIPPING = 160

/**
 * Cálculo de viabilidade. Correios/Transportadora ainda usam a fórmula
 * genérica (o usuário informa frete e etiqueta manualmente); a Pacto Full
 * tem valores sugeridos automaticamente na UI (ver ViabilityCalculator),
 * mas a soma final é a mesma para as três modalidades.
 */
export function calculateViability(input: ViabilityInput): ViabilityResult {
  const labelCost = input.hasLabelFee ? input.labelFee : 0
  const totalCostPerUnit = input.unitValue + input.shippingCost + labelCost
  const profitPerUnit = input.expectedSalePrice - totalCostPerUnit
  const marginPercent =
    input.expectedSalePrice > 0 ? (profitPerUnit / input.expectedSalePrice) * 100 : 0
  const totalProfit = profitPerUnit * input.quantity

  return { totalCostPerUnit, profitPerUnit, marginPercent, totalProfit }
}
