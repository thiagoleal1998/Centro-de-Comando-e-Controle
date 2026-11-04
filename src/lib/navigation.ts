import {
  LayoutDashboard,
  FolderKanban,
  Images,
  Package,
  Radar,
  Network,
  Settings,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  disabled?: boolean
  description: string
}

export const mainNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Visão geral do Centro de Comando.",
  },
  {
    title: "Projetos",
    href: "/projetos",
    icon: FolderKanban,
    description: "Campanhas e projetos criativos.",
  },
  {
    title: "Assets",
    href: "/assets",
    icon: Images,
    description: "Biblioteca central de imagens, vídeos e referências.",
  },
  {
    title: "Produtos",
    href: "/produtos",
    icon: Package,
    description: "Cadastro de produtos e informações de briefing.",
  },
  {
    title: "Análise de Produtos",
    href: "/analise-produtos",
    icon: Radar,
    description: "Esteira de mineração e validação de produtos (planilha JT).",
  },
  {
    title: "Organograma",
    href: "/organograma",
    icon: Network,
    description: "Estrutura organizacional da Neuro Botics.",
  },
]

export const footerNav: NavItem[] = [
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Integrações, providers de IA e preferências.",
  },
]
