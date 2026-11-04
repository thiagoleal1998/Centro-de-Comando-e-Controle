"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])

  const [mode, setMode] = React.useState<"sign-in" | "sign-up">("sign-in")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [signUpSuccess, setSignUpSuccess] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setSignUpSuccess(false)

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(traduzErro(error.message))
        setLoading(false)
        return
      }
      router.push("/dashboard")
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(traduzErro(error.message))
      return
    }
    setSignUpSuccess(true)
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
              <Image
                src="/brand/neuro-mascot.png"
                alt="Neuro"
                width={36}
                height={36}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">Neuro Botics</span>
              <span className="text-muted-foreground text-xs">by JT Group</span>
            </div>
          </div>
          <CardTitle>
            {mode === "sign-in" ? "Entrar no Centro de Comando" : "Criar conta"}
          </CardTitle>
          <CardDescription>
            {mode === "sign-in"
              ? "Use seu e-mail e senha para acessar."
              : "Crie a conta que vai operar o Centro de Comando."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@neurobotics.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? (
              <p className="text-destructive text-sm">{error}</p>
            ) : null}

            {signUpSuccess ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Conta criada. Verifique seu e-mail para confirmar antes de
                entrar (se a confirmação estiver habilitada no projeto).
              </p>
            ) : null}

            <Button type="submit" disabled={loading} className="mt-1">
              {loading ? <Loader2 className="animate-spin" /> : null}
              {mode === "sign-in" ? "Entrar" : "Criar conta"}
            </Button>

            <button
              type="button"
              className="text-muted-foreground text-sm hover:underline"
              onClick={() => {
                setMode(mode === "sign-in" ? "sign-up" : "sign-in")
                setError(null)
                setSignUpSuccess(false)
              }}
            >
              {mode === "sign-in"
                ? "Ainda não tem conta? Criar conta"
                : "Já tem conta? Entrar"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function traduzErro(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos."
  }
  if (message.includes("User already registered")) {
    return "Já existe uma conta com este e-mail."
  }
  if (message.includes("Password should be")) {
    return "A senha precisa ter pelo menos 6 caracteres."
  }
  return message
}
