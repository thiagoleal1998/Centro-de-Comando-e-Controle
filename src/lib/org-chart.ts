export type OrgPerson = {
  name: string
  role: string
}

export type OrgNode = {
  title: string
  people?: OrgPerson[]
  children?: OrgNode[]
}

export const ORG_CHART: OrgNode = {
  title: "Conselho Administrativo",
  people: [
    { name: "Jonas Almeida", role: "Sócio Diretor Executivo" },
    { name: "Thiago Leal", role: "Sócio Diretor Administrativo" },
  ],
  children: [
    {
      title: "Diretoria",
      people: [
        { name: "Jonas Almeida", role: "Sócio Diretor Executivo" },
        { name: "Thiago Leal", role: "Sócio Diretor Administrativo" },
      ],
      children: [
        {
          title: "Operações",
          people: [{ name: "Alexandre Almeida", role: "Operações" }],
          children: [
            { title: "Administrativo" },
            { title: "Financeira" },
            { title: "RH" },
          ],
        },
      ],
    },
  ],
}
