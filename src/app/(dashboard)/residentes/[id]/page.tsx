import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  calcularIdade, formatDate, formatDateTime, formatRelative,
} from '@/lib/utils/formatters'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import {
  Phone, Calendar, MapPin, AlertCircle, FileText,
  Pill, BarChart3, ClipboardCheck,
  CheckCircle2, AlertTriangle, Plus,
  ChevronRight, Heart, ClipboardList,
} from 'lucide-react'
import type { Residente, ContatoResidente, AvaliacaoFuncional, Incidente } from '@/lib/types/database'
import { TIPO_INCIDENTE_LABELS } from '@/lib/types/database'

const TABS = [
  { label: 'Resumo', href: '' },
  { label: 'Prontuário', href: '/prontuario' },
  { label: 'Avaliações', href: '/avaliacoes' },
  { label: 'Plano de Cuidados', href: '/plano-cuidados' },
  { label: 'Prescrições', href: '/prescricoes' },
  { label: 'Medicações', href: '/medicacoes' },
]

const ITENS_ROTINA = [
  { key: 'banho', label: 'Banho', emoji: '🚿' },
  { key: 'alimentacao', label: 'Alimentação', emoji: '🍽️' },
  { key: 'evacuacao', label: 'Evacuação', emoji: '🚽' },
  { key: 'diurese', label: 'Diurese', emoji: '💧' },
  { key: 'sono', label: 'Sono', emoji: '😴' },
]

