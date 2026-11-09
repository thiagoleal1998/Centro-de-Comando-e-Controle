export type OrgPerson = {
  key: string
  name: string
  role: string
  photo?: string
}

export type OrgNode = {
  title: string
  people?: OrgPerson[]
  children?: OrgNode[]
}

const JONAS: OrgPerson = {
  key: "jonas-almeida",
  name: "Jonas Almeida",
  role: "Sócio Diretor Executivo",
  photo: "/org-chart/jonas-almeida.jpg",
}

const THIAGO: OrgPerson = {
  key: "thiago-leal",
  name: "Thiago Leal",
  role: "Sócio Diretor Administrativo",
  photo: "/org-chart/thiago-leal.jpg",
}

export const ORG_CHART: OrgNode = {
  title: "Conselho Administrativo",
  people: [JONAS, THIAGO],
  children: [
    {
      title: "Diretoria",
      people: [JONAS, THIAGO],
      children: [
        {
          title: "Operações",
          people: [{ key: "alexandre-almeida", name: "Alexandre Almeida", role: "Operações" }],
        },
      ],
    },
  ],
}
