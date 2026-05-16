'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/formatters'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import { Plus, CheckCircle, AlertCircle, PenLine } from 'lucide-react'
import type { PlanoCuidado, NivelRisco } from '@/lib/types/database'

const AREAS = ['medica', 'enfermagem', 'fisioterapia', 'nutricao', 'psicologia', 'social', 'to']
const AREA_LABELS: Record<string, string> = {
  medica: 'Médica', enfermagem: 'Enfermagem', fisioterapia: 'Fisioterapia',
  nutricao: 'Nutrição', psicologia: 'Psicologia', social: 'Serviço Social', to: 'Terapia Ocupacional',
}

interface Props {
  residente: { id: string; nome: string; nivel_risco: NivelRisco }
  plano: PlanoCuidado | null
  isAdmin: boolean
  currentUserId: string
  profissionais: { id: string; nome_completo: string; role: string }[]
  vencido: boolean
}

export default function PlanoCuidadosClient({ residente, plano, isAdmin, currentUserId, profissionais, vencido }: Props) {
  const [showNovoItem, setShowNovoItem] = useState(false)
  const [novoItem, setNovoItem] = useState({ area: 'medica', diagnostico: '', meta: '', intervencoes: '', prazo: '', responsavel_id: '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [planoLocal, setPlanoLocal] = useState(plano)

  async function assinarPlano() {
    if (!planoLocal) return
    const supabase = createClient()
    startTransition(async () => {
      const { error: e } = await supabase.from('planos_cuidado')
        .update({ assinado_por: currentUserId, assinado_em: new Date().toISOString() })
        .eq('id', planoLocal.id)
      if (!e) setPlanoLocal({ ...planoLocal, assinado_por: currentUserId, assinado_em: new Date().toISOString() })
    })
  }

  async function criarPlano() {
    const supabase = createClient()
    const dataRevisao = new Date()
    dataRevisao.setDate(dataRevisao.getDate() + 30)
    startTransition(async () => {
      const { data, error: e } = await supabase.from('planos_cuidado').insert({
        residente_id: residente.id,
        status: 'ativo',
        data_inicio: new Date().toISOString().split('T')[0],
        data_revisao_prevista: dataRevisao.toISOString().split('T')[0],
      }).select().single()
      if (!e && data) setPlanoLocal({ ...data, itens: [] })
    })
  }

  async function salvarItem() {
    if (!planoLocal) return
    const supabase = createClient()
    startTransition(async () => {
      const { data, error: e } = await supabase.from('plano_itens').insert({
        plano_id: planoLocal.id,
        area: novoItem.area,
        diagnostico: novoItem.diagnostico,
        meta: novoItem.meta,
        intervencoes: novoItem.intervencoes,
        prazo: novoItem.prazo || null,
        responsavel_id: novoItem.responsavel_id || null,
        status: 'ativo',
      }).select('*, responsavel:responsavel_id(id, nome_completo)').single()
      if (e) { setError(e.message); return }
      setPlanoLocal({ ...planoLocal, itens: [...(planoLocal.itens ?? []), data] })
      setNovoItem({ area: 'medica', diagnostico: '', meta: '', intervencoes: '', prazo: '', responsavel_id: '' })
      setShowNovoItem(false)
    })
  }

  if (!planoLocal) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
        <h1 className="text-xl font-bold text-foreground">Plano de Cuidados — {residente.nome}</h1>
        <div className="card text-center py-12 border-2 border-dashed border-yellow-300 bg-yellow-50">
          <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-lg font-bold text-yellow-800">Sem plano de cuidados ativo</p>
          <p className="text-sm text-yellow-700 mt-1">Todo residente deve ter um plano dentro de 72h da admissão.</p>
          {isAdmin && (
            <button onClick={criarPlano} disabled={isPending} className="btn-accent mt-4 mx-auto inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {isPending ? 'Criando...' : 'Criar plano de cuidados'}
            </button>
          )}
        </div>
      </div>
    )
  }

  const itensPorArea = AREAS.map(area => ({
    area,
    itens: (planoLocal.itens ?? []).filter((i: any) => i.area === area),
  })).filter(g => g.itens.length > 0 || isAdmin)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header do plano */}
      <div className={`card border-l-4 ${vencido ? 'border-l-red-500' : planoLocal.assinado_por ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Plano de Cuidados — v{planoLocal.versao}</h1>
              <SemaforoRisco nivel={residente.nivel_risco} size="sm" />
            </div>
            <p className="text-muted text-sm mt-1">{residente.nome}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              <span className="text-muted">Início: {formatDate(planoLocal.data_inicio)}</span>
              <span className={vencido ? 'text-red-600 font-semibold' : 'text-muted'}>
                Revisão: {formatDate(planoLocal.data_revisao_prevista)}
                {vencido && ' ⚠ VENCIDO'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {planoLocal.assinado_por ? (
              <div className="flex items-center gap-1.5 text-green-700 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Assinado pelo RT
              </div>
            ) : isAdmin ? (
              <button onClick={assinarPlano} disabled={isPending} className="btn-primary flex items-center gap-2 text-sm">
                <PenLine className="w-4 h-4" />
                Assinar como RT
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-yellow-700 text-sm font-semibold">
                <AlertCircle className="w-4 h-4" />
                Aguardando assinatura
              </div>
            )}
            {isAdmin && (
              <button onClick={() => setShowNovoItem(true)} className="btn-secondary flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" />
                Novo item
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Itens por área */}
      {itensPorArea.map(({ area, itens }) => (
        <div key={area} className="card">
          <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-4 pb-3 border-b border-border">
            {AREA_LABELS[area] ?? area}
          </h2>
          {itens.length === 0 ? (
            <p className="text-sm text-muted">Nenhum item cadastrado para esta área.</p>
          ) : (
            <div className="space-y-4">
              {itens.map((item: any) => (
                <div key={item.id} className="p-3 rounded-lg bg-primary-50 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted uppercase font-semibold mb-0.5">Diagnóstico/Necessidade</p>
                      <p className="text-foreground">{item.diagnostico}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase font-semibold mb-0.5">Meta</p>
                      <p className="text-foreground">{item.meta}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase font-semibold mb-0.5">Intervenções</p>
                      <p className="text-foreground">{item.intervencoes}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted">
                    {item.prazo && <span>Prazo: {formatDate(item.prazo)}</span>}
                    {item.responsavel && <span>Resp: {item.responsavel.nome_completo}</span>}
                    <span className={`font-semibold ${item.status === 'ativo' ? 'text-green-700' : 'text-muted'}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Modal novo item */}
      {showNovoItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold">Novo item do plano</h2>
            <div>
              <label className="label">Área *</label>
              <select value={novoItem.area} onChange={e => setNovoItem({...novoItem, area: e.target.value})} className="input">
                {AREAS.map(a => <option key={a} value={a}>{AREA_LABELS[a]}</option>)}
              </select>
            </div>
            {[
              { key: 'diagnostico', label: 'Diagnóstico / Necessidade *' },
              { key: 'meta', label: 'Meta *' },
              { key: 'intervencoes', label: 'Intervenções *' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <textarea value={novoItem[key as keyof typeof novoItem]} onChange={e => setNovoItem({...novoItem, [key]: e.target.value})} className="input min-h-[70px] resize-y" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prazo</label>
                <input type="date" value={novoItem.prazo} onChange={e => setNovoItem({...novoItem, prazo: e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">Responsável</label>
                <select value={novoItem.responsavel_id} onChange={e => setNovoItem({...novoItem, responsavel_id: e.target.value})} className="input">
                  <option value="">Selecionar...</option>
                  {profissionais.map((p: any) => <option key={p.id} value={p.id}>{p.nome_completo}</option>)}
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowNovoItem(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={salvarItem} disabled={isPending || !novoItem.diagnostico || !novoItem.meta || !novoItem.intervencoes} className="btn-accent flex-1">
                {isPending ? 'Salvando...' : 'Adicionar item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
