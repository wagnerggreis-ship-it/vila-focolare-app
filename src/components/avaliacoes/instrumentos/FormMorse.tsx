'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcularMorse, type MorseRespostas } from '@/lib/utils/avaliacoes'

const ITENS: { key: keyof MorseRespostas; label: string; opcoes: { valor: number; label: string }[] }[] = [
  { key: 'historico_queda', label: 'Histórico de quedas (últimos 3 meses)', opcoes: [{ valor: 0, label: '0 — Não' }, { valor: 25, label: '25 — Sim' }] },
  { key: 'diagnostico_secundario', label: 'Diagnóstico secundário', opcoes: [{ valor: 0, label: '0 — Não' }, { valor: 15, label: '15 — Sim' }] },
  { key: 'auxilio_ambulacao', label: 'Auxílio para deambulação', opcoes: [{ valor: 0, label: '0 — Nenhum / Acamada / Aux. Enf.' }, { valor: 15, label: '15 — Muletas / Bengala / Andador' }, { valor: 30, label: '30 — Segura em móveis' }] },
  { key: 'terapia_intravenosa', label: 'Terapia intravenosa / heparina lock', opcoes: [{ valor: 0, label: '0 — Não' }, { valor: 20, label: '20 — Sim' }] },
  { key: 'marcha', label: 'Marcha', opcoes: [{ valor: 0, label: '0 — Normal / Acamada / Cadeira de rodas' }, { valor: 10, label: '10 — Debilitada' }, { valor: 20, label: '20 — Comprometida' }] },
  { key: 'estado_mental', label: 'Estado mental', opcoes: [{ valor: 0, label: '0 — Orientada quanto às próprias capacidades' }, { valor: 15, label: '15 — Superestima suas capacidades / esquece limitações' }] },
]

const COR_RISCO = (score: number) =>
  score < 25 ? 'bg-green-50 border-green-200 text-green-800' :
  score < 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
  'bg-red-50 border-red-200 text-red-800'

interface Props { residenteId: string; userId: string; onSaved: () => void }

export default function FormMorse({ residenteId, userId, onSaved }: Props) {
  const [respostas, setRespostas] = useState<Partial<MorseRespostas>>({})
  const [observacoes, setObservacoes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const completo = Object.keys(respostas).length === ITENS.length
  const resultado = completo ? calcularMorse(respostas as MorseRespostas) : null

  async function salvar() {
    if (!completo) return
    const supabase = createClient()
    const { score, classificacao } = calcularMorse(respostas as MorseRespostas)
    startTransition(async () => {
      const { error: e } = await supabase.from('avaliacoes_funcionais').insert({
        residente_id: residenteId, avaliador_id: userId,
        tipo_avaliacao: 'morse', respostas,
        score_total: score, classificacao,
        observacoes: observacoes || null,
        data_avaliacao: new Date().toISOString().split('T')[0],
      })
      if (e) { setError(e.message); return }
      onSaved()
    })
  }

  return (
    <div className="card space-y-4">
      <p className="text-sm text-muted border-b border-border pb-3">Avalia o risco de quedas. Score ≥ 50 = alto risco.</p>
      {ITENS.map(({ key, label, opcoes }) => (
        <div key={key}>
          <p className="text-sm font-bold text-foreground mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
            {opcoes.map(({ valor, label: l }) => (
              <button key={valor} type="button" onClick={() => setRespostas({ ...respostas, [key]: valor as any })}
                className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${respostas[key] === valor ? 'border-primary-800 bg-primary-50 text-primary-800' : 'border-border hover:border-primary-300'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      ))}

      {resultado && (
        <div className={`p-4 rounded-lg border ${COR_RISCO(resultado.score)}`}>
          <p className="text-2xl font-bold">{resultado.score} <span className="text-sm font-normal opacity-70">pontos</span></p>
          <p className="text-sm font-semibold mt-0.5">{resultado.classificacao}</p>
        </div>
      )}

      <div>
        <label className="label">Observações</label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input min-h-[80px] resize-y" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={salvar} disabled={!completo || isPending} className="btn-accent w-full">{isPending ? 'Salvando...' : 'Salvar avaliação'}</button>
    </div>
  )
}
