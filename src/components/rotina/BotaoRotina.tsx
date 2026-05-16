'use client'

import { cn } from '@/lib/utils/formatters'

interface BotaoRotinaProps {
  label: string
  emoji?: string
  selected?: boolean
  onClick: () => void
  variant?: 'default' | 'ok' | 'alerta' | 'perigo'
}

const variantClasses = {
  default: 'border-border bg-white text-foreground hover:border-primary-300 hover:bg-primary-50',
  ok: 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100',
  alerta: 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100',
  perigo: 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100',
}

const selectedClasses = {
  default: 'border-primary-800 bg-primary-800 text-white',
  ok: 'border-green-700 bg-green-600 text-white',
  alerta: 'border-yellow-600 bg-yellow-500 text-white',
  perigo: 'border-red-700 bg-red-600 text-white',
}

export function BotaoRotina({
  label,
  emoji,
  selected = false,
  onClick,
  variant = 'default',
}: BotaoRotinaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-3 py-3 min-h-[72px] text-sm font-semibold transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:ring-offset-1',
        selected ? selectedClasses[variant] : variantClasses[variant],
      )}
    >
      {emoji && <span className="text-xl leading-none">{emoji}</span>}
      <span className="text-center leading-tight">{label}</span>
    </button>
  )
}
