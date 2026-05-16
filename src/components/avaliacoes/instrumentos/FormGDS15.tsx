'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcularGDS15, type GDS15Respostas } from '@/lib/utils/avaliacoes'

const PERGUNTAS: { key: keyof GDS15Respostas; pergunta: string; depressivo: boolean }[] = [
  { key: 'satisfeito_com_vida', pergunta: 'Está satisfeita com sua vida?', depressivo: false },
  { key: 'abandonou_atividades', pergunta: 'Abandonou muitas de suas atividades e interesses?', depressivo: true },
  { key: 'vida_vazia', pergunta: 'Sente que sua vida está vazia?', depressivo: true },
  { key: 'entediado', pergunta: 'Fica frequentemente aborrecida ou entediada?', depressivo: true },
  { key: 'bem_humorado', pergunta: 'Está de bom humor na maioria do tempo?', depressivo: false },
  { key: 'medo_algo_ruim', pergunta: 'Tem medo de que algo ruim vá lhe acontecer?', depressivo: true },
  { key: 'feliz_maior_tempo', pergunta: 'Sente-se feliz na maior parte do tempo?', depressivo: false },
  { key: 'desamparado', pergunta: 'Sente-se frequentemente desamparada?', depressivo: true },
  { key: 'prefere_ficar_em_casa', pergunta: 'Prefere ficar em casa a sair e fazer coisas novas?', depressivo: true },
  { key: 'problemas_memoria', pergunta: 'Acha que tem mais problemas de memória do que a maioria?', depressivo: true },
  { key: 'maravilhoso_estar_vivo', pergunta: 'Acha que é maravilhoso estar viva agora?', depressivo: false },
  { key: 'inutil', pergunta: 'Sente-se inútil do jeito que está agora?', depressivo: true },
  { key: 'cheio_energia', pergunta: 'Sente-se cheia de energia?', depressivo: false },
  { key: 'situacao_sem_esperanca', pergunta: 'Sente que sua situação não tem esperança?', depressivo: true },
  { key: 'maioria_melhor', pergunta: 'Acha que a maioria das pessoas está em melhor situação que você?', depressivo: true },
]

interface Props { residenteId: string; userId: string; onSaved: () => void }

export default function FormGDS15({ residenteId, userId, onSaved }: Props) {
  const [respostas, setRespostas] = useState<Partial<GDS15Respostas>>({})
  const [observacoes, setObservacoes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const completo = Object.keys(respostas).length === 15
  const resultado = completo ? calcularGDS15(respostas as GDS15Respostas) : null

  async function salvar() {
    if (!completo) return
    const supabase = createClient()
    const { score, classificacao } = calcularGDS15(respostas as GDS15Respostas)
    startTransition(async () => {
      const { error: e } = await supabase.from('avaliacoes_funcionais').insert({
        residente_id: residenteId, avaliador_id: userId,
        tipo_avaliacao: 'gds15', respostas,
        score_total: score, classificacao,
        observacoes: observacoes || null,
        data_avaliacao: new Date().toISOString().split('T')[0],
      })
      if (e) { setError(e.message); return }
      onSaved()
    })
  }

  return (
    <div className="card space-y-3">
      <p className="text-sm text-muted border-b border-border pb-3">
        Aplique as perguntas verbalmente. Registre a primeira resposta espontânea. Score ≥ 5 indica depressão.
      </p>

      {PERGUNTAS.map(({ key, pergunta }, idx) => (
        <div key={key} className={`p-3 rounded-lg ${respostas[key] !== undefined ? 'bg-primary-50' : 'bg-white border border-border'}`}>
          <p className="text-sm text-foreground mb-2">
            <span className="text-muted text-xs mr-2">{idx + 1}.</span>
            {pergunta}
          </p>
          <div className="flex gap-2">
            {['Sim', 'Não'].map(resp => {
              const valor = resp === 'Sim'
              return (
                <button key={resp} type="button"
                  onClick={() => setRespostas({ ...respostas, [key]: valor })}
                  className={`px-4 py-1.5 rounded-lg border-2 text-xs font-bold transition-all ${
                    respostas[key] === valor ? 'border-primary-800 bg-primary-800 text-white' : 'border-border text-muted hover:border-primary-300'
                  }`}>
                  {resp}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {resultado && (
        <div className={`p-4 rounded-lg border ${resultado.score <= 4 ? 'bg-green-50 border-green-200' : resultado.score <= 8 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-2xl font-bold">{resultado.score}<span className="text-sm font-normal text-muted">/15</span></p>
          <p className="text-sm font-semibold mt-0.5">{resultado.classificacao}</p>
        </div>
      )}

      <div>
        <label className="label">Observações clínicas</label>
        <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} className="input min-h-[80px] resize-y" placeholder="Contexto, comportamento durante a avaliação, outras observações..." />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={salvar} disabled={!completo || isPending} className="btn-accent w-full">{isPending ? 'Salvando...' : 'Salvar avaliação'}</button>
    </div>
  )
}
