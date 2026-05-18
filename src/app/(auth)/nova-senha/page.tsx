'use client'

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
          <svg viewBox="0 0 260 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-auto mb-3">
            <path d="M 8,68 C 8,60 8,50 10,42 C 12,32 18,22 28,14 C 32,11 34,10 36,11 C 32,14 28,20 26,28 C 24,36 24,46 24,56 L 22,68 Z" fill="#FFFFFF"/>
            <path d="M 64,68 C 64,60 64,50 62,42 C 60,32 54,22 44,14 C 40,11 38,10 36,11 C 40,14 44,20 46,28 C 48,36 48,46 48,56 L 50,68 Z" fill="#FFFFFF" opacity="0.8"/>
            <path d="M 36,14 C 30,20 26,30 26,40 C 26,52 30,62 36,68 C 42,62 46,52 46,40 C 46,30 42,20 36,14 Z" fill="#F5C89A"/>
            <ellipse cx="36" cy="44" rx="7" ry="13" fill="#FFF5E8"/>
            <ellipse cx="36" cy="46" rx="4" ry="8" fill="#FFFFFF" opacity="0.9"/>
            <circle cx="36" cy="10" r="4" fill="#F5C89A"/>
            <circle cx="36" cy="10" r="2" fill="#FFFFFF"/>
            <text x="80" y="32" fontFamily="'Plus Jakarta Sans','Segoe UI',sans-serif" fontSize="11" fontWeight="400" fill="rgba(255,255,255,0.65)" letterSpacing="3">VILA</text>
            <text x="80" y="56" fontFamily="'Plus Jakarta Sans','Segoe UI',sans-serif" fontSize="23" fontWeight="700" fill="#FFFFFF" letterSpacing="0.5">Focolare</text>
            <text x="81" y="69" fontFamily="'Plus Jakarta Sans','Segoe UI',sans-serif" fontSize="8" fontWeight="400" fill="rgba(255,255,255,0.5)" letterSpacing="1.2">Cuidado com alma</text>
          </svg>
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
