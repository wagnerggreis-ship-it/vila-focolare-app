import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'
import { CheckCircle, X, Clock, ClipboardCheck, ArrowLeft } from 'lucide-react'
import { subDays } from 'date-fns'

export default async function MedicacoesResidentePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: residente } = await supabase
    .from('residentes')
    .select('id, nome, nivel_risco, alergias')
    .eq('id', params.id)
    .single()

  if (!residente) notFound()

  const [{ data: prescricoes }, { data: historico }] = await Promise.all([
    supabase
      .from('prescricoes_medicas')
      .select('*, itens:prescricao_itens(*), prescrito_por_user:prescrito_por(id, nome_completo)')
      .eq('residente_id', params.id)
      .eq('status', 'ativa')
      .order('created_at', { ascending: false }),
    supabase
      .from('administracoes_medicamento')
      .select('*, prescricao_item:prescricao_item_id(descricao, dose)')
      .eq('residente_id', params.id)
      .gte('horario_previsto', subDays(new Date(), 7).toISOString())
      .order('horario_previsto', { ascending: false })
      .limit(50),
  ])

  const totalAdm = (historico ?? []).filter((a: any) => a.status === 'administrado').length
  const totalPrev = (historico ?? []).length
  const aderencia = totalPrev > 0 ? Math.round((totalAdm / totalPrev) * 100) : null

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Navegação de volta */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href={`/residentes/${params.id}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-primary-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Ficha do Morador
        </Link>
        <span className="text-muted text-xs">·</span>
        <Link
          href={`/rotina/${params.id}`}
          className="flex items-center gap-1.5 text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors"
        >
          <ClipboardCheck className="w-4 h-4" />
          Registrar Rotina
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-bold">Medicações</h1>
        <p className="text-muted text-sm">{residente.nome}</p>
        {residente.alergias && <p className="text-xs text-red-600 font-semibold mt-0.5">⚠ Alergias: {residente.alergias}</p>}
      </div>

      {/* Aderência */}
      {aderencia !== null && (
        <div className={`card-sm flex items-center gap-4 ${aderencia >= 95 ? 'border-l-4 border-l-green-500' : aderencia >= 80 ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-red-500'}`}>
          <div>
            <p className="text-2xl font-bold text-foreground">{aderencia}%</p>
            <p className="text-xs text-muted">Aderência (últimos 7 dias)</p>
          </div>
          <p className="text-xs text-muted">{totalAdm} de {totalPrev} doses administradas</p>
        </div>
      )}

      {/* Prescrições ativas */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">Prescrições Ativas</h2>
          <Link href={`/residentes/${params.id}/prescricoes`} className="text-xs text-primary-600 hover:underline">
            Gerenciar →
          </Link>
        </div>
        {!prescricoes || prescricoes.length === 0 ? (
          <p className="text-muted text-sm">Nenhuma prescrição ativa.</p>
        ) : (
          <div className="space-y-3">
            {prescricoes.map(presc => (
              <div key={presc.id} className="space-y-1.5">
                {(presc.itens ?? []).filter((i: any) => i.ativo).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-primary-50 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{item.descricao}</p>
                      <p className="text-xs text-muted">
                        {[item.dose, item.via, item.frequencia].filter(Boolean).join(' · ')}
                        {item.horarios?.length ? ` — ${item.horarios.join(', ')}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico recente */}
      <div className="card">
        <h2 className="text-base font-bold text-foreground mb-4">Histórico (7 dias)</h2>
        {!historico || historico.length === 0 ? (
          <p className="text-muted text-sm">Nenhum registro.</p>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {(historico ?? []).map(adm => (
              <div key={adm.id} className="flex items-center gap-3 p-2 rounded text-sm">
                {adm.status === 'administrado' ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> :
                 adm.status === 'nao_administrado' ? <X className="w-4 h-4 text-red-400 flex-shrink-0" /> :
                 <Clock className="w-4 h-4 text-muted flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{(adm as any).prescricao_item?.descricao}</p>
                  <p className="text-xs text-muted">{formatDate(adm.horario_previsto)}</p>
                </div>
                {adm.motivo_nao_administracao && (
                  <p className="text-xs text-muted truncate max-w-[120px]">{adm.motivo_nao_administracao}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
