import Image from "next/image"

export function DashboardHero({ greetingName }: { greetingName: string }) {
  return (
    <div className="from-primary/15 via-primary/5 relative overflow-hidden rounded-xl border bg-gradient-to-br to-transparent p-6">
      <div className="flex items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-white shadow-sm">
          <Image
            src="/brand/neuro-mascot.png"
            alt="Neuro"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Olá, {greetingName}
          </h1>
          <p className="text-muted-foreground text-sm">
            Aqui está o que está acontecendo no Centro de Comando hoje.
          </p>
        </div>
      </div>
    </div>
  )
}
