'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { requestPasswordReset, signIn } from '@/lib/auth/actions'
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showAccessHelp, setShowAccessHelp] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isResetPending, startResetTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  async function handlePasswordReset(formData: FormData) {
    setResetError(null)
    setResetMessage(null)
    startResetTransition(async () => {
      const result = await requestPasswordReset(formData)
      if (result?.error) setResetError(result.error)
      if (result?.success) setResetMessage(result.success)
    })
  }

  return (
    <div className="min-h-screen bg-primary-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decoração de fundo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-700 opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-950 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent-500 opacity-[0.04]" />
      </div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logomarca institucional */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg px-4 py-3 mb-3">
            <Image
              src="/logo-villa-focolari.png"
              alt="Villa Focolari — Cuidado com alma"
              width={320}
              height={90}
              priority
              className="h-auto w-72"
            />
          </div>
          <p className="text-white/60 text-sm font-medium tracking-wide">
            Gestão do cuidado · Igarassu-PE
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Bem-vindo(a)</h1>
          <p className="text-muted text-sm mb-6">Acesse com suas credenciais</p>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-accent w-full mt-2 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no sistema'
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAccessHelp(!showAccessHelp)}
              className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
              Primeiro acesso / esqueci minha senha
            </button>

            {showAccessHelp && (
              <div className="mt-4 rounded-xl bg-primary-50 border border-primary-100 p-4">
                <p className="text-sm text-primary-900 mb-3">
                  Se você recebeu um convite, abra o link do email para definir sua senha. Se o link expirou ou você não recebeu a mensagem, informe seu email abaixo para receber um novo link de acesso.
                </p>

                {resetMessage && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-3 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{resetMessage}</span>
                  </div>
                )}

                {resetError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                <form action={handlePasswordReset} className="space-y-3">
                  <div>
                    <label htmlFor="reset-email" className="label">Email cadastrado</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                      <input
                        id="reset-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="profissional@email.com"
                        className="input pl-10"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isResetPending}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    {isResetPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-primary-800/30 border-t-primary-800 rounded-full animate-spin" />
                        Enviando link...
                      </>
                    ) : (
                      'Enviar link de acesso'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          Villa Focolari © {new Date().getFullYear()} — Igarassu-PE
        </p>
      </div>
    </div>
  )
}
