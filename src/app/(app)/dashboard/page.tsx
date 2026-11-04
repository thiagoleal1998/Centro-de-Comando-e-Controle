import Link from "next/link"
import { Loader, Plus, Sparkles, Upload } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { DashboardStatCard } from "@/components/dashboard/status-card"
import { RecentProjectsCard } from "@/components/dashboard/recent-projects-card"
import { RecentAssetsCard } from "@/components/dashboard/recent-assets-card"
import { PendingApprovalCard } from "@/components/dashboard/pending-approval-card"
import { RecentErrorsCard } from "@/components/dashboard/recent-errors-card"
import { DashboardHero } from "@/components/dashboard/hero"

function greetingNameFromEmail(email: string | undefined | null) {
  const localPart = email?.split("@")[0]?.split(".")[0] ?? "por aí"
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHero greetingName={greetingNameFromEmail(user?.email)} />

      <div className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link href="/projetos/novo" />}>
          <Plus /> Novo projeto
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/central-criativa" />}>
          <Sparkles /> Criar criativo
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/produtos/novo" />}>
          <Upload /> Upload de produto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RecentProjectsCard />
        <DashboardStatCard
          icon={Sparkles}
          title="Criativos em produção"
          emptyMessage="Nenhum criativo em geração no momento."
          href="/central-criativa"
          linkLabel="Central Criativa"
        />
        <PendingApprovalCard />
        <RecentAssetsCard />
        <DashboardStatCard
          icon={Loader}
          title="Processamentos em andamento"
          emptyMessage="Nenhum processamento ativo."
          href="/central-criativa"
          linkLabel="Central Criativa"
        />
        <RecentErrorsCard />
      </div>
    </div>
  )
}
