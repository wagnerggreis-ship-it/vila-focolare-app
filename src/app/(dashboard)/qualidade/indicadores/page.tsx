import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

import IndicadoresClient from './IndicadoresClient'

export default async function IndicadoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

  const [
    { data: indicadores },
    { data: profile },
    { data: residentes },
    { data: rotinasHoje },
    { data: rotinasDoMes },
    { data: admsMes },
    { data: incidentesMes },
  ] = await Promise.all([
    supabase.from('indicadores_qualidade').select('*').eq('ativo', true).order('nome'),
    supabase.from('user_profiles').select('role').eq('id', user.id).single(),
    supabase.from('residentes').select('id').eq('status', 'ativo'),
    supabase.from('registros_rotina').select('residente_id, tipo_rotina').gte('registrado_em', hoje.toISOString()),
    supabase.from('registros_rotina').select('residente_id, tipo_rotina, status').gte('registrado_em', inicioMes.toISOString()),
    supabase.from('administracoes_medicamento').select('status').gte('horario_previsto', inicioMes.toISOString()),
    supabase.from('incidentes').select('tipo, status, gravidade').gte('created_at', inicioMes.toISOString()),
  ])

  // ── Indicadores automáticos ──────────────────────────────────────────────

  const totalResidentes = (residentes ?? []).length
  const tiposEssenciais = ['banho', 'alimentacao', 'evacuacao', 'diurese']

  // Rotina hoje
  const rotinasPorRes: Record<string, Set<string>> = {}
  for (const r of rotinasHoje ?? []) {
    if (!rotinasPorRes[r.residente_id]) rotinasPorRes[r.residente_id] = new Set()
    rotinasPorRes[r.residente_id].add(r.tipo_rotina)
  }
  const completosHoje = Object.values(rotinasPorRes).filter(t => tiposEssenciais.every(e => t.has(e))).length
  const pctRotinaHoje = totalResidentes > 0 ? Math.round((completosHoje / totalResidentes) * 100) : 0

  // Medicações do mês
  const totalAdms = (admsMes ?? []).length
  const admAdministradas = (admsMes ?? []).filter((a: any) => a.status === 'administrado').length
  const admRecusadas = (admsMes ?? []).filter((a: any) => a.status === 'recusado' || a.status === 'nao_administrado').length
  const pctAderencia = totalAdms > 0 ? Math.round((admAdministradas / totalAdms) * 100) : null

  // Rotina do mês — moradores com ao menos uma rotina registrada por dia
  const totalRotinaMes = (rotinasDoMes ?? []).length
  const rotinaAlimentacaoRuim = (rotinasDoMes ?? []).filter((r: any) =>
    r.tipo_rotina === 'alimentacao' && ['pouco', 'recusou'].includes(r.status)
  ).length

  // Intercorrências do mês
  const totalIncMes = (incidentesMes ?? []).length
  const incAbertos = (incidentesMes ?? []).filter((i: any) => i.status === 'aberto' || i.status === 'investigando').length
  const quedas = (incidentesMes ?? []).filter((i: any) => i.tipo === 'queda').length
  const quaseQuedas = (incidentesMes ?? []).filter((i: any) => i.tipo === 'quase_queda' || i.tipo === 'comportamento_risco').length
  const errosMed = (incidentesMes ?? []).filter((i: any) => i.tipo === 'erro_medicacao').length
  const idsEmergencia = (incidentesMes ?? []).filter((i: any) => i.tipo === 'intercorrencia_clinica').length

  const indicadoresAuto = {
    pctRotinaHoje, completosHoje, totalResidentes,
    pctAderencia, totalAdms, admAdministradas, admRecusadas,
    totalRotinaMes, rotinaAlimentacaoRuim,
    totalIncMes, incAbertos, quedas, quaseQuedas, errosMed, idsEmergencia,
  }

  // ── Indicadores manuais com histórico ──────────────────────────────────
  const medicoesPorIndicador: Record<string, any[]> = {}
  for (const ind of indicadores ?? []) {
    const { data } = await supabase
      .from('medicoes_indicadores')
      .select('*')
      .eq('indicador_id', ind.id)
      .order('periodo_fim', { ascending: false })
      .limit(6)
    medicoesPorIndicador[ind.id] = data ?? []
  }

  return (
    <IndicadoresClient
      indicadores={indicadores ?? []}
      medicoesPorIndicador={medicoesPorIndicador}
      indicadoresAuto={indicadoresAuto}
      isAdmin={profile?.role === 'admin'}
      userId={user.id}
    />
  )
}
