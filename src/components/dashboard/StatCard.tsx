import { cn } from '@/lib/utils/formatters'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  titulo: string
  valor: number | string
  descricao?: string
  icon: LucideIcon
  cor?: 'azul' | 'verde' | 'amarelo' | 'vermelho' | 'laranja'
  href?: string
  urgente?: boolean
}

const COR_MAP = {
  azul: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-100 text-primary-800',
    valor: 'text-primary-800',
  },
  verde: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-700',
    valor: 'text-green-700',
  },
  amarelo: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-700',
    valor: 'text-yellow-700',
  },
  laranja: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-700',
    valor: 'text-orange-700',
  },
  vermelho: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-700',
    valor: 'text-red-700',
  },
}

export function StatCard({ titulo, valor, descricao, icon: Icon, cor = 'azul', href, urgente }: StatCardProps) {
  const cores = COR_MAP[cor]

  const content = (
    <div
      className={cn(
        'card-sm flex items-center gap-4 transition-shadow',
        urgente && 'ring-2 ring-red-400 ring-offset-1',
        href && 'hover:shadow-card-hover cursor-pointer',
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', cores.icon)}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide truncate">
          {titulo}
        </p>
        <p className={cn('text-2xl font-bold mt-0.5', cores.valor)}>
          {valor}
        </p>
        {descricao && (
          <p className="text-xs text-muted mt-0.5 truncate">{descricao}</p>
        )}
      </div>
      {urgente && Number(valor) > 0 && (
        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
      )}
    </div>
  )

  if (href) {
    return <a href={href}>{content}</a>
  }

  return content
}
