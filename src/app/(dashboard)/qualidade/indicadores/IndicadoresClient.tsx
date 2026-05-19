'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/formatters'
import { TrendingDown, TrendingUp, Plus, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'

interface IndicadoresAuto {
  pctRotinaHoje: number
  completosHoje: number
  totalResidentes: number
  pctAderencia: number | null
  totalAdms: number
  admAdministradas: number
  admRecusadas: number
  totalRotinaMes: number
  rotinaAlimentacaoRuim: number
  totalIncMes: number
  incAbertos: number
  quedas: number
  quaseQuedas: number
  errosMed: number
  idsEmergencia: number
}

interface Props {
  indicadores: any[]
  medicoesPorIndicador: Record<string, any[]>
  indicadoresAuto: IndicadoresAuto
  isAdmin: boolean
  userId: string
}

function AutoCard({
  label, valor, unidade, meta, status, descricao,
}: {
  label: string
  valor: string | number
  unidade?: string
  meta?: string
  status: 'ok' | 'alerta' | 'critico' | 'neutro'
  descricao?: string
}) {
  const colors = {
    ok:      'border-l-green-500 bg-green-50/30',
    alerta:  'border-l-yellow-500 bg-yellow-50/30',
    critico: 'border-l-red-500 bg-red-50/30',
    neutro:  'border-l-primary-300',
  }
  const textColors = {
    ok: 'text-green-700', alerta: 'text-yellow-700', critico: 'text-red-700', neutro: 'text-primary-800',
  }
  const icons = {
    ok: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    alerta: <Clock className="w-4 h-4 text-yellow-500" />,
    critico: <AlertTriangle className="w-4 h-4 text-red-500" />,
    neutro: null,
  }

  return (
    <div className={`card-sm border-l-4 ${colors[status]}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-bold text-foreground leading-tight">{label}</p>
        {icons[status]}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${textColors[status]}`}>{valor}</span>
        {unidade && <span className="text-sm text-muted">{unidade}</span>}
      </div>
      {meta && <p className="text-xs text-muted mt-0.5">Meta: {meta}</p>}
      {descricao && <p className="text-xs text-muted mt-1">{descricao}</p>}
    </div>
  )
}

export default function IndicadoresClient({
  indicadores, medicoesPorIndicador, indicadoresAuto, isAdmin, userId,
}: Props) {
  const a = indicadoresAuto
  const [showModal, setShowModal] = useState(false)
  const [medicoes, setMedicoes] = useState(medicoesPorIndicador)
  const [form, setForm] = useState({ indicador_id: '', periodo_inicio: '', periodo_fim: '', valor_calculado: '', observacoes: '' })
  const [isPending, startTransition] = useTransition()

  async function salvarMedicao() {
    const supabase = createClient()
    const indicador = indicadores.find(i => i.id === form.indicador_id)
    if (!indicador) return
    const valor = parseFloat(form.valor_calculado)
    const atingiu = indicador.meta_valor !== null
      ? indicador.meta_direcao === 'menor_melhor' ? valor <= indicador.meta_valor : valor >= indicador.meta_valor
      : null
    startTransition(async () => {
      const { data } = await supabase.from('medicoes_indicadores').insert({
        indicador_id: form.indicador_id,
        periodo_inicio: form.periodo_inicio,
        periodo_fim: form.periodo_fim,
        valor_calculado: valor,
        atingiu_meta: atingiu,
        observacoes: form.observacoes || null,
        created_by: userId,
      }).select().single()
      if (data) {
        setMedicoes(prev => ({ ...prev, [form.indicador_id]: [data, ...(prev[form.indicador_id] ?? [])] }))
        setShowModal(false)
        setForm({ indicador_id: '', periodo_inicio: '', periodo_fim: '', valor_calculado: '', observacoes: '' })
      }
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Indicadores de Qualidade e Segurança</h1>
          <p className="text-muted text-sm">Monitoramento contínuo do cuidado na Villa Focolari</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-accent flex items-center gap-2">
            <Plus className="w-4 h-4" />Registrar medição
          </button>
        )}
      </div>

      {/* ── Indicadores Automáticos — Rotina ── */}
      <section>
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-3">
          Rotina de Cuidado — Hoje
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <AutoCard
            label="Rotinas Completas Hoje"
            valor={`${a.completosHoje}/${a.totalResidentes}`}
            unidade="moradores"
            status={a.completosHoje === a.totalResidentes && a.totalResidentes > 0 ? 'ok' : a.completosHoje > 0 ? 'alerta' : 'critico'}
            descricao={`${a.pctRotinaHoje}% dos moradores com rotina essencial completa`}
          />
          <AutoCard
            label="Alimentação com Alerta"
            valor={a.rotinaAlimentacaoRuim}
            unidade="registros"
            status={a.rotinaAlimentacaoRuim === 0 ? 'ok' : a.rotinaAlimentacaoRuim <= 2 ? 'alerta' : 'critico'}
            descricao="Registros de pouco ou recusa de alimentação este mês"
          />
          <AutoCard
            label="Registros de Rotina"
            valor={a.totalRotinaMes}
            unidade="este mês"
            status="neutro"
            descricao="Total de registros de rotina realizados no mês atual"
          />
        </div>
      </section>

      {/* ── Indicadores Automáticos — Medicações ── */}
      <section>
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-3">
          Medicações — Este Mês
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <AutoCard
            label="Aderência Medicamentosa"
            valor={a.pctAderencia !== null ? `${a.pctAderencia}%` : '—'}
            meta="≥ 95%"
            status={a.pctAderencia === null ? 'neutro' : a.pctAderencia >= 95 ? 'ok' : a.pctAderencia >= 85 ? 'alerta' : 'critico'}
            descricao={`${a.admAdministradas} de ${a.totalAdms} administrações realizadas`}
          />
          <AutoCard
            label="Recusas / Não Administradas"
            valor={a.admRecusadas}
            unidade="registros"
            status={a.admRecusadas === 0 ? 'ok' : a.admRecusadas <= 3 ? 'alerta' : 'critico'}
            descricao="Medicações recusadas ou não administradas com justificativa"
          />
        </div>
      </section>

      {/* ── Indicadores Automáticos — Segurança ── */}
      <section>
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-3">
          Segurança e Intercorrências — Este Mês
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <AutoCard
            label="Intercorrências Abertas"
            valor={a.incAbertos}
            status={a.incAbertos === 0 ? 'ok' : a.incAbertos <= 2 ? 'alerta' : 'critico'}
            descricao="Intercorrências aguardando resolução"
          />
          <AutoCard
            label="Total de Intercorrências"
            valor={a.totalIncMes}
            unidade="este mês"
            status={a.totalIncMes === 0 ? 'ok' : 'neutro'}
          />
          <AutoCard
            label="Quedas"
            valor={a.quedas}
            meta="= 0"
            status={a.quedas === 0 ? 'ok' : a.quedas === 1 ? 'alerta' : 'critico'}
            descricao="Número de quedas registradas este mês"
          />
          <AutoCard
            label="Quase Quedas"
            valor={a.quaseQuedas}
            status={a.quaseQuedas === 0 ? 'ok' : 'alerta'}
          />
          <AutoCard
            label="Erros de Medicação"
            valor={a.errosMed}
            meta="= 0"
            status={a.errosMed === 0 ? 'ok' : 'critico'}
          />
          <AutoCard
            label="Intercorrências Clínicas"
            valor={a.idsEmergencia}
            status={a.idsEmergencia === 0 ? 'ok' : 'alerta'}
            descricao="Eventos clínicos relevantes (hospitalização, emergência)"
          />
        </div>
      </section>

      {/* ── Indicadores Manuais ── */}
      {indicadores.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-3">
            Indicadores Configurados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {indicadores.map(ind => {
              const lista = (medicoes[ind.id] ?? []).slice().reverse()
              const ultima = lista.at(-1)
              const penultima = lista.at(-2)
              let status: 'ok' | 'nok' | 'sem' = 'sem'
              if (ultima) status = ultima.atingiu_meta ? 'ok' : 'nok'
              let tendencia: 'up' | 'down' | 'flat' = 'flat'
              if (ultima && penultima) {
                const diff = ultima.valor_calculado - penultima.valor_calculado
                if (Math.abs(diff) > 0.1) tendencia = diff > 0 ? 'up' : 'down'
              }
              const metaBoa = ind.meta_direcao === 'maior_melhor' ? 'up' : 'down'
              const tendenciaBoa = tendencia === metaBoa

              return (
                <div key={ind.id} className={`card-sm border-l-4 ${status === 'ok' ? 'border-l-green-500' : status === 'nok' ? 'border-l-red-500' : 'border-l-border'}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm font-bold text-foreground leading-tight">{ind.nome}</p>
                    {tendencia !== 'flat' && (
                      <span className={`flex-shrink-0 ${tendenciaBoa ? 'text-green-600' : 'text-red-500'}`}>
                        {tendencia === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                  {ultima ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">{ultima.valor_calculado}</span>
                        <span className="text-sm text-muted">{ind.unidade}</span>
                      </div>
                      {ind.meta_valor !== null && (
                        <p className="text-xs text-muted mt-0.5">Meta: {ind.meta_direcao === 'menor_melhor' ? '≤' : '≥'} {ind.meta_valor} {ind.unidade}</p>
                      )}
                      <p className={`text-xs font-semibold mt-1 ${status === 'ok' ? 'text-green-700' : 'text-red-700'}`}>
                        {status === 'ok' ? '✓ Meta atingida' : '✗ Meta não atingida'}
                      </p>
                      {lista.length > 1 && (
                        <div className="flex items-end gap-1 mt-3 h-10">
                          {lista.map((m, i) => {
                            const maxVal = Math.max(...lista.map((x: any) => x.valor_calculado), ind.meta_valor ?? 0)
                            const pct = maxVal > 0 ? Math.max(10, (m.valor_calculado / maxVal) * 100) : 20
                            return (
                              <div key={i} className={`flex-1 rounded-sm ${m.atingiu_meta ? 'bg-green-400' : 'bg-red-400'}`}
                                style={{ height: `${pct}%` }}
                                title={`${m.valor_calculado} ${ind.unidade} — ${formatDate(m.periodo_fim)}`}
                              />
                            )
                          })}
                        </div>
                      )}
                      <p className="text-[10px] text-muted mt-1">{formatDate(ultima.periodo_fim)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">Sem medições</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Modal de nova medição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Registrar Medição Manual</h2>
            <div>
              <label className="label">Indicador *</label>
              <select value={form.indicador_id} onChange={e => setForm({...form, indicador_id: e.target.value})} className="input">
                <option value="">Selecionar...</option>
                {indicadores.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Início *</label><input type="date" value={form.periodo_inicio} onChange={e => setForm({...form, periodo_inicio: e.target.value})} className="input" /></div>
              <div><label className="label">Fim *</label><input type="date" value={form.periodo_fim} onChange={e => setForm({...form, periodo_fim: e.target.value})} className="input" /></div>
            </div>
            <div><label className="label">Valor *</label><input type="number" step="0.01" value={form.valor_calculado} onChange={e => setForm({...form, valor_calculado: e.target.value})} className="input" /></div>
            <div><label className="label">Observações</label><textarea value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} className="input min-h-[70px]" /></div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={salvarMedicao} disabled={isPending || !form.indicador_id || !form.valor_calculado} className="btn-accent flex-1">{isPending ? '...' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
