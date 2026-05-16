'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { classificarPPS, PPS_SCORES, type PPSScore } from '@/lib/utils/avaliacoes'

const PPS_TABELA: Record<PPSScore, { deambulacao: string; atividade: string; autocuidado: string; ingesta: string; consciencia: string }> = {
  100: { deambulacao: 'Normal', atividade: 'Normal / sem evidência de doença', autocuidado: 'Total', ingesta: 'Normal', consciencia: 'Lúcida' },
  90:  { deambulacao: 'Normal', atividade: 'Normal / alguma evidência de doença', autocuidado: 'Total', ingesta: 'Normal', consciencia: 'Lúcida' },
  80:  { deambulacao: 'Normal', atividade: 'Atividade normal com esforço / doença evidente', autocuidado: 'Total', ingesta: 'Normal ou reduzida', consciencia: 'Lúcida' },
  70:  { deambulacao: 'Reduzida', atividade: 'Incapaz de trabalho / doença evidente', autocuidado: 'Total', ingesta: 'Normal ou reduzida', consciencia: 'Lúcida' },
  60:  { deambulacao: 'Reduzida', atividade: 'Incapaz da maioria das atividades / doença evidente', autocuidado: 'Assistência ocasional', ingesta: 'Normal ou reduzida', consciencia: 'Lúcida ou confusão' },
  50:  { deambulacao: 'Predominantemente sentada/deitada', atividade: 'Incapaz de qualquer trabalho / doença extensa', autocuidado: 'Assistência considerável', ingesta: 'Normal ou reduzida', consciencia: 'Lúcida ou confusão' },
  40:  { deambulacao: 'Predominantemente acamada', atividade: 'Incapaz de qualquer atividade / doença extensa', autocuidado: 'Assistência predominante', ingesta: 'Normal ou reduzida', consciencia: 'Lúcida ou sonolenta ± confusão' },
  30:  { deambulacao: 'Acamada', atividade: 'Incapaz de qualquer atividade / doença extensa', autocuidado: 'Cuidados totais', ingesta: 'Normal ou reduzida', consciencia: 'Lúcida ou sonolenta ± confusão' },
  20:  { deambulacao: 'Acamada', atividade: 'Incapaz de qualquer atividade / doença extensa', autocuidado: 'Cuidados totais', ingesta: 'Mínima a pequenos goles', consciencia: 'Lúcida ou sonolenta ± confusão' },
  10:  { deambulacao: 'Acamada', atividade: 'Incapaz de qualquer atividade / doença extensa', autocuidado: 'Cuidados totais', ingesta: 'Cuidados com a boca apenas', consciencia: 'Sonolenta ou em coma ± confusão' },
  0:   { deambulacao: '—', atividade: '—', autocuidado: '—', ingesta: '—', consciencia: 'Morte' },
}

interface Props { residenteId: string; userId: string; onSaved: () => void }

export default function FormPPS({ residenteId, userId, onSaved }: Props) {
  const [score, setScore] = useState<PPSScore | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const classificacao = score !== null ? classificarPPS(score) : null

  async function salvar() {
    if (score === null || !observacoes.trim()) return
    const supabase = createClient()
    startTransition(async () => {
      const { error: e } = await supabase.from('avaliacoes_funcionais').insert({
        residente_id: residenteId, avaliador_id: userId,
        tipo_avaliacao: 'pps', respostas: { score },
        score_total: score, classificacao: classificarPPS(score),
        observacoes,
        data_avaliacao: new Date().toISOString().split('T')[0],
      })
      if (e) { setError(e.message); return }
      onSaved()
    })
  }

  return (
    <div className="card space-y-5">
      <div className="border-b border-border pb-3">
        <p className="text-sm text-muted">Selecione o nível que melhor descreve o quadro clínico atual. A <strong>observação clínica é obrigatória</strong> para fundamentar a escolha.</p>
      </div>

      {/* Tabela de referência */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-3 py-2 text-left font-bold text-primary-800 w-12">%</th>
              <th className="px-3 py-2 text-left font-bold text-primary-800">Deambulação</th>
              <th className="px-3 py-2 text-left font-bold text-primary-800">Atividade</th>
              <th className="px-3 py-2 text-left font-bold text-primary-800">Autocuidado</th>
              <th className="px-3 py-2 text-left font-bold text-primary-800">Ingesta</th>
              <th className="px-3 py-2 text-left font-bold text-primary-800">Consciência</th>
            </tr>
          </thead>
          <tbody>
            {PPS_SCORES.slice().reverse().map(s => {
              const row = PPS_TABELA[s]
              const selected = score === s
              return (
                <tr
                  key={s}
                  onClick={() => setScore(s)}
                  className={`cursor-pointer border-t border-border transition-colors ${selected ? 'bg-primary-100' : 'hover:bg-primary-50'}`}
                >
                  <td className={`px-3 py-2 font-bold ${selected ? 'text-primary-800' : 'text-muted'}`}>{s}%</td>
                  <td className="px-3 py-2 text-foreground">{row.deambulacao}</td>
                  <td className="px-3 py-2 text-foreground">{row.atividade}</td>
                  <td className="px-3 py-2 text-foreground">{row.autocuidado}</td>
                  <td className="px-3 py-2 text-foreground">{row.ingesta}</td>
                  <td className="px-3 py-2 text-foreground">{row.consciencia}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {classificacao && score !== null && (
        <div className={`p-4 rounded-lg border ${score >= 70 ? 'bg-green-50 border-green-200' : score >= 40 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-2xl font-bold">{score}%</p>
          <p className="text-sm font-semibold mt-0.5">{classificacao}</p>
        </div>
      )}

      <div>
        <label className="label">Justificativa clínica * <span className="text-red-500">(obrigatória)</span></label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input min-h-[120px] resize-y" placeholder="Descreva o quadro clínico que fundamenta a escolha deste nível de PPS..." required />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={salvar} disabled={score === null || !observacoes.trim() || isPending} className="btn-accent w-full">
        {isPending ? 'Salvando...' : 'Salvar avaliação PPS'}
      </button>
    </div>
  )
}
