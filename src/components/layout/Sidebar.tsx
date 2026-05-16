'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Pill,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  FileText,
  ClipboardList,
  ClipboardCheck,
} from 'lucide-react'
import { signOut } from '@/lib/auth/actions'
import type { UserProfile } from '@/lib/types/database'
import { cn } from '@/lib/utils/formatters'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Meu Turno', href: '/rotina', icon: ClipboardCheck },
  { label: 'Moradores', href: '/residentes', icon: Users },
  { label: 'Medicações', href: '/medicacoes', icon: Pill },
  { label: 'Intercorrências', href: '/incidentes', icon: AlertTriangle },
  { label: 'Qualidade', href: '/qualidade/indicadores', icon: BarChart3 },
  { label: 'Relatórios', href: '/qualidade/relatorios', icon: FileText },
  { label: 'Auditoria', href: '/admin/auditoria', icon: ClipboardList, adminOnly: true },
  { label: 'Administração', href: '/admin/usuarios', icon: Settings, adminOnly: true },
]

interface SidebarProps {
  profile: UserProfile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-primary-800 shadow-sidebar min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-white/10">
        <svg viewBox="0 0 260 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-auto">
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
      </div>

      {/* Perfil do usuário */}
      {profile && (
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
          <div className="w-9 h-9 rounded-full bg-accent-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {profile.nome_completo.split(' ').slice(0, 2).map(p => p[0]).join('')}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {profile.nome_completo.split(' ')[0]}{' '}
              {profile.nome_completo.split(' ').at(-1)}
            </p>
            <p className="text-white/60 text-xs truncate">
              {profile.role === 'admin' ? 'Responsável Técnico' :
               profile.role === 'medico' ? 'Médico(a)' :
               profile.role === 'enfermeiro' ? 'Enfermeiro(a)' :
               profile.role === 'tecnico_enfermagem' ? 'Téc. Enfermagem' :
               profile.role === 'fisioterapeuta' ? 'Fisioterapeuta' :
               profile.role === 'nutricionista' ? 'Nutricionista' :
               profile.role === 'psicologo' ? 'Psicólogo(a)' :
               profile.role === 'assistente_social' ? 'Assist. Social' :
               profile.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-item', isActive && 'active')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={signOut}>
          <button
            type="submit"
            className="sidebar-item w-full text-red-300 hover:text-red-200 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sair do sistema
          </button>
        </form>
        <p className="text-white/30 text-xs text-center mt-3">
          Vila Focolare © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}
