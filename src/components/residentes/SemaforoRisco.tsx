import { cn } from '@/lib/utils/formatters'
import type { NivelRisco } from '@/lib/types/database'

interface SemaforoRiscoProps {
  nivel: NivelRisco
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const NIVEL_CONFIG: Record<NivelRisco, { label: string; dot: string; badge: string }> = {
  verde:    { label: 'Estável',  dot: 'bg-risk-verde',    badge: 'badge-verde' },
  amarelo:  { label: 'Atenção',  dot: 'bg-risk-amarelo',  badge: 'badge-amarelo' },
  laranja:  { label: 'Alerta',   dot: 'bg-risk-laranja',  badge: 'badge-laranja' },
  vermelho: { label: 'Crítico',  dot: 'bg-risk-vermelho', badge: 'badge-vermelho' },
}

const DOT_SIZE: Record<string, string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

export function SemaforoRisco({ nivel, size = 'md', showLabel = true }: SemaforoRiscoProps) {
  const config = NIVEL_CONFIG[nivel]

  if (!showLabel) {
    return (
      <span
        className={cn('inline-block rounded-full flex-shrink-0', config.dot, DOT_SIZE[size])}
        title={config.label}
      />
    )
  }

  return (
    <span className={config.badge}>
      <span className={cn('rounded-full flex-shrink-0', config.dot, DOT_SIZE[size])} />
      {config.label}
    </span>
  )
}
