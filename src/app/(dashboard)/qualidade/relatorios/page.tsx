import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Download, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import { TIPO_INCIDENTE_LABELS } from '@/lib/types/database'
import { subDays, startOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function RelatoriosPage({
  searchParams,
}: { searchParams: { periodo?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const periodo = searchParams.periodo ?? '30d'

  const dataInicio = periodo === '7d'   ? subDays(new Date(), 7)
    : periodo === '30d'  ? subDays(new Date(), 30)
    : periodo === '90d'  ? subDays(new Date(), 90)
    : subDays(new Date(), 365)

  const inicioMes = startOfMonth(new Date())
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [
    { data: residentes },
    { data: incidentes },
    { data: administracoes },
    { data: avaliacoesPeriodo },
    { data: planosPrazo },
    { data: rotinasHoje },
    { data: rotinasPeriodo },
    { data: incidentesMes },
  ] = await Promise.all([
    supabase.from('residentes').select('id, nome, data_admissao, nivel_risco').eq('status', 'ativo'),
    supabase.from('incidentes').select('tipo, gravidade, status, data_hora_evento').gte('data_hora_evento', dataInicio.toISOString()),
    supabase.from('administracoes_medicamento').select('status').gte('horario_previsto', dataInicio.toISOString()),
    supabase.from('avaliacoes_funcionais').select('id').gte('created_at', dataInicio.toISOString()),
    supabase.from('planos_cuidado').select('id, data_revisao_prevista').eq('status', 'ativo').lt('data_revisao_prevista', new Date().toISOString().split('T')[0]),
    supabase.from('registros_rotina').select('residente_id, tipo_rotina').gte('registrado_em', hoje.toISOString()),
    supabase.from('registros_rotina').select('residente_id, tipo_rotina, status').gte('registrado_em', dataInicio.toISOString()),
    supabase.from('incidentes').select('tipo, status, gravidade').gte('created_at', inicioMes.toISOString()),
  ])

  // ── Cálculos gerais ───────────────────────────────────────────────────
  const totalResidentes = residentes?.length ?? 0
  const totalIncidentes = incidentes?.length ?? 0
  const admsAdm   = (administracoes ?? []).filter((a: any) => a.status === 'administrado').length
  const admsTotal = (administracoes ?? []).length
  const aderencia = admsTotal > 0 ? Math.round((admsAdm / admsTotal) * 100) : null
  const planosVencidos = planosPrazo?.length ?? 0

  // ── Cálculos de rotina ────────────────────────────────────────────────
  const tiposEssenciais = ['banho', 'alimentacao', 'evacuacao', 'diurese']
  const rotinasPorRes: Record<string, Set<string>> = {}
  for (const r of rotinasHoje ?? []) {
    if (!rotinasPorRes[r.residente_id]) rotinasPorRes[r.residente_id] = new Set()
    rotinasPorRes[r.residente_id].add(r.tipo_rotina)
  }
  const completosHoje = Object.values(rotinasPorRes).filter(t =>
    tiposEssenciais.every(e => t.has(e))
  ).length
  const pctRotinaHoje = totalResidentes > 0 ? Math.round((completosHoje / totalResidentes) * 100) : 0
  const totalRotinasPeriodo = rotinasPeriodo?.length ?? 0
  const alimentacaoAlerta = (rotinasPeriodo ?? []).filter((r: any) =>
    r.tipo_rotina === 'alimentacao' && ['pouco', 'recusou'].includes(r.status)
  ).length

  // ── Cálculos de segurança ─────────────────────────────────────────────
  const quedas       = (incidentes ?? []).filter((i: any) => i.tipo === 'queda').length
  const quaseQuedas  = (incidentes ?? []).filter((i: any) => i.tipo === 'quase_queda').length
  const errosMed     = (incidentes ?? []).filter((i: any) => i.tipo === 'erro_medicacao').length
  const abertos      = (incidentes ?? []).filter((i: any) => ['aberto', 'investigando'].includes(i.status)).length
  const criticos     = (incidentes ?? []).filter((i: any) => ['nivel_5', 'nivel_6', 'nivel_7'].includes(i.gravidade)).length

  const porTipo: Record<string, number> = {}
  for (const inc of incidentes ?? []) {
    porTipo[inc.tipo] = (porTipo[inc.tipo] ?? 0) + 1
  }

  // ── Moradores por nível de risco ──────────────────────────────────────
  const riscoPorNivel = {
    verde:    (residentes ?? []).filter((r: any) => r.nivel_risco === 'verde').length,
    amarelo:  (residentes ?? []).filter((r: any) => r.nivel_risco === 'amarelo').length,
    laranja:  (residentes ?? []).filter((r: any) => r.nivel_risco === 'laranja').length,
    vermelho: (residentes ?? []).filter((r: any) => r.nivel_risco === 'vermelho').length,
  }

  const mesLabel = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatório Gerencial</h1>
          <p className="text-muted text-sm capitalize">{mesLabel} · Qualidade e Segurança</p>
        </div>
        <div className="flex gap-2">
          {[['7d', '7 dias'], ['30d', '30 dias'], ['90d', '90 dias'], ['365d', '12 meses']].map(([v, l]) => (
            <a key={v} href={`?periodo=${v}`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                periodo === v
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'bg-white text-muted border-border hover:border-primary-300'
              }`}>
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* ── Resumo Executivo ───────────────────────────────────────────── */}
      <div className="card bg-primary-50 border border-primary-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary-800" />
          <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide">Resumo Executivo</h2>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          No período analisado, a Villa Focolari acompanhou{' '}
          <strong>{totalResidentes} moradores ativos</strong>, com{' '}
          <strong>{totalRotinasPeriodo} registros de rotina</strong> realizados pela equipe.
          {aderencia !== null && (
            <> A aderência medicamentosa foi de{' '}
              <strong className={aderencia >= 95 ? 'text-green-700' : 'text-red-700'}>{aderencia}%</strong>
              {aderencia >= 95 ? ' — dentro da meta.' : ' — abaixo da meta de 95%.'}
            </>
          )}
          {totalIncidentes > 0 && (
            <> Foram registradas{' '}
              <strong>{totalIncidentes} intercorrências</strong>
              {criticos > 0 && `, sendo ${criticos} de gravidade elevada`}.
            </>
          )}{' '}
          {quedas === 0
            ? 'Nenhuma queda foi registrada no período.'
            : <><strong className="text-red-700">{quedas} {quedas === 1 ? 'queda registrada' : 'quedas registradas'}</strong> — revisar protocolo de prevenção.</>}
        </p>
      </div>

      {/* ── Cards de Resumo ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Moradores Acompanhados',
            valor: totalResidentes,
            cor: 'text-primary-800',
            href: '/residentes',
          },
          {
            label: 'Intercorrências no Período',
            valor: totalIncidentes,
            cor: totalIncidentes > 0 ? 'text-red-700' : 'text-green-700',
            href: '/incidentes',
          },
          {
            label: 'Aderência Medicamentosa',
            valor: aderencia !== null ? `${aderencia}%` : '—',
            cor: aderencia === null ? 'text-muted' : aderencia >= 95 ? 'text-green-700' : 'text-red-700',
          },
          {
            label: 'Planos de Cuidados Vencidos',
            valor: planosVencidos,
            cor: planosVencidos > 0 ? 'text-orange-700' : 'text-green-700',
          },
        ].map(({ label, valor, cor, href }) => (
          <div key={label} className="card-sm">
            <p className="text-xs text-muted uppercase font-semibold">{label}</p>
            {href ? (
              <Link href={href} className={`text-2xl font-bold mt-1 block hover:underline ${cor}`}>{valor}</Link>
            ) : (
              <p className={`text-2xl font-bold mt-1 ${cor}`}>{valor}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Seção: Rotina de Cuidado ───────────────────────────────────── */}
      <div className="card">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Rotina de Cuidado
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 text-center">
            <p className="text-2xl font-bold text-primary-800">{totalRotinasPeriodo}</p>
            <p className="text-xs text-muted mt-1">Registros no período</p>
          </div>
          <div className={`p-3 rounded-xl border text-center ${
            pctRotinaHoje >= 80 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-2xl font-bold ${pctRotinaHoje >= 80 ? 'text-green-700' : 'text-yellow-700'}`}>
              {pctRotinaHoje}%
            </p>
            <p className="text-xs text-muted mt-1">Rotinas completas hoje</p>
          </div>
          <div className={`p-3 rounded-xl border text-center ${
            alimentacaoAlerta === 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <p className={`text-2xl font-bold ${alimentacaoAlerta === 0 ? 'text-green-700' : 'text-orange-700'}`}>
              {alimentacaoAlerta}
            </p>
            <p className="text-xs text-muted mt-1">Alertas de alimentação</p>
          </div>
          <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 text-center">
            <p className="text-2xl font-bold text-primary-800">{avaliacoesPeriodo?.length ?? 0}</p>
            <p className="text-xs text-muted mt-1">Avaliações realizadas</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Link href="/rotina" className="text-xs text-primary-600 hover:text-primary-800 font-medium">
            Ver Rotina de Cuidado →
          </Link>
        </div>
      </div>

      {/* ── Seção: Segurança ───────────────────────────────────────────── */}
      <div className="card">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Qualidade e Segurança
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Quedas', valor: quedas, alerta: quedas > 0 },
            { label: 'Quase Quedas', valor: quaseQuedas, alerta: quaseQuedas > 0 },
            { label: 'Erros de Medicação', valor: errosMed, alerta: errosMed > 0 },
            { label: 'Intercorrências Abertas', valor: abertos, alerta: abertos > 0 },
          ].map(({ label, valor, alerta }) => (
            <div key={label} className={`p-3 rounded-xl border text-center ${
              alerta ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-2xl font-bold ${alerta ? 'text-red-700' : 'text-green-700'}`}>{valor}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {Object.keys(porTipo).length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-foreground mb-2">Intercorrências por Tipo</h3>
            <div className="space-y-2">
              {Object.entries(porTipo).sort((a, b) => b[1] - a[1]).map(([tipo, qtd]) => {
                const total = Object.values(porTipo).reduce((a, b) => a + b, 0)
                const pct = Math.round((qtd / total) * 100)
                return (
                  <div key={tipo} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-48 truncate">
                      {TIPO_INCIDENTE_LABELS[tipo as keyof typeof TIPO_INCIDENTE_LABELS] ?? tipo}
                    </span>
                    <div className="flex-1 bg-border rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-bold text-foreground w-8 text-right">{qtd}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Distribuição de Risco dos Moradores ────────────────────────── */}
      <div className="card">
        <h2 className="text-base font-bold mb-4">Distribuição de Risco dos Moradores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {(['verde', 'amarelo', 'laranja', 'vermelho'] as const).map(nivel => {
            const qtd = riscoPorNivel[nivel]
            const cores: Record<string, string> = {
              verde:    'bg-green-50 text-green-800 border-green-200',
              amarelo:  'bg-yellow-50 text-yellow-800 border-yellow-200',
              laranja:  'bg-orange-50 text-orange-800 border-orange-200',
              vermelho: 'bg-red-50 text-red-800 border-red-200',
            }
            const labels: Record<string, string> = {
              verde: 'Estável', amarelo: 'Atenção', laranja: 'Alerta', vermelho: 'Crítico',
            }
            return (
              <div key={nivel} className={`p-3 rounded-lg border text-center ${cores[nivel]}`}>
                <p className="text-2xl font-bold">{qtd}</p>
                <p className="text-xs font-semibold mt-0.5">{labels[nivel]}</p>
              </div>
            )
          })}
        </div>
        {(riscoPorNivel.laranja > 0 || riscoPorNivel.vermelho > 0) && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <strong>{riscoPorNivel.laranja + riscoPorNivel.vermelho} moradores</strong> em nível de risco elevado (alerta ou crítico).{' '}
            Revisar planos de cuidados e aumentar frequência de monitoramento.
          </div>
        )}
      </div>

      {/* ── Plano de Ação Sugerido ─────────────────────────────────────── */}
      <div className="card bg-primary-800 text-white">
        <h2 className="text-base font-bold mb-4">Recomendações para o Próximo Período</h2>
        <ul className="space-y-2 text-sm">
          {aderencia !== null && aderencia < 95 && (
            <li className="flex gap-2">
              <span className="text-accent-300 mt-0.5">→</span>
              <span>Reforçar o fluxo de checagem de medicações — aderência atual de {aderencia}% (meta: 95%).</span>
            </li>
          )}
          {quedas > 0 && (
            <li className="flex gap-2">
              <span className="text-accent-300 mt-0.5">→</span>
              <span>Revisar protocolo de prevenção de quedas — {quedas} {quedas === 1 ? 'queda registrada' : 'quedas registradas'} no período.</span>
            </li>
          )}
          {planosVencidos > 0 && (
            <li className="flex gap-2">
              <span className="text-accent-300 mt-0.5">→</span>
              <span>Atualizar {planosVencidos} {planosVencidos === 1 ? 'plano de cuidados vencido' : 'planos de cuidados vencidos'}.</span>
            </li>
          )}
          {alimentacaoAlerta > 0 && (
            <li className="flex gap-2">
              <span className="text-accent-300 mt-0.5">→</span>
              <span>Avaliar moradores com registros de alimentação ruim ou recusa ({alimentacaoAlerta} registros).</span>
            </li>
          )}
          {pctRotinaHoje < 80 && (
            <li className="flex gap-2">
              <span className="text-accent-300 mt-0.5">→</span>
              <span>Reforçar o registro de rotinas pela equipe — cobertura atual de {pctRotinaHoje}% hoje.</span>
            </li>
          )}
          {abertos > 0 && (
            <li className="flex gap-2">
              <span className="text-accent-300 mt-0.5">→</span>
              <span>Encerrar {abertos} {abertos === 1 ? 'intercorrência aberta' : 'intercorrências abertas'} ainda pendentes.</span>
            </li>
          )}
          {aderencia !== null && aderencia >= 95 && quedas === 0 && planosVencidos === 0 && pctRotinaHoje >= 80 && (
            <li className="flex gap-2">
              <span className="text-green-300 mt-0.5">✓</span>
              <span>Todos os indicadores principais dentro do esperado. Manter a regularidade dos registros.</span>
            </li>
          )}
        </ul>
      </div>

      {/* ── Exportação ─────────────────────────────────────────────────── */}
      <div className="card bg-primary-50">
        <p className="text-sm text-muted mb-3">Exportação em PDF disponível em breve.</p>
        <div className="flex flex-wrap gap-2">
          {['Relatório Completo', 'Relatório de Intercorrências', 'Indicadores de Desempenho'].map(nome => (
            <button key={nome} disabled className="btn-secondary text-sm flex items-center gap-1.5 opacity-60">
              <Download className="w-3.5 h-3.5" />{nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
