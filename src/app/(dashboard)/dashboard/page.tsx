import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, AlertTriangle, Pill, ClipboardCheck,
  Clock, CheckCircle2, ClipboardList, ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import { formatRelative, calcularIdade } from '@/lib/utils/formatters'
import { TIPO_INCIDENTE_LABELS } from '@/lib/types/database'
import type { Residente, NotaProntuario, Incidente } from '@/lib/types/database'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [
    { data: residentes },
    { count: incidentesAbertos },
    { data: incidentesRecentes },
    { data: notasRecentes },
    { count: pendenciasAssinatura },
    { data: rotinasHoje },
    { data: medicacoesPendentes },
  ] = await Promise.all([
    supabase.from('residentes').select('*').eq('status', 'ativo').order('nome'),
    supabase.from('incidentes').select('*', { count: 'exact', head: true }).in('status', ['aberto', 'investigando', 'plano_acao']),
    supabase.from('incidentes').select('*, residente:residente_id(id, nome, quarto)').in('status', ['aberto', 'investigando']).order('created_at', { ascending: false }).limit(5),
    supabase.from('notas_prontuario').select('*, autor:autor_id(id, nome_completo, role), residente:residente_id(id, nome)').order('created_at', { ascending: false }).limit(6),
    supabase.from('planos_cuidado').select('*', { count: 'exact', head: true }).eq('status', 'ativo').is('assinado_por', null),
    supabase.from('registros_rotina').select('residente_id, tipo_rotina, status').gte('registrado_em', hoje.toISOString()),
    supabase.from('administracoes_medicamento').select('residente_id, status, horario_previsto, prescricao_item:prescricao_item_id(id, descricao, dose, via)').lt('horario_previsto', new Date().toISOString()).eq('status', 'adiado').limit(10),
  ])

  const lista = (residentes ?? []) as Residente[]
  const totalResidentes = lista.length

  // Calcular moradores com rotina essencial completa hoje
  const tiposEssenciais = ['banho', 'alimentacao', 'evacuacao', 'diurese']
  const rotinasPorResidente: Record<string, Set<string>> = {}
  for (const reg of rotinasHoje ?? []) {
    if (!rotinasPorResidente[reg.residente_id]) rotinasPorResidente[reg.residente_id] = new Set()
    rotinasPorResidente[reg.residente_id].add(reg.tipo_rotina)
  }
  const completosHoje = Object.values(rotinasPorResidente).filter(tipos =>
    tiposEssenciais.every(t => tipos.has(t))
  ).length

  // Moradores SEM nenhum registro de rotina hoje
  const semRotinaHoje = lista.filter(r => !rotinasPorResidente[r.id] || rotinasPorResidente[r.id].size === 0)

  // Medicações atrasadas (pendentes passado o horário)
  const medAtrasadas = (medicacoesPendentes ?? []).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Cards de estatísticas ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          titulo="Moradores Ativos"
          valor={totalResidentes}
          descricao="Em cuidado residencial"
          icon={Users}
          cor="azul"
          href="/residentes"
        />
        <StatCard
          titulo="Intercorrências"
          valor={incidentesAbertos ?? 0}
          descricao="Abertas — requerem atenção"
          icon={AlertTriangle}
          cor={(incidentesAbertos ?? 0) > 0 ? 'vermelho' : 'verde'}
          href="/incidentes"
          urgente={(incidentesAbertos ?? 0) > 0}
        />
        <StatCard
          titulo="Rotinas Hoje"
          valor={completosHoje}
          descricao={`de ${totalResidentes} moradores completas`}
          icon={ClipboardCheck}
          cor={completosHoje === totalResidentes && totalResidentes > 0 ? 'verde' : 'amarelo'}
          href="/rotina"
        />
        <StatCard
          titulo="Pendências"
          valor={pendenciasAssinatura ?? 0}
          descricao="Planos sem assinatura"
          icon={ClipboardList}
          cor={(pendenciasAssinatura ?? 0) > 0 ? 'amarelo' : 'verde'}
        />
      </div>

      {/* ── ATENÇÃO AGORA ──────────────────────────────────────────────────── */}
      {(medAtrasadas > 0 || semRotinaHoje.length > 0 || (incidentesAbertos ?? 0) > 0) && (
        <div className="card border-2 border-red-100 bg-red-50/30">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-red-800">Atenção Agora</h2>
            <span className="ml-auto text-xs text-red-500 font-semibold">
              {medAtrasadas + semRotinaHoje.length + (incidentesAbertos ?? 0)} pendências
            </span>
          </div>

          <div className="space-y-3">
            {/* Medicações atrasadas */}
            {medAtrasadas > 0 && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-200">
                <Pill className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-800">
                    {medAtrasadas} {medAtrasadas === 1 ? 'medicação atrasada' : 'medicações atrasadas'}
                  </p>
                  <p className="text-xs text-red-600">Verificar e registrar status no módulo de medicações</p>
                </div>
                <Link href="/medicacoes" className="text-xs font-bold text-red-700 hover:text-red-900 whitespace-nowrap">
                  Ver →
                </Link>
              </div>
            )}

            {/* Intercorrências abertas */}
            {(incidentesAbertos ?? 0) > 0 && (
              <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-200">
                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-orange-800">
                    {incidentesAbertos} {(incidentesAbertos ?? 0) === 1 ? 'intercorrência aberta' : 'intercorrências abertas'}
                  </p>
                  <p className="text-xs text-orange-600">Acompanhar e encerrar quando resolvidas</p>
                </div>
                <Link href="/incidentes" className="text-xs font-bold text-orange-700 hover:text-orange-900 whitespace-nowrap">
                  Ver →
                </Link>
              </div>
            )}

            {/* Moradores sem rotina */}
            {semRotinaHoje.length > 0 && (
              <div className="p-3 bg-white rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-bold text-amber-800">
                    {semRotinaHoje.length} {semRotinaHoje.length === 1 ? 'morador sem rotina' : 'moradores sem rotina'} hoje
                  </p>
                  <Link href="/rotina" className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900">
                    Meu Turno →
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {semRotinaHoje.slice(0, 6).map(r => (
                    <Link
                      key={r.id}
                      href={`/rotina/${r.id}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {r.nome_social ?? r.nome.split(' ')[0]}
                    </Link>
                  ))}
                  {semRotinaHoje.length > 6 && (
                    <span className="text-xs text-muted">+{semRotinaHoje.length - 6} mais</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Grid principal ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

        {/* Semáforo de moradores */}
        <div className="lg:col-span-1 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Moradores</h2>
            <Link href="/residentes" className="text-xs text-primary-600 hover:text-primary-800 font-medium">
              Ver todos →
            </Link>
          </div>

          {lista.length === 0 ? (
            <p className="text-muted text-sm text-center py-6">Nenhum morador cadastrado</p>
          ) : (
            <div className="space-y-1">
              {lista.map((residente) => {
                const tipos = rotinasPorResidente[residente.id]
                const rotinaConcluida = tipos ? tiposEssenciais.every(t => tipos.has(t)) : false
                return (
                  <Link
                    key={residente.id}
                    href={`/residentes/${residente.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary-50 transition-colors group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-semibold text-sm">
                        {residente.nome.split(' ').slice(0, 2).map(p => p[0]).join('')}
                      </div>
                      <SemaforoRisco nivel={residente.nivel_risco} size="sm" showLabel={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary-800">
                        {residente.nome_social ?? residente.nome}
                      </p>
                      <p className="text-xs text-muted">
                        {calcularIdade(residente.data_nascimento)} anos
                        {residente.quarto && ` · Apto ${residente.quarto}`}
                      </p>
                    </div>
                    <span title={rotinaConcluida ? 'Rotina completa' : 'Rotina pendente'}>
                      {rotinaConcluida
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}

          <Link href="/rotina" className="mt-4 flex items-center justify-center gap-2 w-full btn-secondary text-sm">
            <ClipboardCheck className="w-4 h-4" />
            Ir para Meu Turno
          </Link>
        </div>

        {/* Últimos Registros */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Últimos Registros</h2>
            <Clock className="w-4 h-4 text-muted" />
          </div>

          {!notasRecentes || notasRecentes.length === 0 ? (
            <p className="text-muted text-sm text-center py-6">Nenhum registro encontrado</p>
          ) : (
            <div className="space-y-3">
              {(notasRecentes as (NotaProntuario & { residente: { id: string; nome: string } })[]).map((nota) => (
                <div key={nota.id} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0 mt-0.5">
                    {nota.tipo_nota?.[0]?.toUpperCase() ?? 'R'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {(nota as any).residente?.nome ?? 'Morador'}
                      </span>
                      <span className="text-xs text-muted">
                        — {(nota as any).autor?.nome_completo ?? 'Equipe'}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {nota.titulo ?? `Registro de ${nota.tipo_nota}`}
                    </p>
                    <p className="text-[11px] text-muted/70 mt-1">
                      {formatRelative(nota.created_at)}
                    </p>
                  </div>
                  <Link
                    href={`/residentes/${(nota as any).residente?.id}/prontuario`}
                    className="text-xs text-primary-600 hover:text-primary-800 flex-shrink-0 mt-1"
                  >
                    Ver →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Intercorrências abertas ──────────────────────────────────────────── */}
      {incidentesRecentes && incidentesRecentes.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="text-base font-bold text-foreground">Intercorrências Abertas</h2>
            </div>
            <Link href="/incidentes" className="text-xs text-primary-600 hover:text-primary-800 font-medium">
              Ver todas →
            </Link>
          </div>
          <div className="space-y-2">
            {(incidentesRecentes as (Incidente & { residente: { id: string; nome: string; quarto?: string } })[]).map((inc) => (
              <Link
                key={inc.id}
                href={`/incidentes/${inc.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {(inc as any).residente?.nome ?? 'Morador'}
                    {(inc as any).residente?.quarto && ` — Apto ${(inc as any).residente.quarto}`}
                  </p>
                  <p className="text-xs text-muted">
                    {TIPO_INCIDENTE_LABELS[inc.tipo as keyof typeof TIPO_INCIDENTE_LABELS] ?? inc.tipo}
                    {' · '}{formatRelative(inc.data_hora_evento)}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  inc.status === 'aberto' ? 'bg-red-200 text-red-800' :
                  inc.status === 'investigando' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-orange-200 text-orange-800'
                }`}>
                  {inc.status}
                </span>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
