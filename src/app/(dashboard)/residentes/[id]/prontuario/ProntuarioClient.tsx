'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import { formatDateTime } from '@/lib/utils/formatters'
import { TIPO_NOTA_LABELS, NOTA_COLORS, ROLE_SHORT } from '@/lib/utils/formatters'
import { Plus, FileText, Edit2 } from 'lucide-react'
import type { NotaProntuario, TipoNota, NivelRisco } from '@/lib/types/database'

const TIPO_NOTA_LABELS_LOCAL: Record<TipoNota, string> = {
  medico: 'Médico', enfermagem: 'Enfermagem', fisioterapia: 'Fisioterapia',
  nutricao: 'Nutrição', psicologia: 'Psicologia', social: 'Serviço Social',
  to: 'Terapia Ocupacional', farmacia: 'Farmácia',
}

const NOTA_COLORS_LOCAL: Record<TipoNota, string> = {
  medico: 'bg-blue-100 text-blue-800', enfermagem: 'bg-emerald-100 text-emerald-800',
  fisioterapia: 'bg-purple-100 text-purple-800', nutricao: 'bg-orange-100 text-orange-800',
  psicologia: 'bg-pink-100 text-pink-800', social: 'bg-teal-100 text-teal-800',
  to: 'bg-indigo-100 text-indigo-800', farmacia: 'bg-yellow-100 text-yellow-800',
}

const ROLE_TO_NOTA: Record<string, TipoNota> = {
  medico: 'medico', admin: 'medico', enfermeiro: 'enfermagem',
  tecnico_enfermagem: 'enfermagem', fisioterapeuta: 'fisioterapia',
  nutricionista: 'nutricao', psicologo: 'psicologia',
  assistente_social: 'social', terapeuta_ocupacional: 'to', farmaceutico: 'farmacia',
}

interface Props {
  residente: { id: string; nome: string; nivel_risco: NivelRisco }
  notas: any[]
  currentUser: any
}

