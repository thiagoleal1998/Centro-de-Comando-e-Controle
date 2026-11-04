"use client"

import * as React from "react"
import { Check, ChevronsUpDown, TrendingDown, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import {
  PACTO_FULL_LABEL_FEE_PER_UNIT,
  PACTO_FULL_PARTICULAR_SHIPPING,
  SHIPPING_MODES,
  calculateViability,
  type ShippingMode,
} from "@/lib/viability"

export type ViabilityProductOption = {
  id: string
  label: string
  unitCost: number
}

function parseNumber(value: string): number {
  const normalized = value.replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function ViabilityCalculator({
  products,
}: {
  products: ViabilityProductOption[]
}) {
  const [productQuery, setProductQuery] = React.useState("")
  const [productOpen, setProductOpen] = React.useState(false)
  const [productLabel, setProductLabel] = React.useState("")

  const [shippingMode, setShippingMode] = React.useState<ShippingMode>("pacto_full")
  const [quantity, setQuantity] = React.useState(1)
  const [unitValue, setUnitValue] = React.useState(0)
  const [totalValue, setTotalValue] = React.useState(0)
  const [shippingCost, setShippingCost] = React.useState(PACTO_FULL_PARTICULAR_SHIPPING)
  const [hasLabelFee, setHasLabelFee] = React.useState(true)
  const [labelFee, setLabelFee] = React.useState(PACTO_FULL_LABEL_FEE_PER_UNIT)
  const [expectedSalePrice, setExpectedSalePrice] = React.useState(0)

  function handleSelectProduct(product: ViabilityProductOption) {
    setProductLabel(product.label)
    setUnitValue(product.unitCost)
    setTotalValue(product.unitCost * quantity)
    setProductOpen(false)
  }

  function handleUnitValueChange(value: string) {
    const parsed = parseNumber(value)
    setUnitValue(parsed)
    setTotalValue(parsed * quantity)
  }

  function handleTotalValueChange(value: string) {
    const parsed = parseNumber(value)
    setTotalValue(parsed)
    setUnitValue(quantity > 0 ? parsed / quantity : 0)
  }

  function handleQuantityChange(value: string) {
    const parsed = Math.max(0, Math.round(parseNumber(value)))
    setQuantity(parsed)
    setTotalValue(unitValue * parsed)
    if (shippingMode === "pacto_full" && parsed > 0) {
      setShippingCost(PACTO_FULL_PARTICULAR_SHIPPING / parsed)
    }
  }

  function handleShippingModeChange(mode: ShippingMode) {
    setShippingMode(mode)
    if (mode === "pacto_full") {
      setHasLabelFee(true)
      setLabelFee(PACTO_FULL_LABEL_FEE_PER_UNIT)
      setShippingCost(
        quantity > 0 ? PACTO_FULL_PARTICULAR_SHIPPING / quantity : PACTO_FULL_PARTICULAR_SHIPPING
      )
    }
  }

  const result = calculateViability({
    shippingMode,
    unitValue,
    totalValue,
    quantity,
    shippingCost,
    hasLabelFee,
    labelFee,
    expectedSalePrice,
  })

  const isProfitable = result.profitPerUnit >= 0

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do produto</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label>Produto (opcional — puxa do Radar/Análises)</Label>
            <Popover open={productOpen} onOpenChange={setProductOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">
                      {productLabel || "Buscar produto..."}
                    </span>
                    <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                  </Button>
                }
              />
              <PopoverContent className="w-(--anchor-width) p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Buscar produto..."
                    value={productQuery}
                    onValueChange={setProductQuery}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                    <CommandGroup>
                      {products.slice(0, 200).map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.label}
                          onSelect={() => handleSelectProduct(product)}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              productLabel === product.label ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{product.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Modalidade de envio</Label>
            <Select value={shippingMode} onValueChange={(v) => handleShippingModeChange(v as ShippingMode)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shippingMode === "pacto_full" ? (
              <p className="text-muted-foreground text-xs">
                Etiquetagem R$ 1,00/unidade + frete de envio particular R$ 160,00
                rateado pela quantidade — já preenchidos abaixo, edite se o
                envio for por coleta agendada ou outro valor. Se o transporte
                for dividido com outros agendamentos, você recebe 50% do frete
                como crédito para a próxima compra (não entra no cálculo abaixo,
                pois é um crédito futuro, não reembolsável).
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Quantidade</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Valor unitário (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={unitValue}
                onChange={(e) => handleUnitValueChange(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Valor total do produto (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={totalValue}
                onChange={(e) => handleTotalValueChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Valor do frete (R$, por unidade)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseNumber(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Valor previsto de venda (R$, por unidade)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={expectedSalePrice}
                onChange={(e) => setExpectedSalePrice(parseNumber(e.target.value))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="label-fee-switch" className="font-normal">
                Tem cobrança de etiqueta?
              </Label>
              <Switch
                id="label-fee-switch"
                checked={hasLabelFee}
                onCheckedChange={setHasLabelFee}
              />
            </div>
            {hasLabelFee ? (
              <div className="flex flex-col gap-1.5">
                <Label>Valor da etiqueta (R$, por unidade)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={labelFee}
                  onChange={(e) => setLabelFee(parseNumber(e.target.value))}
                  className="max-w-40"
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Rentabilidade</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border p-3",
              isProfitable
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-destructive/30 bg-destructive/10"
            )}
          >
            {isProfitable ? (
              <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="text-destructive size-5" />
            )}
            <div>
              <p className="text-2xl font-semibold tracking-tight">
                {result.marginPercent.toFixed(1)}%
              </p>
              <p className="text-muted-foreground text-xs">margem sobre a venda</p>
            </div>
          </div>

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Custo total / unidade</dt>
              <dd className="font-medium">{formatCurrency(result.totalCostPerUnit)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Lucro / unidade</dt>
              <dd className="font-medium">{formatCurrency(result.profitPerUnit)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Lucro total (lote)</dt>
              <dd className="font-medium">{formatCurrency(result.totalProfit)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
