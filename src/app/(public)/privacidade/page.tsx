export const metadata = {
  title: "Política de Privacidade — Centro de Comando",
}

export default function PrivacidadePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-8 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">
        Política de Privacidade
      </h1>
      <p className="text-muted-foreground">
        Centro de Comando e Controle — Neuro Botics, by JT Group.
      </p>

      <p>
        Este é um sistema de uso interno da Neuro Botics (JT Group), não
        destinado ao público em geral. Ele integra, mediante autorização do
        próprio usuário, serviços do Google (como Planilhas Google) para
        sincronizar dados operacionais internos de análise de produtos.
      </p>

      <h2 className="mt-2 font-semibold">Quais dados são acessados</h2>
      <p>
        Com a sua autorização via OAuth do Google, o sistema lê (apenas
        leitura, nunca escreve ou altera) o conteúdo de planilhas específicas
        do Google Sheets explicitamente compartilhadas para esse fim. Nenhum
        outro dado da sua Conta Google é acessado.
      </p>

      <h2 className="mt-2 font-semibold">Como os dados são usados</h2>
      <p>
        Os dados lidos são exibidos exclusivamente dentro deste sistema
        interno, para uso dos colaboradores autorizados da Neuro Botics/JT
        Group. Não são compartilhados com terceiros, nem usados para
        publicidade.
      </p>

      <h2 className="mt-2 font-semibold">Armazenamento</h2>
      <p>
        O token de acesso (OAuth) é armazenado de forma segura no banco de
        dados do sistema (Supabase), protegido por autenticação, e usado
        apenas para renovar o acesso de leitura às planilhas autorizadas.
      </p>

      <h2 className="mt-2 font-semibold">Revogar acesso</h2>
      <p>
        Você pode revogar o acesso deste sistema à sua Conta Google a
        qualquer momento em{" "}
        <a
          href="https://myaccount.google.com/permissions"
          className="underline"
        >
          myaccount.google.com/permissions
        </a>
        .
      </p>

      <h2 className="mt-2 font-semibold">Contato</h2>
      <p>contato.neurobotics@gmail.com</p>
    </div>
  )
}
