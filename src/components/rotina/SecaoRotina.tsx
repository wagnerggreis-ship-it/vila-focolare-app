'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/formatters'

interface SecaoRotinaProps {
  titulo: string
  emoji: string
  concluida?: boolean
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SecaoRotina({
  titulo,
  emoji,
  concluida = false,
  children,
  defaultOpen = false,
}: SecaoRotinaProps) {
  const [open, setOpen] = useState(defaultOpen || !concluida)

  return (
    <div className={cn(
      'rounded-2xl border-2 overflow-hidden transition-colors',
      concluida ? 'border-green-200 bg-green-50/40' : 'border-border bg-white',
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <span className={cn(
            'text-base font-bold',
            concluida ? 'text-green-800' : 'text-foreground',
          )}>
            {titulo}
          </span>
          {concluida && (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          )}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/50">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}