export default async function ResidentePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [
    { data: residente },
    { data: contatos },
    { data: ultimasAvaliacoes },
    { data: planoCuidados },
    { data: incidentesAbertos },
    { data: rotinasHoje },
    { data: ultimasNotas },
    { data: ultimoIncidente },
  ] = await Promise.all([
    supabase
      .from('residentes')
      .select('*, medico_responsavel:medico_responsavel_id(id, nome_completo)')
      .eq('id', params.id)
      .single(),
    supabase
      .from('contatos_residentes')
      .select('*')
      .eq('residente_id', params.id)
      .order('contato_principal', { ascending: false }),
    supabase
      .from('avaliacoes_funcionais')
      .select('*, avaliador:avaliador_id(id, nome_completo, role)')
      .eq('residente_id', params.id)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('planos_cuidado')
      .select('*')
      .eq('residente_id', params.id)
      .eq('status', 'ativo')
      .single(),
    supabase
      .from('incidentes')
      .select('*')
      .eq('residente_id', params.id)
      .in('status', ['aberto', 'investigando'])
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('registros_rotina')
      .select('tipo_rotina, status, observacao, registrado_em')
      .eq('residente_id', params.id)
      .gte('registrado_em', hoje.toISOString())
      .order('registrado_em', { ascending: false }),
    supabase
      .from('notas_prontuario')
      .select('*, autor:autor_id(id, nome_completo, role)')
      .eq('residente_id', params.id)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('incidentes')
      .select('*')
      .eq('residente_id', params.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (!residente) notFound()

  const res = residente as Residente & { medico_responsavel: { id: string; nome_completo: string } | null }
  // Calcular status da rotina de hoje
  const tiposRegistrados = new Set((rotinasHoje ?? []).map(r => r.tipo_rotina))
  const tiposEssenciais = ['banho', 'alimentacao', 'evacuacao', 'diurese']
  const rotinaConcluida = tiposEssenciais.every(t => tiposRegistrados.has(t))
  const rotinaIniciada = tiposRegistrados.size > 0
  const rotinasCompletas = tiposEssenciais.filter(t => tiposRegistrados.has(t)).length

  const incAbertos = (incidentesAbertos as Incidente[] | null) ?? []
  const temIncidenteAberto = incAbertos.length > 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─── Header da ficha ─────────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-2xl flex-shrink-0 relative">
            {res.nome.split(' ').slice(0, 2).map(p => p[0]).join('')}
            {temIncidenteAberto && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {incAbertos.length}
              </span>
            )}
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <h1 className="text-xl font-bold text-foreground">{res.nome}</h1>
                {res.nome_social && (
                  <p className="text-sm text-muted">Chamado(a) por: <strong>{res.nome_social}</strong></p>
                )}
              </div>
              <SemaforoRisco nivel={res.nivel_risco} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {calcularIdade(res.data_nascimento)} anos · {formatDate(res.data_nascimento)}
              </span>
              {res.quarto && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Quarto {res.quarto}
                </span>
              )}
              <span>Admitido(a) em {formatDate(res.data_admissao)}</span>
            </div>

            {res.diagnosticos_principais?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {res.diagnosticos_principais.map((diag: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-800 rounded-full border border-primary-200 font-medium">
                    {diag}
                  </span>
                ))}
              </div>
            )}

            {res.alergias && (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <p className="text-sm font-semibold text-red-600">Alergias: {res.alergias}</p>
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <div className="flex sm:flex-col gap-2 flex-wrap sm:flex-nowrap">
            <Link href={`/rotina/${params.id}`} className="btn-accent text-sm px-3 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" />
              Registrar Rotina
            </Link>
            <Link href={`/residentes/${params.id}/prontuario`} className="btn-secondary text-sm px-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Prontuário
            </Link>
            <Link href={`/residentes/${params.id}/medicacoes`} className="btn-secondary text-sm px-3 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5" />
              Medicações
            </Link>
            <Link
              href={`/incidentes/novo?residente_id=${params.id}`}
              className="btn-secondary text-sm px-3 flex items-center gap-1.5 text-red-600 hover:bg-red-50 border-red-200"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Intercorrência
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Alerta de intercorrências abertas ───────────────────────────────── */}
      {temIncidenteAberto && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-red-800 text-sm">
              {incAbertos.length === 1 ? '1 intercorrência aberta' : `${incAbertos.length} intercorrências abertas`}
            </p>
            <div className="mt-1 space-y-1">
              {incAbertos.map(inc => (
                <Link
                  key={inc.id}
                  href={`/incidentes/${inc.id}`}
                  className="flex items-center justify-between text-xs text-red-700 hover:text-red-900"
                >
                  <span>{TIPO_INCIDENTE_LABELS[inc.tipo as keyof typeof TIPO_INCIDENTE_LABELS] ?? inc.tipo}</span>
                  <span className="text-red-500">{formatRelative(inc.created_at)} →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="tab-list px-4 pt-2 overflow-x-auto">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={`/residentes/${params.id}${tab.href}`}
              className={`tab-trigger${tab.href === '' ? ' active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── Rotina de Hoje ──────────────────────────────────────────── */}
            <div className={`p-4 rounded-xl border-2 ${
              rotinaConcluida ? 'border-green-200 bg-green-50/50' :
              rotinaIniciada ? 'border-amber-200 bg-amber-50/40' :
              'border-border bg-white'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-primary-800" />
                  Rotina de Hoje
                </h3>
                <Link
                  href={`/rotina/${params.id}`}
                  className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${
                    rotinaConcluida
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-accent-500 text-white hover:bg-accent-600'
                  }`}
                >
                  {rotinaConcluida ? '✓ Completo' : rotinaIniciada ? 'Continuar →' : 'Registrar →'}
                </Link>
              </div>

              <div className="flex gap-2 flex-wrap">
                {ITENS_ROTINA.map(item => {
                  const feito = tiposRegistrados.has(item.key)
                  return (
                    <div
                      key={item.key}
                      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        feito
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <span>{item.label}</span>
                      {feito && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  )
                })}
              </div>

              {!rotinaConcluida && (
                <p className="text-xs text-muted mt-3">
                  {rotinaConcluida
                    ? 'Rotina essencial completa hoje'
                    : rotinaIniciada
                    ? `${rotinasCompletas} de ${tiposEssenciais.length} itens essenciais registrados`
                    : 'Nenhum item de rotina registrado hoje'}
                </p>
              )}
            </div>

            {/* ── Dados Pessoais ──────────────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-3">
                Dados Pessoais
              </h3>
              <dl className="space-y-2">
                {res.cpf && (
                  <div className="flex gap-2 text-sm">
                    <dt className="text-muted w-28 flex-shrink-0">CPF</dt>
                    <dd className="text-foreground font-medium">{res.cpf}</dd>
                  </div>
                )}
                {res.numero_sus && (
                  <div className="flex gap-2 text-sm">
                    <dt className="text-muted w-28 flex-shrink-0">Cartão SUS</dt>
                    <dd className="text-foreground font-medium">{res.numero_sus}</dd>
                  </div>
                )}
                {res.plano_saude && (
                  <div className="flex gap-2 text-sm">
                    <dt className="text-muted w-28 flex-shrink-0">Plano</dt>
                    <dd className="text-foreground font-medium">
                      {res.plano_saude}{res.numero_plano && ` · ${res.numero_plano}`}
                    </dd>
                  </div>
                )}
                {res.medico_responsavel && (
                  <div className="flex gap-2 text-sm">
                    <dt className="text-muted w-28 flex-shrink-0">Médico Resp.</dt>
                    <dd className="text-foreground font-medium">{res.medico_responsavel.nome_completo}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* ── Contatos de Emergência ──────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-3">
                Contatos de Emergência
              </h3>
              {!contatos || contatos.length === 0 ? (
                <p className="text-muted text-sm">Nenhum contato cadastrado</p>
              ) : (
                <div className="space-y-2">
                  {(contatos as ContatoResidente[]).map((contato) => (
                    <div key={contato.id} className="p-2.5 rounded-lg bg-primary-50 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{contato.nome}</span>
                        {contato.contato_principal && (
                          <span className="text-[10px] bg-primary-800 text-white px-1.5 py-0.5 rounded-full font-semibold">Principal</span>
                        )}
                        {contato.parentesco && (
                          <span className="text-muted text-xs">({contato.parentesco})</span>
                        )}
                      </div>
                      {contato.telefone && (
                        <div className="flex items-center gap-1 mt-1 text-muted">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${contato.telefone}`} className="hover:text-primary-800">
                            {contato.telefone}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Plano de Cuidados ───────────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-3">
                Plano de Cuidados
              </h3>
              {!planoCuidados ? (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-800">⚠ Sem plano de cuidados ativo</p>
                  <Link href={`/residentes/${params.id}/plano-cuidados`} className="text-xs text-yellow-700 hover:underline mt-1 block">
                    Criar plano de cuidados →
                  </Link>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-green-800">Plano ativo — v{planoCuidados.versao}</p>
                    {planoCuidados.assinado_por ? (
                      <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-semibold">Assinado</span>
                    ) : (
                      <span className="text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full font-semibold">Pendente assinatura</span>
                    )}
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Revisão prevista: {formatDate(planoCuidados.data_revisao_prevista)}
                  </p>
                  <Link href={`/residentes/${params.id}/plano-cuidados`} className="text-xs text-green-700 hover:underline mt-1 block">
                    Ver plano completo →
                  </Link>
                </div>
              )}
            </div>

            {/* ── Últimas Notas / Prontuário ──────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wide">
                  Prontuário Recente
                </h3>
                <Link href={`/residentes/${params.id}/prontuario`} className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                  Ver tudo →
                </Link>
              </div>
              {!ultimasNotas || ultimasNotas.length === 0 ? (
                <p className="text-muted text-sm">
                  Nenhum registro.{' '}
                  <Link href={`/residentes/${params.id}/prontuario`} className="text-primary-600 hover:underline">
                    Criar registro →
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {(ultimasNotas as any[]).map(nota => (
                    <Link
                      key={nota.id}
                      href={`/residentes/${params.id}/prontuario`}
                      className="flex gap-2 p-2.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors text-sm"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-[10px] font-bold flex-shrink-0">
                        {nota.tipo_nota?.[0]?.toUpperCase() ?? 'R'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{nota.titulo ?? `Registro de ${nota.tipo_nota}`}</p>
                        <p className="text-xs text-muted">{nota.autor?.nome_completo} · {formatRelative(nota.created_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ── Avaliações Recentes ─────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wide">
                  Avaliações Recentes
                </h3>
                <Link href={`/residentes/${params.id}/avaliacoes`} className="text-xs text-primary-600 hover:text-primary-800 font-medium">
                  Ver todas →
                </Link>
              </div>
              {!ultimasAvaliacoes || ultimasAvaliacoes.length === 0 ? (
                <p className="text-muted text-sm">
                  Nenhuma avaliação.{' '}
                  <Link href={`/residentes/${params.id}/avaliacoes`} className="text-primary-600 hover:underline">
                    Iniciar avaliação →
                  </Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {(ultimasAvaliacoes as AvaliacaoFuncional[]).map((av) => (
                    <Link
                      key={av.id}
                      href={`/residentes/${params.id}/avaliacoes`}
                      className="flex items-center justify-between text-sm p-2 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      <span className="font-medium text-foreground">{av.tipo_avaliacao.toUpperCase()}</span>
                      <div className="flex items-center gap-2">
                        {av.score_total !== null && av.score_total !== undefined && (
                          <span className="font-bold text-primary-800">{av.score_total} pts</span>
                        )}
                        <span className="text-muted text-xs">{formatDate(av.data_avaliacao)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Observações gerais */}
          {res.observacoes_gerais && (
            <div className="mt-5 pt-5 border-t border-border">
              <h3 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-2">Observações Gerais</h3>
              <p className="text-sm text-foreground whitespace-pre-line">{res.observacoes_gerais}</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Intercorrências recentes ─────────────────────────────────────────── */}
      {ultimoIncidente && (ultimoIncidente as Incidente[]).length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h2 className="text-base font-bold text-foreground">Histórico de Intercorrências</h2>
            </div>
            <Link href={`/incidentes/novo?residente_id=${params.id}`} className="btn-accent text-xs px-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Nova
            </Link>
          </div>
          <div className="space-y-2">
            {(ultimoIncidente as Incidente[]).map(inc => (
              <Link
                key={inc.id}
                href={`/incidentes/${inc.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors border border-border"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  inc.status === 'aberto' ? 'bg-red-500' :
                  inc.status === 'investigando' ? 'bg-yellow-500' :
                  inc.status === 'plano_acao' ? 'bg-orange-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {TIPO_INCIDENTE_LABELS[inc.tipo as keyof typeof TIPO_INCIDENTE_LABELS] ?? inc.tipo}
                  </p>
                  <p className="text-xs text-muted">{formatDateTime(inc.data_hora_evento)}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  inc.status === 'aberto' ? 'bg-red-100 text-red-700' :
                  inc.status === 'investigando' ? 'bg-yellow-100 text-yellow-700' :
                  inc.status === 'fechado' ? 'bg-green-100 text-green-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {inc.status.replace('_', ' ')}
                </span>
                <ChevronRight className="w-4 h-4 text-muted flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Links rápidos para todos os módulos ─────────────────────────────── */}
      <div className="card">
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label: 'Meu Turno', icon: ClipboardCheck, href: `/rotina/${params.id}`, accent: true },
            { label: 'Prontuário', icon: FileText, href: `/residentes/${params.id}/prontuario` },
            { label: 'Avaliações', icon: BarChart3, href: `/residentes/${params.id}/avaliacoes` },
            { label: 'Plano', icon: Heart, href: `/residentes/${params.id}/plano-cuidados` },
            { label: 'Prescrições', icon: ClipboardList, href: `/residentes/${params.id}/prescricoes` },
            { label: 'Medicações', icon: Pill, href: `/residentes/${params.id}/medicacoes` },
          ].map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all hover:shadow-sm ${
                  item.accent
                    ? 'border-accent-300 bg-accent-50 text-accent-700 hover:bg-accent-100'
                    : 'border-border bg-white text-muted hover:border-primary-300 hover:text-primary-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
