'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcularKatz, type KatzRespostas } from '@/lib/utils/avaliacoes'

const ITENS = [
  { key: 'banho' as const, label: 'Banho', dep: 'Necessita de assistência para banhar mais de uma parte do corpo', ind: 'Banha-se completamente sem ajuda ou entra/sai da banheira/chuveiro sem ajuda' },
  { key: 'vestir' as const, label: 'Vestir-se', dep: 'Necessita de ajuda para vestir-se, ou fica parcialmente vestido', ind: 'Veste-se completamente sem ajuda (incluindo botões e fechos)' },
  { key: 'higiene' as const, label: 'Higiene íntima', dep: 'Necessita de ajuda para ir ao banheiro, higienizar-se ou usar fraldas', ind: 'Vai ao banheiro, higieniza-se e arruma as roupas sem ajuda' },
  { key: 'transferencia' as const, label: 'Transferência', dep: 'Necessita de ajuda para levantar ou deitar-se; usa cadeira de rodas', ind: 'Levanta e deita da cama/cadeira sem ajuda' },
  { key: 'continencia' as const, label: 'Continência', dep: 'Incontinência total ou parcial; usa cateter ou fralda', ind: 'Controla totalmente a bexiga e o intestino' },
  { key: 'alimentacao' as const, label: 'Alimentação', dep: 'Necessita de ajuda parcial ou total para se alimentar', ind: 'Alimenta-se sozinha sem ajuda' },
]

interface Props { residenteId: string; userId: string; onSaved: () => void }

export default function FormKatz({ residenteId, userId, onSaved }: Props) {
  const [respostas, setRespostas] = useState<Partial<KatzRespostas>>({})
  const [observacoes, setObservacoes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const completo = Object.keys(respostas).length === ITENS.length
  const resultado = completo ? calcularKatz(respostas as KatzRespostas) : null

  async function salvar() {
    if (!completo) return
    const supabase = createClient()
    const { score, classificacao } = calcularKatz(respostas as KatzRespostas)
    startTransition(async () => {
      const { error: e } = await supabase.from('avaliacoes_funcionais').insert({
        residente_id: residenteId, avaliador_id: userId,
        tipo_avaliacao: 'katz', respostas,
        score_total: score, classificacao,
        observacoes: observacoes || null,
        data_avaliacao: new Date().toISOString().split('T')[0],
      })
      if (e) { setError(e.message); return }
      onSaved()
    })
  }

  return (
    <div className="card space-y-5">
      <div className="border-b border-border pb-4">
        <p className="text-sm text-muted">Avalie a independência da residente em cada atividade. Marque <strong>Independente</strong> quando realiza sem qualquer ajuda.</p>
      </div>

      {ITENS.map(({ key, label, dep, ind }) => (
        <div key={key} className="space-y-2">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[{ valor: 0, texto: dep, rotulo: '0 — Dependente' }, { valor: 1, texto: ind, rotulo: '1 — Independente' }].map(({ valor, texto, rotulo }) => (
              <button
                key={valor}
                type="button"
                onClick={() => setRespostas({ ...respostas, [key]: valor as 0 | 1 })}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  respostas[key] === valor
                    ? valor === 0
                      ? 'border-red-400 bg-red-50'
                      : 'border-green-400 bg-green-50'
                    : 'border-border hover:border-primary-300 bg-white'
                }`}
              >
                <p className={`text-xs font-bold mb-1 ${valor === 0 ? 'text-red-700' : 'text-green-700'}`}>{rotulo}</p>
                <p className="text-xs text-muted leading-relaxed">{texto}</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {resultado && (
        <div className={`p-4 rounded-lg ${resultado.score >= 4 ? 'bg-green-50 border border-green-200' : resultado.score >= 2 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
          <p className="text-2xl font-bold text-foreground">{resultado.score}<span className="text-sm font-normal text-muted">/6</span></p>
          <p className="text-sm font-semibold mt-0.5">{resultado.classificacao}</p>
        </div>
      )}

      <div>
        <label className="label">Observações clínicas</label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input min-h-[80px] resize-y" placeholder="Contexto clínico relevante para esta avaliação..." />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button onClick={salvar} disabled={!completo || isPending} className="btn-accent w-full">
        {isPending ? 'Salvando...' : 'Salvar avaliação'}
      </button>
    </div>
  )
}
