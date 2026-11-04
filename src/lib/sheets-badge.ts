export type BadgeTone = "default" | "secondary" | "outline" | "destructive"

const POSITIVE = /aprovad|comprar|forte|fecha\b|passa\b/i
const WARNING = /observ|apert|pendente|amarelo/i
const NEGATIVE = /descart|reprov|n[ãa]o fecha|vermelho|cr[íi]tico/i
const NEUTRAL = /incompleto|aguardar|n[ãa]o contatado|n[ãa]o iniciado/i

export function statusTone(value: string): BadgeTone {
  if (NEGATIVE.test(value)) return "destructive"
  if (POSITIVE.test(value)) return "default"
  if (WARNING.test(value)) return "secondary"
  if (NEUTRAL.test(value)) return "outline"
  return "outline"
}

// A planilha só guarda a data (sem hora) — tratamos como meia-noite do dia
// informado. Aceita tanto "YYYY-MM-DD" quanto "DD/MM/YYYY".
export function parseSheetDate(value: string | undefined): Date | null {
  if (!value) return null
  const trimmed = value.trim()

  let match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const [, y, m, d] = match
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (match) {
    const [, d, m, y] = match
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  return null
}

/**
 * "Novo" por ~24h a partir da data informada. Como a planilha só guarda o
 * dia (sem hora), comparamos por dia civil em vez de milissegundos exatos:
 * conta como "novo" se a data for hoje OU ontem — isso garante que um
 * produto capturado a qualquer hora de ontem ainda apareça como novo hoje
 * (se comparássemos a partir da meia-noite exata, um produto capturado às
 * 23h de ontem perderia a tag minutos depois).
 */
export function isWithinHours(dateStr: string | undefined, hoursWindow = 24): boolean {
  const date = parseSheetDate(dateStr)
  if (!date) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000))
  const maxDays = Math.ceil(hoursWindow / 24)

  return diffDays >= 0 && diffDays <= maxDays
}
