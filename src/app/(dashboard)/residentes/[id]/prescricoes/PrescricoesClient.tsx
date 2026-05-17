'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/formatters'
import { Plus, X, CheckCircle, Clock, ClipboardCheck } from 'lucide-react'
import type { PrescricaoMedica, PrescricaoItem } from '@/lib/types/database'

const HORARIOS_PADRAO = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00','00:00']
const VIAS = ['VO (via oral)', 'EV (endovenosa)', 'SC (subcutânea)', 'IM (intramuscular)', 'SL (sublingual)', 'Tópica', 'Inalatória', 'Retal']

interface ItemForm { tipo: string; descricao: string; dose: string; via: string; frequencia: string; horarios: string[]; duracao: string; observacoes: string }
const ITEM_VAZIO: ItemForm = { tipo: 'medicamento', descricao: '', dose: '', via: 'VO (via oral)', frequencia: '', horarios: [], duracao: '', observacoes: '' }

interface Props {
  residente: { id: string; nome: string; alergias?: string }
  prescricoes: PrescricaoMedica[]
  podePrescrever: boolean
  currentUserId: string
}

export default function PrescricoesClient({ residente, prescricoes: initialPrescricoes, podePrescrever, currentUserId }: Props) {
  const [prescricoes, setPrescricoes] = useState(initialPrescricoes)
  const [showNova, setShowNova] = useState(false)
  const [itens, setItens] = useState<ItemForm[]>([{ ...ITEM_VAZIO }])
  const [observacoes, setObservacoes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggleHorario(itemIdx: number, h: string) {
    const item = itens[itemIdx]
    const hs = item.horarios.includes(h) ? item.horarios.filter(x => x !== h) : [...item.horarios, h].sort()
    const novos = [...itens]
    novos[itemIdx] = { ...item, horarios: hs }
    setItens(novos)
  }

  async function salvarPrescricao() {
    const supabase = createClient()
    startTransition(async () => {
      const { data: prescricao, error: e1 } = await supabase.from('prescricoes_medicas').insert({
        residente_id: residente.id,
        prescrito_por: currentUserId,
        data_inicio: new Date().toISOString().split('T')[0],
        status: 'ativa',
        observacoes: observacoes || null,
      }).select('*, prescrito_por_user:prescrito_por(id, nome_completo, registro_profissional)').single()

      if (e1 || !prescricao) { setError(e1?.message ?? 'Erro ao salvar'); return }

      const itemsPayload = itens.filter(i => i.descricao).map(i => ({
        prescricao_id: prescricao.id,
        tipo: i.tipo, descricao: i.descricao, dose: i.dose || null,
        via: i.via || null, frequencia: i.frequencia || null,
        horarios: i.horarios.length ? i.horarios : null,
        duracao: i.duracao || null, observacoes: i.observacoes || null, ativo: true,
      }))

      const { data: itemsCriados } = await supabase.from('prescricao_itens').insert(itemsPayload).select()
      setPrescricoes([{ ...prescricao, itens: itemsCriados ?? [] } as any, ...prescricoes])
      setShowNova(false)
      setItens([{ ...ITEM_VAZIO }])
      setObservacoes('')
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
<h1 className="text-xl font-bold">Medicações regulares</h1>
              <p className="text-muted text-sm">{residente.nome}</p>
          {residente.alergias && <p className="text-xs text-red-600 font-semibold mt-0.5">⚠ Alergias: {residente.alergias}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/residentes/${residente.id}/medicacoes`} className="btn-secondary flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />Diário
          </Link>
          {podePrescrever && (
            <button onClick={() => setShowNova(true)} className="btn-accent flex items-center gap-2">
              <Plus className="w-4 h-4" />Inserir medicação regular
            </button>
          )}
        </div>
      </div>

      {prescricoes.length === 0 ? (
        <div className="card text-center py-12"><p className="text-muted">Nenhuma medicação regular cadastrada para este morador.</p></div>
      ) : (
        <div className="space-y-4">
          {prescricoes.map(presc => (
            <div key={presc.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Prescrição de {formatDate(presc.data_inicio)}
                    {presc.data_fim && ` a ${formatDate(presc.data_fim)}`}
                    {!presc.data_fim && ' (contínua)'}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {(presc as any).prescrito_por_user?.nome_completo}
                    {(presc as any).prescrito_por_user?.registro_profissional && ` · ${(presc as any).prescrito_por_user.registro_profissional}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {presc.validado_por ? (
                    <span className="text-xs flex items-center gap-1 text-green-700 font-semibold"><CheckCircle className="w-3.5 h-3.5" />Validada</span>
                  ) : (
                    <span className="text-xs flex items-center gap-1 text-yellow-700 font-semibold"><Clock className="w-3.5 h-3.5" />Pendente</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${presc.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {presc.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(presc.itens ?? []).filter((i: PrescricaoItem) => i.ativo).map((item: PrescricaoItem) => (
                  <div key={item.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-primary-50 text-sm">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${item.tipo === 'medicamento' ? 'bg-blue-100 text-blue-800' : item.tipo === 'dieta' ? 'bg-orange-100 text-orange-800' : 'bg-purple-100 text-purple-800'}`}>
                      {item.tipo.toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{item.descricao}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {[item.dose, item.via, item.frequencia].filter(Boolean).join(' · ')}
                        {item.horarios?.length ? ` — ${item.horarios.join(', ')}` : ''}
                        {item.duracao ? ` — ${item.duracao}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal nova prescrição */}
      {showNova && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <h2 className="text-lg font-bold">Inserir medicação regular</h2>
            <p className="text-sm text-muted">Os medicamentos ativos com horários definidos serão puxados automaticamente para o diário diário de medicações do paciente.</p>
            {residente.alergias && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 font-semibold">⚠ Alergias: {residente.alergias}</div>}

            {itens.map((item, idx) => (
              <div key={idx} className="p-4 border border-border rounded-lg space-y-3 relative">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-primary-800">Item {idx + 1}</p>
                  {itens.length > 1 && <button type="button" onClick={() => setItens(itens.filter((_, i) => i !== idx))} className="text-muted hover:text-red-500"><X className="w-4 h-4" /></button>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Tipo</label>
                    <select value={item.tipo} onChange={e => { const n=[...itens];n[idx]={...item,tipo:e.target.value};setItens(n) }} className="input">
                      <option value="medicamento">Medicamento</option>
                      <option value="procedimento">Procedimento</option>
                      <option value="dieta">Dieta</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Nome / Descrição *</label>
                    <input value={item.descricao} onChange={e => { const n=[...itens];n[idx]={...item,descricao:e.target.value};setItens(n) }} className="input" placeholder={item.tipo==='medicamento'?'Ex: Losartana 50mg':'Descrição'} />
                  </div>
                </div>

                {item.tipo === 'medicamento' && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div><label className="label">Dose</label><input value={item.dose} onChange={e => { const n=[...itens];n[idx]={...item,dose:e.target.value};setItens(n) }} className="input" placeholder="Ex: 1 comprimido" /></div>
                      <div><label className="label">Via</label>
                        <select value={item.via} onChange={e => { const n=[...itens];n[idx]={...item,via:e.target.value};setItens(n) }} className="input">
                          {VIAS.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div><label className="label">Frequência</label><input value={item.frequencia} onChange={e => { const n=[...itens];n[idx]={...item,frequencia:e.target.value};setItens(n) }} className="input" placeholder="Ex: 2x/dia" /></div>
                    </div>
                    <div>
                      <label className="label">Horários</label>
                      <div className="flex flex-wrap gap-1.5">
                        {HORARIOS_PADRAO.map(h => (
                          <button key={h} type="button" onClick={() => toggleHorario(idx, h)}
                            className={`px-2.5 py-1 rounded text-xs font-medium border-2 transition-all ${item.horarios.includes(h) ? 'border-primary-800 bg-primary-800 text-white' : 'border-border text-muted hover:border-primary-300'}`}>
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div><label className="label">Duração</label><input value={item.duracao} onChange={e => { const n=[...itens];n[idx]={...item,duracao:e.target.value};setItens(n) }} className="input" placeholder="Ex: 7 dias, contínuo" /></div>
                  </>
                )}
              </div>
            ))}

            <button type="button" onClick={() => setItens([...itens, { ...ITEM_VAZIO }])} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" />Adicionar item
            </button>

            <div><label className="label">Observações gerais</label><textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input min-h-[70px] resize-y" /></div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowNova(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={salvarPrescricao} disabled={isPending} className="btn-accent flex-1">{isPending ? 'Salvando...' : 'Salvar medicação regular'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
