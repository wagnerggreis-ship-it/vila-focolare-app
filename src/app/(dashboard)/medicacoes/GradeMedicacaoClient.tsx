'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatTime } from '@/lib/utils/formatters'
import { CheckCircle, Clock, AlertCircle, Pill, X } from 'lucide-react'

interface Props {
  turno: { label: string; inicio: string; fim: string }
  grupos: { residente: any; adms: any[] }[]
  totalPendente: number
  agora: string
}

export default function GradeMedicacaoClient({ turno, grupos, totalPendente, agora }: Props) {
  const [gruposLocal, setGruposLocal] = useState(grupos)
  const [modalAdm, setModalAdm] = useState<any | null>(null)
  const [motivo, setMotivo] = useState('')
  const [isPending, startTransition] = useTransition()
  const agoraDate = new Date(agora)

  function getStatus(adm: any) {
    if (adm.status === 'administrado') return 'administrado'
    if (adm.status === 'nao_administrado') return 'nao_administrado'
    const prev = new Date(adm.horario_previsto)
    const diff = (agoraDate.getTime() - prev.getTime()) / 60000
    if (diff > 60) return 'atrasada_grave'
    if (diff > 30) return 'atrasada_leve'
    if (diff > 0) return 'no_horario'
    return 'pendente'
  }

  async function checar(admId: string, status: 'administrado' | 'nao_administrado') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    startTransition(async () => {
      await supabase.from('administracoes_medicamento').update({
        status,
        horario_realizado: status === 'administrado' ? new Date().toISOString() : null,
        administrado_por: user?.id,
        motivo_nao_administracao: status === 'nao_administrado' ? motivo : null,
      }).eq('id', admId)

      setGruposLocal(prev => prev.map(g => ({
        ...g,
        adms: g.adms.map(a => a.id === admId ? { ...a, status } : a),
      })))
      setModalAdm(null)
      setMotivo('')
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pill className="w-6 h-6 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold">Grade de Medicações</h1>
              <p className="text-muted text-sm">{turno.label}</p>
            </div>
          </div>
          {totalPendente > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">{totalPendente} pendente(s)</span>
            </div>
          )}
        </div>
      </div>

      {gruposLocal.length === 0 ? (
        <div className="card text-center py-12"><p className="text-muted">Nenhuma medicação programada para este turno.</p></div>
      ) : (
        gruposLocal.map(({ residente, adms }) => (
          <div key={residente.id} className="card">
            {/* Header do residente */}
            <div className="flex items-center gap-3 pb-3 mb-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-800 font-bold flex-shrink-0">
                {residente.nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-foreground">{residente.nome}</p>
                <p className="text-xs text-muted">{residente.quarto ? `Apto ${residente.quarto}` : ''}</p>
                {residente.alergias && <p className="text-xs text-red-600 font-semibold">⚠ {residente.alergias}</p>}
              </div>
            </div>

            <div className="space-y-2">
              {adms.map(adm => {
                const st = getStatus(adm)
                return (
                  <div
                    key={adm.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      st === 'administrado' ? 'border-green-200 bg-green-50' :
                      st === 'nao_administrado' ? 'border-gray-200 bg-gray-50' :
                      st === 'atrasada_grave' ? 'border-red-300 bg-red-50' :
                      st === 'atrasada_leve' ? 'border-orange-300 bg-orange-50' :
                      'border-border bg-white'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {st === 'administrado' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {st === 'nao_administrado' && <X className="w-5 h-5 text-gray-400" />}
                      {(st === 'atrasada_grave' || st === 'atrasada_leve') && <AlertCircle className={`w-5 h-5 ${st === 'atrasada_grave' ? 'text-red-500' : 'text-orange-500'}`} />}
                      {(st === 'pendente' || st === 'no_horario') && <Clock className="w-5 h-5 text-muted" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {adm.prescricao_item?.descricao ?? 'Medicação'}
                      </p>
                      <p className="text-xs text-muted">
                        {adm.prescricao_item?.dose && `${adm.prescricao_item.dose} · `}
                        {adm.prescricao_item?.via && `${adm.prescricao_item.via} · `}
                        {formatTime(adm.horario_previsto)}
                      </p>
                    </div>

                    {st !== 'administrado' && st !== 'nao_administrado' && (
                      <button
                        onClick={() => setModalAdm(adm)}
                        className="btn-accent text-xs px-3 py-1.5 flex-shrink-0"
                      >
                        Checar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Modal de checagem */}
      {modalAdm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            {/* Confirmar identidade */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-2xl mx-auto mb-2">
                {modalAdm.residente?.nome.split(' ').slice(0, 2).map((p: string) => p[0]).join('')}
              </div>
              <p className="font-bold text-lg text-foreground">{modalAdm.residente?.nome}</p>
              {modalAdm.residente?.quarto && <p className="text-sm text-muted">Apto {modalAdm.residente.quarto}</p>}
            </div>

            <div className="p-4 bg-primary-50 rounded-lg text-center">
              <p className="text-base font-bold text-primary-800">{modalAdm.prescricao_item?.descricao}</p>
              <p className="text-sm text-muted mt-1">
                {modalAdm.prescricao_item?.dose} · {modalAdm.prescricao_item?.via} · {formatTime(modalAdm.horario_previsto)}
              </p>
            </div>

            <p className="text-sm text-center text-muted font-semibold">
              Confirme que está administrando para a pessoa acima
            </p>

            <div className="space-y-2">
              <button
                onClick={() => checar(modalAdm.id, 'administrado')}
                disabled={isPending}
                className="btn-accent w-full flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isPending ? 'Salvando...' : 'Confirmar administração'}
              </button>

              <div className="space-y-2">
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  className="input"
                  placeholder="Motivo da não administração (obrigatório)..."
                  rows={2}
                />
                <button
                  onClick={() => { if (motivo.trim()) checar(modalAdm.id, 'nao_administrado') }}
                  disabled={isPending || !motivo.trim()}
                  className="btn-secondary w-full text-sm"
                >
                  Não administrado
                </button>
              </div>

              <button onClick={() => { setModalAdm(null); setMotivo('') }} className="btn-ghost w-full text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
