"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { UserMenu } from "@/components/layout/user-menu"
import { footerNav, mainNav } from "@/lib/navigation"

export function SiteHeader({ userEmail }: { userEmail: string }) {
  const pathname = usePathname()
  const current = [...mainNav, ...footerNav].find((item) =>
    pathname.startsWith(item.href)
  )

  return (
    <header className="bg-background/95 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b backdrop-blur">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-sm font-medium">{current?.title ?? "Centro de Comando"}</h2>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <UserMenu email={userEmail} />
        </div>
      </div>
    </header>
  )
}
