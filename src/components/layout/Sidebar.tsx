'use client'

import React from 'react'
import Image from 'next/image'
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
        <div className="bg-white rounded-xl px-3 py-2">
          <Image
            src="/logo-villa-focolari.png"
            alt="Villa Focolari — Cuidado com alma"
            width={220}
            height={62}
            priority
            className="h-auto w-44"
          />
        </div>
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
          Villa Focolari © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}
