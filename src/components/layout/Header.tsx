'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, Menu, X } from 'lucide-react'
import type { UserProfile } from '@/lib/types/database'
import { primeiroNome } from '@/lib/utils/formatters'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface HeaderProps {
  profile: UserProfile | null
  notificacoesNaoLidas?: number
  titulo?: string
}

export function Header({ profile, notificacoesNaoLidas = 0, titulo }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const hora = new Date().getHours()
  const saudacao =
    hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const dataHoje = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <header className="bg-white border-b border-border sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Lado esquerdo */}
        <div className="flex items-center gap-4">
          {/* Botão menu mobile */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-primary-50 text-muted"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            {profile && (
              <p className="text-sm font-semibold text-foreground">
                {saudacao}, {primeiroNome(profile.nome_completo)}
                {profile.role === 'medico' || profile.role === 'admin' ? ' 👨‍⚕️' : ''}
              </p>
            )}
            {titulo ? (
              <h1 className="text-xs text-muted capitalize">{titulo}</h1>
            ) : (
              <p className="text-xs text-muted capitalize">{dataHoje}</p>
            )}
          </div>
        </div>

        {/* Lado direito */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          <Link
            href="/notificacoes"
            className="relative p-2 rounded-md hover:bg-primary-50 text-muted hover:text-primary-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notificacoesNaoLidas > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}
              </span>
            )}
          </Link>

          {/* Avatar */}
          {profile && (
            <div className="w-8 h-8 rounded-full bg-primary-800 flex items-center justify-center text-white font-semibold text-xs">
              {profile.nome_completo.split(' ').slice(0, 2).map(p => p[0]).join('')}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
