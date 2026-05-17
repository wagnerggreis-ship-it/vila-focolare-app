import { createClient } from '@/lib/supabase/server'
import GradeMedicacaoClient from './GradeMedicacaoClient'
import { gerarDiarioMedicacoesDoDia } from '@/lib/medicacoes/diario'

function getTurnoAtual(): { label: string; inicio: string; fim: string } {
  const h = new Date().getHours()
  if (h >= 6 && h < 14) return { label: 'Manhã (06h–14h)', inicio: '06:00', fim: '14:00' }
  if (h >= 14 && h < 22) return { label: 'Tarde (14h–22h)', inicio: '14:00', fim: '22:00' }
  return { label: 'Noite (22h–06h)', inicio: '22:00', fim: '06:00' }
}

export default async function GradeMedicacoesPage() {
  const supabase = await createClient()
  const turno = getTurnoAtual()
  const agora = new Date()

  await gerarDiarioMedicacoesDoDia(supabase)

  const hojeISO = agora.toISOString().split('T')[0]
  const inicioTurno = new Date(`${hojeISO}T${turno.inicio}:00`)
  const fimTurno = new Date(`${hojeISO}T${turno.fim === '06:00' ? '23:59' : turno.fim}:00`)

  const [{ data: administracoes }, { data: { user } }] = await Promise.all([
    supabase
      .from('administracoes_medicamento')
      .select(`
        *,
        residente:residente_id(id, nome, quarto, foto_url, alergias),
        prescricao_item:prescricao_item_id(id, descricao, dose, via, horarios, tipo, observacoes)
      `)
      .gte('horario_previsto', inicioTurno.toISOString())
      .lte('horario_previsto', fimTurno.toISOString())
      .order('horario_previsto'),
    supabase.auth.getUser(),
  ])

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, role, ativo')
    .eq('id', user?.id ?? '')
    .single()

  const podeChecar = Boolean(
    profile?.ativo && ['admin', 'enfermeiro', 'tecnico_enfermagem'].includes(profile.role)
  )

  // Agrupar por residente
  const porResidente = new Map<string, { residente: any; adms: any[] }>()
  for (const adm of (administracoes ?? [])) {
    const rid = adm.residente?.id
    if (!rid) continue
    if (!porResidente.has(rid)) {
      porResidente.set(rid, { residente: adm.residente, adms: [] })
    }
    porResidente.get(rid)!.adms.push(adm)
  }

  const grupos = Array.from(porResidente.values()).sort((a, b) => a.residente.nome.localeCompare(b.residente.nome))

  const totalPendente = (administracoes ?? []).filter((a: any) => a.status === 'adiado' || (!a.status && new Date(a.horario_previsto) <= agora)).length

  return (
    <GradeMedicacaoClient turno={turno} grupos={grupos} totalPendente={totalPendente} agora={agora.toISOString()} podeChecar={podeChecar} />
  )
}
