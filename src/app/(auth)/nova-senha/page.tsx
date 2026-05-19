'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { updatePassword } from '@/lib/auth/actions'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'

export default function NovaSenhaPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-primary-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-700 opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-950 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent-500 opacity-[0.04]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
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

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-primary-800" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Definir nova senha</h1>
              <p className="text-muted text-sm">
                Escolha uma senha individual para acessar o sistema com segurança.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md mb-5 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Este passo é usado no primeiro acesso, em convites e também na recuperação de senha.</span>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md mb-5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="label">Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Mínimo de 8 caracteres"
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

            <div>
              <label htmlFor="confirmPassword" className="label">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Repita a nova senha"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  Salvando senha...
                </>
              ) : (
                'Salvar senha e entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
