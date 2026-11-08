import {
  LayoutDashboard,
  FolderKanban,
  Images,
  Package,
  Radar,
  Network,
  Target,
  ShoppingCart,
  Briefcase,
  Wallet,
  Users,
  FileText,
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
    title: "Estratégia",
    href: "/estrategia",
    icon: Target,
    description: "Projeção de crescimento e metas (planilha JT).",
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
    title: "Documentos",
    href: "/documentos",
    icon: FileText,
    description: "PDFs e links (Google Drive, OneDrive etc.) da operação.",
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
    title: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
    description: "Vendas brutas, produtos, promotores e detalhe mensal (planilha JT).",
  },
  {
    title: "Organograma",
    href: "/organograma",
    icon: Network,
    description: "Estrutura organizacional da Neuro Botics.",
  },
  {
    title: "Administrativo",
    href: "/administrativo",
    icon: Briefcase,
    description: "Área administrativa da operação.",
  },
  {
    title: "Financeira",
    href: "/financeira",
    icon: Wallet,
    description: "Área financeira da operação.",
  },
  {
    title: "RH",
    href: "/rh",
    icon: Users,
    description: "Área de recursos humanos da operação.",
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
