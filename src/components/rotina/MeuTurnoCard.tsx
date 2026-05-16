import Link from 'next/link'
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import { calcularIdade } from '@/lib/utils/formatters'
import type { Residente } from '@/lib/types/database'
import { cn } from '@/lib/utils/formatters'

interface StatusRotinaDia {
  banho: boolean
  alimentacao: boolean
  sono: boolean
  evacuacao: boolean
  diurese: boolean
  sinal_atencao: boolean
  completo: boolean
}

interface MeuTurnoCardProps {
  residente: Residente
  statusRotina: StatusRotinaDia
}

const itensEssenciais = [
  { key: 'banho', label: 'Banho', emoji: '🚿' },
  { key: 'alimentacao', label: 'Alimentação', emoji: '🍽️' },
  { key: 'evacuacao', label: 'Evacuação', emoji: '🚽' },
  { key: 'diurese', label: 'Diurese', emoji: '💧' },
] as const

export function MeuTurnoCard({ residente, statusRotina }: MeuTurnoCardProps) {
  const concluidos = itensEssenciais.filter(i => statusRotina[i.key]).length
  const total = itensEssenciais.length

  return (
    <Link
      href={`/rotina/${residente.id}`}
      className={cn(
        'block rounded-2xl border-2 p-4 transition-all active:scale-[0.98]',
        statusRotina.completo
          ? 'border-green-200 bg-green-50/50'
          : 'border-border bg-white hover:border-primary-200 hover:shadow-card',
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar + semáforo */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-base">
            {(residente.nome_social ?? residente.nome).split(' ').slice(0, 2).map(p => p[0]).join('')}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5">
            <SemaforoRisco nivel={residente.nivel_risco} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-bold text-foreground truncate">
              {residente.nome_social ?? residente.nome.split(' ')[0]}
            </p>
            <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
          </div>
          <p className="text-xs text-muted">
            {calcularIdade(residente.data_nascimento)} anos
            {residente.quarto ? ` · Quarto ${residente.quarto}` : ''}
          </p>

          {/* Barra de progresso dos itens */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">
              {itensEssenciais.map(item => (
                <div
                  key={item.key}
                  title={item.label}
                  className={cn(
                    'flex items-center justify-center w-7 h-7 rounded-full text-xs transition-colors',
                    statusRotina[item.key]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-400',
                  )}
                >
                  {statusRotina[item.key]
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : <span>{item.emoji}</span>}
                </div>
              ))}
            </div>
            <span className={cn(
              'text-xs font-semibold',
              statusRotina.completo ? 'text-green-700' : 'text-muted',
            )}>
              {concluidos}/{total}
            </span>
          </div>
        </div>
      </div>

      {statusRotina.completo && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Rotina completa hoje
        </div>
      )}

      {!statusRotina.completo && concluidos === 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
          <Clock className="w-3.5 h-3.5" />
          Nenhum registro hoje
        </div>
      )}
    </Link>
  )
}
