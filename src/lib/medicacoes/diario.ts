type SupabaseServerClient = any

type GerarDiarioOptions = {
  residenteId?: string
  dataReferencia?: Date
}

function getSaoPauloDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find(p => p.type === 'year')?.value
  const month = parts.find(p => p.type === 'month')?.value
  const day = parts.find(p => p.type === 'day')?.value

  return `${year}-${month}-${day}`
}

function buildSaoPauloDateTime(dateKey: string, horario: string): Date | null {
  const normalized = horario?.trim()
  if (!/^\d{2}:\d{2}$/.test(normalized)) return null
  return new Date(`${dateKey}T${normalized}:00-03:00`)
}

export async function gerarDiarioMedicacoesDoDia(
  supabase: SupabaseServerClient,
  options: GerarDiarioOptions = {}
): Promise<{ criadas: number; data: string }> {
  const dataKey = getSaoPauloDateKey(options.dataReferencia)
  const inicioDia = new Date(`${dataKey}T00:00:00-03:00`)
  const fimDia = new Date(`${dataKey}T23:59:59-03:00`)

  let prescricoesQuery = supabase
    .from('prescricoes_medicas')
    .select('id, residente_id, data_inicio, data_fim, status, itens:prescricao_itens(id, tipo, horarios, ativo)')
    .eq('status', 'ativa')
    .lte('data_inicio', dataKey)
    .or(`data_fim.is.null,data_fim.gte.${dataKey}`)

  if (options.residenteId) {
    prescricoesQuery = prescricoesQuery.eq('residente_id', options.residenteId)
  }

  const { data: prescricoes, error: prescError } = await prescricoesQuery
  if (prescError || !prescricoes?.length) {
    return { criadas: 0, data: dataKey }
  }

  let existentesQuery = supabase
    .from('administracoes_medicamento')
    .select('prescricao_item_id, residente_id, horario_previsto')
    .gte('horario_previsto', inicioDia.toISOString())
    .lte('horario_previsto', fimDia.toISOString())

  if (options.residenteId) {
    existentesQuery = existentesQuery.eq('residente_id', options.residenteId)
  }

  const { data: existentes } = await existentesQuery
  const existentesSet = new Set(
    (existentes ?? []).map((adm: any) => `${adm.prescricao_item_id}|${adm.residente_id}|${new Date(adm.horario_previsto).toISOString()}`)
  )

  const novasAdministracoes: any[] = []

  for (const prescricao of prescricoes) {
    for (const item of (prescricao.itens ?? [])) {
      if (!item.ativo || item.tipo !== 'medicamento' || !item.horarios?.length) continue

      for (const horario of item.horarios) {
        const horarioPrevisto = buildSaoPauloDateTime(dataKey, horario)
        if (!horarioPrevisto) continue

        const key = `${item.id}|${prescricao.residente_id}|${horarioPrevisto.toISOString()}`
        if (existentesSet.has(key)) continue

        novasAdministracoes.push({
          prescricao_item_id: item.id,
          residente_id: prescricao.residente_id,
          horario_previsto: horarioPrevisto.toISOString(),
          status: 'adiado',
        })
      }
    }
  }

  if (!novasAdministracoes.length) {
    return { criadas: 0, data: dataKey }
  }

  const { error: insertError } = await supabase
    .from('administracoes_medicamento')
    .upsert(novasAdministracoes, {
      onConflict: 'prescricao_item_id,residente_id,horario_previsto',
      ignoreDuplicates: true,
    })

  if (insertError) {
    console.error('Erro ao gerar diário de medicações:', insertError.message)
    return { criadas: 0, data: dataKey }
  }

  return { criadas: novasAdministracoes.length, data: dataKey }
}
