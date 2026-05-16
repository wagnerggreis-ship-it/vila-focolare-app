'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime, formatDate } from '@/lib/utils/formatters'
import { TIPO_INCIDENTE_LABELS, GRAVIDADE_LABELS } from '@/lib/types/database'
import Link from 'next/link'
import { ArrowLeft, Plus, CheckCircle } from 'lucide-react'

interface Props {
  incidente: any
  isAdmin: boolean
  currentUserId: string
  profissionais: any[]
}

const STATUS_COLORS: Record<string, string> = {
  aberto: 'bg-red-100 text-red-800', investigando: 'bg-yellow-100 text-yellow-800',
  plano_acao: 'bg-orange-100 text-orange-800', fechado: 'bg-green-100 text-green-800',
}

export default function IncidenteDetailClient({ incidente, isAdmin, currentUserId, profissionais }: Props) {
  const [inc, setInc] = useState(incidente)
  const [showAcao, setShowAcao] = useState(false)
  const [novaAcao, setNovaAcao] = useState({ descricao_acao: '', responsavel_id: '', prazo: '' })
  const [investigacao, setInvestigacao] = useState<string[]>(
    (inc.investigacao?.porques ?? ['', '', '', '', ''])
  )
  const [isPending, startTransition] = useTransition()

  async function salvarInvestigacao() {
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from('incidentes').update({
        investigacao: { porques: investigacao },
        status: 'investigando',
      }).eq('id', inc.id)
      setInc({ ...inc, investigacao: { porques: investigacao }, status: 'investigando' })
    })
  }

  async function adicionarAcao() {
    if (!novaAcao.descricao_acao || !novaAcao.prazo) return
    const supabase = createClient()
    startTransition(async () => {
      const resp = profissionais.find(p => p.id === novaAcao.responsavel_id)
      const { data } = await supabase.from('acoes_corretivas').insert({
        incidente_id: inc.id,
        descricao_acao: novaAcao.descricao_acao,
        responsavel_id: novaAcao.responsavel_id || null,
        prazo: novaAcao.prazo,
        status: 'pendente',
      }).select('*, responsavel:responsavel_id(id, nome_completo)').single()

      if (data) {
        setInc({ ...inc, acoes: [...(inc.acoes ?? []), data], status: 'plano_acao' })
        setNovaAcao({ descricao_acao: '', responsavel_id: '', prazo: '' })
        setShowAcao(false)
        await supabase.from('incidentes').update({ status: 'plano_acao' }).eq('id', inc.id)
      }
    })
  }

  async function concluirAcao(acaoId: string) {
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from('acoes_corretivas').update({ status: 'concluido', concluido_em: new Date().toISOString().split('T')[0] }).eq('id', acaoId)
      setInc({ ...inc, acoes: inc.acoes.map((a: any) => a.id === acaoId ? { ...a, status: 'concluido' } : a) })
    })
  }

  async function fecharIncidente() {
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from('incidentes').update({
        status: 'fechado', fechado_por: currentUserId, fechado_em: new Date().toISOString(),
      }).eq('id', inc.id)
      setInc({ ...inc, status: 'fechado', fechado_por: currentUserId })
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/incidentes" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold">Detalhes do Incidente</h1>
          <p className="text-muted text-sm">{inc.residente?.nome}</p>
        </div>
        <span className={`ml-auto text-xs px-3 py-1.5 rounded-full font-bold ${STATUS_COLORS[inc.status]}`}>
          {inc.status.replace('_', ' ')}
        </span>
      </div>

      {/* Informações do incidente */}
      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide">Informações do Evento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            ['Residente', inc.residente?.nome + (inc.residente?.quarto ? ` — Apto ${inc.residente.quarto}` : '')],
            ['Tipo', TIPO_INCIDENTE_LABELS[inc.tipo as keyof typeof TIPO_INCIDENTE_LABELS] ?? inc.tipo],
            ['Gravidade', GRAVIDADE_LABELS[inc.gravidade as keyof typeof GRAVIDADE_LABELS] ?? inc.gravidade],
            ['Data/Hora', formatDateTime(inc.data_hora_evento)],
            ['Local', inc.local_ocorrencia ?? '—'],
            ['Registrado por', inc.registrado_por_user?.nome_completo ?? '—'],
          ].map(([label, valor]) => (
            <div key={label}>
              <p className="text-xs text-muted font-semibold uppercase">{label}</p>
              <p className="text-foreground mt-0.5">{valor}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs text-muted font-semibold uppercase mb-1">Descrição</p>
          <p className="text-sm text-foreground whitespace-pre-line">{inc.descricao}</p>
        </div>
        {inc.dano_causado && (
          <div>
            <p className="text-xs text-muted font-semibold uppercase mb-1">Dano causado</p>
            <p className="text-sm text-foreground">{inc.dano_causado}</p>
          </div>
        )}
      </div>

      {/* Investigação (5 Porquês) */}
      {isAdmin && inc.status !== 'fechado' && (
        <div className="card space-y-4">
          <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide">Investigação — 5 Porquês</h2>
          <p className="text-xs text-muted">Identifique a causa raiz perguntando &ldquo;por quê?&rdquo; sucessivamente.</p>
          {investigacao.map((val, idx) => (
            <div key={idx}>
              <label className="label">Por que {idx + 1}?</label>
              <input value={val} onChange={e => { const n = [...investigacao]; n[idx] = e.target.value; setInvestigacao(n) }} className="input" placeholder={`Causa ${idx + 1}...`} />
            </div>
          ))}
          <button onClick={salvarInvestigacao} disabled={isPending} className="btn-primary">
            {isPending ? 'Salvando...' : 'Salvar investigação'}
          </button>
        </div>
      )}

      {/* Plano de ação corretiva */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide">Plano de Ação Corretiva</h2>
          {isAdmin && inc.status !== 'fechado' && (
            <button onClick={() => setShowAcao(true)} className="btn-secondary text-sm flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />Adicionar ação
            </button>
          )}
        </div>

        {!inc.acoes || inc.acoes.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma ação cadastrada.</p>
        ) : (
          <div className="space-y-3">
            {inc.acoes.map((acao: any) => (
              <div key={acao.id} className={`p-3 rounded-lg border ${acao.status === 'concluido' ? 'bg-green-50 border-green-200' : 'bg-white border-border'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{acao.descricao_acao}</p>
                    <p className="text-xs text-muted mt-1">
                      Prazo: {formatDate(acao.prazo)}
                      {acao.responsavel && ` · Resp: ${acao.responsavel.nome_completo}`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${acao.status === 'concluido' ? 'bg-green-200 text-green-800' : acao.status === 'em_andamento' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>
                    {acao.status}
                  </span>
                </div>
                {isAdmin && acao.status !== 'concluido' && (
                  <button onClick={() => concluirAcao(acao.id)} className="mt-2 text-xs text-green-700 font-semibold hover:underline flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />Marcar como concluída
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {showAcao && (
          <div className="p-4 border-2 border-primary-200 rounded-lg space-y-3 bg-primary-50">
            <p className="text-sm font-bold">Nova ação corretiva</p>
            <div>
              <label className="label">Descrição da ação *</label>
              <textarea value={novaAcao.descricao_acao} onChange={e => setNovaAcao({...novaAcao, descricao_acao: e.target.value})} className="input min-h-[80px] resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Responsável</label>
                <select value={novaAcao.responsavel_id} onChange={e => setNovaAcao({...novaAcao, responsavel_id: e.target.value})} className="input">
                  <option value="">Selecionar...</option>
                  {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Prazo *</label>
                <input type="date" value={novaAcao.prazo} onChange={e => setNovaAcao({...novaAcao, prazo: e.target.value})} className="input" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAcao(false)} className="btn-ghost flex-1 text-sm">Cancelar</button>
              <button onClick={adicionarAcao} disabled={isPending} className="btn-primary flex-1 text-sm">{isPending ? '...' : 'Adicionar'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Fechar incidente */}
      {isAdmin && inc.status !== 'fechado' && (
        <div className="card bg-gray-50">
          <p className="text-sm text-muted mb-3">Feche o incidente após todas as ações corretivas concluídas e documentadas.</p>
          <button onClick={fecharIncidente} disabled={isPending} className="btn-primary text-sm">
            Fechar incidente (assinatura do RT)
          </button>
        </div>
      )}
    </div>
  )
}
