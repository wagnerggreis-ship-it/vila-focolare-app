'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcularBarthel, type BarthelRespostas } from '@/lib/utils/avaliacoes'

const ITENS: { key: keyof BarthelRespostas; label: string; opcoes: { valor: number; label: string }[] }[] = [
  { key: 'alimentacao', label: 'Alimentação', opcoes: [{ valor: 0, label: '0 — Dependente total' }, { valor: 5, label: '5 — Necessita de ajuda' }, { valor: 10, label: '10 — Independente' }] },
  { key: 'banho', label: 'Banho', opcoes: [{ valor: 0, label: '0 — Dependente' }, { valor: 5, label: '5 — Independente' }] },
  { key: 'higiene_pessoal', label: 'Higiene pessoal', opcoes: [{ valor: 0, label: '0 — Necessita de ajuda' }, { valor: 5, label: '5 — Independente' }] },
  { key: 'vestir', label: 'Vestir-se', opcoes: [{ valor: 0, label: '0 — Dependente' }, { valor: 5, label: '5 — Necessita de ajuda' }, { valor: 10, label: '10 — Independente' }] },
  { key: 'bexiga', label: 'Controle da bexiga', opcoes: [{ valor: 0, label: '0 — Incontinente / Cateterizado' }, { valor: 5, label: '5 — Acidentes ocasionais' }, { valor: 10, label: '10 — Continente' }] },
  { key: 'intestino', label: 'Controle do intestino', opcoes: [{ valor: 0, label: '0 — Incontinente' }, { valor: 5, label: '5 — Acidentes ocasionais' }, { valor: 10, label: '10 — Continente' }] },
  { key: 'uso_banheiro', label: 'Uso do banheiro', opcoes: [{ valor: 0, label: '0 — Dependente' }, { valor: 5, label: '5 — Necessita de ajuda' }, { valor: 10, label: '10 — Independente' }] },
  { key: 'transferencia', label: 'Transferência cama/cadeira', opcoes: [{ valor: 0, label: '0 — Não realiza' }, { valor: 5, label: '5 — Grande ajuda (1-2 pessoas)' }, { valor: 10, label: '10 — Pequena ajuda ou supervisão' }, { valor: 15, label: '15 — Independente' }] },
  { key: 'deambulacao', label: 'Deambulação', opcoes: [{ valor: 0, label: '0 — Não deambula' }, { valor: 5, label: '5 — Cadeira de rodas (independente)' }, { valor: 10, label: '10 — Com ajuda de 1 pessoa' }, { valor: 15, label: '15 — Independente (> 50 metros)' }] },
  { key: 'escadas', label: 'Escadas', opcoes: [{ valor: 0, label: '0 — Não consegue' }, { valor: 5, label: '5 — Necessita de ajuda' }, { valor: 10, label: '10 — Independente' }] },
]

interface Props { residenteId: string; userId: string; onSaved: () => void }

export default function FormBarthel({ residenteId, userId, onSaved }: Props) {
  const [respostas, setRespostas] = useState<Partial<BarthelRespostas>>({})
  const [observacoes, setObservacoes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const completo = Object.keys(respostas).length === ITENS.length
  const resultado = completo ? calcularBarthel(respostas as BarthelRespostas) : null

  async function salvar() {
    if (!completo) return
    const supabase = createClient()
    const { score, classificacao } = calcularBarthel(respostas as BarthelRespostas)
    startTransition(async () => {
      const { error: e } = await supabase.from('avaliacoes_funcionais').insert({
        residente_id: residenteId, avaliador_id: userId,
        tipo_avaliacao: 'barthel', respostas,
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
      <p className="text-sm text-muted border-b border-border pb-3">
        Avalie o nível de independência nas atividades de vida diária. Score máximo: 100 pontos.
      </p>

      {ITENS.map(({ key, label, opcoes }) => (
        <div key={key}>
          <p className="text-sm font-bold text-foreground mb-2">{label}</p>
          <div className="flex flex-wrap gap-2">
            {opcoes.map(({ valor, label: optLabel }) => (
              <button
                key={valor}
                type="button"
                onClick={() => setRespostas({ ...respostas, [key]: valor })}
                className={`px-3 py-2 rounded-lg border-2 text-left text-xs font-medium transition-all ${
                  respostas[key] === valor
                    ? 'border-primary-800 bg-primary-50 text-primary-800'
                    : 'border-border hover:border-primary-300 text-foreground'
                }`}
              >
                {optLabel}
              </button>
            ))}
          </div>
        </div>
      ))}

      {resultado && (
        <div className={`p-4 rounded-lg ${resultado.score >= 85 ? 'bg-green-50 border border-green-200' : resultado.score >= 60 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
          <p className="text-2xl font-bold">{resultado.score}<span className="text-sm font-normal text-muted">/100</span></p>
          <p className="text-sm font-semibold mt-0.5">{resultado.classificacao}</p>
        </div>
      )}

      <div>
        <label className="label">Observações</label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input min-h-[80px] resize-y" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={salvar} disabled={!completo || isPending} className="btn-accent w-full">
        {isPending ? 'Salvando...' : 'Salvar avaliação'}
      </button>
    </div>
  )
}
