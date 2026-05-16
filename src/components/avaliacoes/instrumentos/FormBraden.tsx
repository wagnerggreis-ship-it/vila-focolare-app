'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcularBraden, type BradenRespostas } from '@/lib/utils/avaliacoes'

const ITENS: { key: keyof BradenRespostas; label: string; opcoes: { valor: number; label: string; desc: string }[] }[] = [
  {
    key: 'percepcao_sensorial', label: 'Percepção Sensorial',
    opcoes: [
      { valor: 1, label: '1 — Completamente limitada', desc: 'Não responde a estímulos dolorosos' },
      { valor: 2, label: '2 — Muito limitada', desc: 'Responde apenas a estímulos dolorosos' },
      { valor: 3, label: '3 — Levemente limitada', desc: 'Responde a comandos verbais, mas nem sempre comunica o desconforto' },
      { valor: 4, label: '4 — Sem limitação', desc: 'Responde a comandos verbais; sem déficit sensorial' },
    ],
  },
  {
    key: 'umidade', label: 'Umidade da Pele',
    opcoes: [
      { valor: 1, label: '1 — Constantemente úmida', desc: 'Pele sempre molhada de suor, urina, etc.' },
      { valor: 2, label: '2 — Muito úmida', desc: 'Pele frequentemente úmida — troca de roupa ao menos 1x/turno' },
      { valor: 3, label: '3 — Ocasionalmente úmida', desc: 'Pele úmida aproximadamente 1x/dia' },
      { valor: 4, label: '4 — Raramente úmida', desc: 'Pele geralmente seca — troca rotineira' },
    ],
  },
  {
    key: 'atividade', label: 'Atividade Física',
    opcoes: [
      { valor: 1, label: '1 — Acamada', desc: 'Confinada ao leito' },
      { valor: 2, label: '2 — Confinada à cadeira', desc: 'Capacidade de deambulação muito limitada' },
      { valor: 3, label: '3 — Anda ocasionalmente', desc: 'Pequenas distâncias, com ou sem ajuda' },
      { valor: 4, label: '4 — Anda frequentemente', desc: 'Fora do quarto ao menos 2x/dia' },
    ],
  },
  {
    key: 'mobilidade', label: 'Mobilidade',
    opcoes: [
      { valor: 1, label: '1 — Completamente imóvel', desc: 'Não muda a posição do corpo/extremidades sem ajuda' },
      { valor: 2, label: '2 — Muito limitada', desc: 'Muda ocasionalmente de posição com pequenas mudanças' },
      { valor: 3, label: '3 — Levemente limitada', desc: 'Muda frequentemente de posição com pequenas mudanças' },
      { valor: 4, label: '4 — Sem limitação', desc: 'Muda de posição frequentemente sem ajuda' },
    ],
  },
  {
    key: 'nutricao', label: 'Nutrição',
    opcoes: [
      { valor: 1, label: '1 — Muito pobre', desc: 'Nunca come refeição completa; < 1/3 do oferecido' },
      { valor: 2, label: '2 — Provavelmente inadequada', desc: 'Raramente come > 1/2 refeição' },
      { valor: 3, label: '3 — Adequada', desc: 'Come > 1/2 das refeições' },
      { valor: 4, label: '4 — Excelente', desc: 'Come a maioria de cada refeição; NPT adequada' },
    ],
  },
  {
    key: 'friccao_cisalhamento', label: 'Fricção e Cisalhamento',
    opcoes: [
      { valor: 1, label: '1 — Problema', desc: 'Necessita de ajuda moderada a máxima; arrasta na cama' },
      { valor: 2, label: '2 — Problema potencial', desc: 'Move-se com alguma dificuldade; pele provavelmente arrasta' },
      { valor: 3, label: '3 — Sem problema aparente', desc: 'Move-se na cama e cadeira sem ajuda; sustenta-se' },
    ],
  },
]

const COR_RISCO: Record<string, string> = {
  verde: 'bg-green-50 border-green-200 text-green-800',
  amarelo: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  laranja: 'bg-orange-50 border-orange-200 text-orange-800',
  vermelho: 'bg-red-50 border-red-200 text-red-800',
}

interface Props { residenteId: string; userId: string; onSaved: () => void }

export default function FormBraden({ residenteId, userId, onSaved }: Props) {
  const [respostas, setRespostas] = useState<Partial<BradenRespostas>>({})
  const [observacoes, setObservacoes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const completo = Object.keys(respostas).length === ITENS.length
  const resultado = completo ? calcularBraden(respostas as BradenRespostas) : null

  async function salvar() {
    if (!completo) return
    const supabase = createClient()
    const { score, classificacao } = calcularBraden(respostas as BradenRespostas)
    startTransition(async () => {
      const { error: e } = await supabase.from('avaliacoes_funcionais').insert({
        residente_id: residenteId, avaliador_id: userId,
        tipo_avaliacao: 'braden', respostas,
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
      <p className="text-sm text-muted border-b border-border pb-3">
        Avalia o risco de lesão por pressão. <strong>Quanto menor o score, maior o risco.</strong> Score mínimo: 6 | Máximo: 23.
      </p>

      {ITENS.map(({ key, label, opcoes }) => (
        <div key={key}>
          <p className="text-sm font-bold text-foreground mb-2">{label}</p>
          <div className="space-y-1.5">
            {opcoes.map(({ valor, label: optLabel, desc }) => (
              <button
                key={valor}
                type="button"
                onClick={() => setRespostas({ ...respostas, [key]: valor as any })}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  respostas[key] === valor
                    ? 'border-primary-800 bg-primary-50'
                    : 'border-border hover:border-primary-300'
                }`}
              >
                <p className="text-xs font-bold text-foreground">{optLabel}</p>
                <p className="text-xs text-muted mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      {resultado && (
        <div className={`p-4 rounded-lg border ${COR_RISCO[resultado.corRisco]}`}>
          <p className="text-2xl font-bold">{resultado.score}<span className="text-sm font-normal opacity-70">/23</span></p>
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
