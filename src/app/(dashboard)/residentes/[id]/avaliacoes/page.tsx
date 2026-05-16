import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/formatters'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import { Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import type { AvaliacaoFuncional, TipoAvaliacao } from '@/lib/types/database'
import { AVALIACAO_LABELS } from '@/lib/types/database'
import { addDays, isBefore, parseISO } from 'date-fns'
import AvaliacaoFormWrapper from './AvaliacaoFormWrapper'

const PRAZOS_DIAS: Record<TipoAvaliacao, number> = {
  katz: 180, barthel: 180, lawton: 180, mna: 90,
  mmse: 180, gds15: 180, pps: 90, braden: 7, morse: 7, disfagia: 180,
}

export default async function AvaliacoesPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { instrumento?: string }
}) {
  const supabase = await createClient()

  const [{ data: residente }, { data: avaliacoes }, { data: { user } }] = await Promise.all([
    supabase.from('residentes').select('id, nome, nivel_risco').eq('id', params.id).single(),
    supabase
      .from('avaliacoes_funcionais')
      .select('*, avaliador:avaliador_id(id, nome_completo, role)')
      .eq('residente_id', params.id)
      .order('data_avaliacao', { ascending: false }),
    supabase.auth.getUser(),
  ])

  if (!residente) notFound()

  const { data: profile } = await supabase
    .from('user_profiles').select('*').eq('id', user?.id ?? '').single()

  const hoje = new Date()

  // Agrupar por instrumento — pegar a mais recente de cada
  const ultimasPorTipo = (Object.keys(AVALIACAO_LABELS) as TipoAvaliacao[]).map(tipo => {
    const lista = (avaliacoes ?? []).filter((a: AvaliacaoFuncional) => a.tipo_avaliacao === tipo)
    const ultima = lista[0] ?? null
    const prazo = PRAZOS_DIAS[tipo]
    let status: 'ok' | 'vencendo' | 'vencida' | 'nunca' = 'nunca'
    if (ultima) {
      const proxima = addDays(parseISO(ultima.data_avaliacao), prazo)
      if (isBefore(proxima, hoje)) status = 'vencida'
      else if (isBefore(proxima, addDays(hoje, 14))) status = 'vencendo'
      else status = 'ok'
    }
    return { tipo, ultima, status, historico: lista, prazo }
  })

  if (searchParams.instrumento) {
    return (
      <AvaliacaoFormWrapper
        instrumento={searchParams.instrumento as TipoAvaliacao}
        residenteId={params.id}
        residenteNome={residente.nome}
        userId={user?.id ?? ''}
      />
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Avaliações Funcionais</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted text-sm">{residente.nome}</span>
            <SemaforoRisco nivel={residente.nivel_risco} size="sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {ultimasPorTipo.map(({ tipo, ultima, status, historico, prazo }) => (
          <div key={tipo} className={`card-sm border-l-4 ${
            status === 'vencida' ? 'border-l-red-500' :
            status === 'vencendo' ? 'border-l-yellow-500' :
            status === 'nunca' ? 'border-l-border' :
            'border-l-green-500'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground leading-tight">
                  {AVALIACAO_LABELS[tipo]}
                </p>
                <p className="text-xs text-muted mt-0.5">A cada {prazo} dias</p>
              </div>
              {status === 'ok' && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
              {status === 'vencida' && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              {status === 'vencendo' && <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
            </div>

            {ultima ? (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">{formatDate(ultima.data_avaliacao)}</span>
                  {ultima.score_total !== null && ultima.score_total !== undefined && (
                    <span className="font-bold text-primary-800 text-sm">{ultima.score_total} pts</span>
                  )}
                </div>
                {ultima.classificacao && (
                  <p className="text-xs font-semibold text-foreground mt-1">{ultima.classificacao}</p>
                )}
                {/* Mini histórico de barras */}
                {historico.length > 1 && (
                  <div className="flex items-end gap-1 mt-2 h-8">
                    {historico.slice(0, 6).reverse().map((av: AvaliacaoFuncional, i: number) => {
                      const maxScore = tipo === 'barthel' ? 100 : tipo === 'katz' ? 6 : tipo === 'braden' ? 23 : tipo === 'morse' ? 125 : tipo === 'mna' ? 30 : tipo === 'mmse' ? 30 : tipo === 'gds15' ? 15 : 100
                      const pct = Math.max(10, ((av.score_total ?? 0) / maxScore) * 100)
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-primary-200 rounded-sm"
                          style={{ height: `${pct}%` }}
                          title={`${av.score_total} pts — ${formatDate(av.data_avaliacao)}`}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted mt-3">Nunca realizada</p>
            )}

            <Link
              href={`?instrumento=${tipo}`}
              className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-800"
            >
              <Plus className="w-3 h-3" />
              Nova avaliação
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
