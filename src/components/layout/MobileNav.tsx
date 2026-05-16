'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Pill, AlertTriangle, ClipboardCheck } from 'lucide-react'
import { cn } from '@/lib/utils/formatters'

const mobileItems = [
  { label: 'Painel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Moradores', href: '/residentes', icon: Users },
  { label: 'Meu Turno', href: '/rotina', icon: ClipboardCheck },
  { label: 'Medicações', href: '/medicacoes', icon: Pill },
  { label: 'Ocorrências', href: '/incidentes', icon: AlertTriangle },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-40 safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-md min-w-[56px] transition-colors',
                isActive ? 'text-primary-800' : 'text-muted hover:text-foreground',
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-primary-800')} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary-800 mt-0.5" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