export default function ProntuarioClient({ residente, notas: initialNotas, currentUser }: Props) {
  const [notas, setNotas] = useState(initialNotas)
  const [filtro, setFiltro] = useState<TipoNota | 'todos'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ titulo: '', subjetivo: '', objetivo: '', avaliacao: '', plano: '', evolucao: '' })

  const tipoNota = currentUser ? (ROLE_TO_NOTA[currentUser.role] ?? 'medico') : 'medico'
  const isMedico = tipoNota === 'medico'

  const notasFiltradas = filtro === 'todos' ? notas : notas.filter(n => n.tipo_nota === filtro)

  async function salvarNota() {
    const supabase = createClient()
    const conteudo = isMedico
      ? { subjetivo: form.subjetivo, objetivo: form.objetivo, avaliacao: form.avaliacao, plano: form.plano }
      : { evolucao: form.evolucao }
    const conteudo_texto = isMedico
      ? `S: ${form.subjetivo}\nO: ${form.objetivo}\nA: ${form.avaliacao}\nP: ${form.plano}`
      : form.evolucao

    startTransition(async () => {
      const { data, error } = await supabase.from('notas_prontuario').insert({
        residente_id: residente.id,
        autor_id: currentUser.id,
        tipo_nota: tipoNota,
        titulo: form.titulo || null,
        conteudo,
        conteudo_texto,
      }).select('*, autor:autor_id(id, nome_completo, role, registro_profissional)').single()

      if (!error && data) {
        setNotas([data, ...notas])
        setShowModal(false)
        setForm({ titulo: '', subjetivo: '', objetivo: '', avaliacao: '', plano: '', evolucao: '' })
      }
    })
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              <h1 className="text-xl font-bold text-foreground">Prontuário</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted text-sm">{residente.nome}</span>
              <SemaforoRisco nivel={residente.nivel_risco} size="sm" />
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-accent flex items-center gap-2 self-start">
            <Plus className="w-4 h-4" />
            Nova nota de evolução
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filtro === 'todos' ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-muted border-border hover:border-primary-300'}`}
        >
          Todos ({notas.length})
        </button>
        {Object.entries(TIPO_NOTA_LABELS_LOCAL).map(([tipo, label]) => {
          const count = notas.filter(n => n.tipo_nota === tipo).length
          if (count === 0) return null
          return (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo as TipoNota)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${filtro === tipo ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-muted border-border hover:border-primary-300'}`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      {notasFiltradas.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted">Nenhuma nota encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notasFiltradas.map((nota) => {
            const editavel = nota.editavel_ate && new Date(nota.editavel_ate) > new Date()
            const isAutor = currentUser?.id === nota.autor_id
            const cor = NOTA_COLORS_LOCAL[nota.tipo_nota as TipoNota] ?? 'bg-gray-100 text-gray-800'

            return (
              <div key={nota.id} className="card-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cor}`}>
                      {TIPO_NOTA_LABELS_LOCAL[nota.tipo_nota as TipoNota]}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {nota.autor?.nome_completo ?? 'Profissional'}
                        </span>
                        {nota.autor?.registro_profissional && (
                          <span className="text-xs text-muted">({nota.autor.registro_profissional})</span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-0.5">{formatDateTime(nota.created_at)}</p>
                    </div>
                  </div>
                  {editavel && isAutor && (
                    <button className="btn-ghost p-1.5 text-xs flex items-center gap-1">
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </button>
                  )}
                </div>

                {nota.titulo && (
                  <p className="mt-2 font-semibold text-sm text-foreground">{nota.titulo}</p>
                )}

                {/* Conteúdo SOAP para médicos */}
                {nota.tipo_nota === 'medico' && nota.conteudo && (
                  <div className="mt-3 space-y-2">
                    {['subjetivo', 'objetivo', 'avaliacao', 'plano'].map(campo => (
                      nota.conteudo[campo] && (
                        <div key={campo}>
                          <span className="text-xs font-bold text-primary-700 uppercase">
                            {campo === 'subjetivo' ? 'S' : campo === 'objetivo' ? 'O' : campo === 'avaliacao' ? 'A' : 'P'} —{' '}
                          </span>
                          <span className="text-sm text-foreground">{nota.conteudo[campo]}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Conteúdo livre */}
                {nota.tipo_nota !== 'medico' && nota.conteudo?.evolucao && (
                  <p className="mt-3 text-sm text-foreground whitespace-pre-line">{nota.conteudo.evolucao}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nova nota */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Nova Nota de Evolução</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${NOTA_COLORS_LOCAL[tipoNota]}`}>
                  {TIPO_NOTA_LABELS_LOCAL[tipoNota]}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Título (opcional)</label>
                  <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} className="input" placeholder="Título da nota" />
                </div>

                {isMedico ? (
                  <>
                    {[
                      { key: 'subjetivo', label: 'S — Subjetivo', placeholder: 'Queixa principal, história relatada pela residente...' },
                      { key: 'objetivo', label: 'O — Objetivo', placeholder: 'Exame físico, sinais vitais, dados objetivos...' },
                      { key: 'avaliacao', label: 'A — Avaliação', placeholder: 'Análise clínica, diagnósticos, hipóteses...' },
                      { key: 'plano', label: 'P — Plano', placeholder: 'Condutas, ajustes de medicação, encaminhamentos...' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="label">{label}</label>
                        <textarea
                          value={form[key as keyof typeof form]}
                          onChange={e => setForm({...form, [key]: e.target.value})}
                          className="input min-h-[80px] resize-y"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div>
                    <label className="label">Evolução *</label>
                    <textarea
                      value={form.evolucao}
                      onChange={e => setForm({...form, evolucao: e.target.value})}
                      className="input min-h-[160px] resize-y"
                      placeholder="Descreva a evolução do paciente, condutas realizadas, observações relevantes..."
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={salvarNota} disabled={isPending} className="btn-accent flex-1">
                  {isPending ? 'Salvando...' : 'Salvar nota'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
