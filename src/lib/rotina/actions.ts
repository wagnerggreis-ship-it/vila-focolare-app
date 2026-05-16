'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TipoRotina, TurnoRotina } from '@/lib/types/database'

function detectarTurno(): TurnoRotina {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 14) return 'manha'
  if (hora >= 14 && hora < 22) return 'tarde'
  return 'noite'
}

export async function salvarRegistroRotina(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const residente_id = formData.get('residente_id') as string
  const tipo_rotina = formData.get('tipo_rotina') as TipoRotina
  const status = formData.get('status') as string
  const observacao = formData.get('observacao') as string | null

  if (!residente_id || !tipo_rotina || !status) {
    return { error: 'Campos obrigatórios ausentes' }
  }

  const { error } = await supabase.from('registros_rotina').insert({
    residente_id,
    tipo_rotina,
    status,
    observacao: observacao || null,
    turno: detectarTurno(),
    registrado_por: user.id,
    registrado_em: new Date().toISOString(),
  })

  if (error) return { error: error.message }

  revalidatePath('/rotina')
  revalidatePath(`/rotina/${residente_id}`)
  revalidatePath('/dashboard')

  return { success: true }
}

export async function buscarRotinasHoje(residente_id?: string) {
  const supabase = await createClient()

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  let query = supabase
    .from('registros_rotina')
    .select('*, residente:residente_id(id, nome, nome_social, quarto, nivel_risco), usuario:registrado_por(id, nome_completo, role)')
    .gte('registrado_em', hoje.toISOString())
    .order('registrado_em', { ascending: false })

  if (residente_id) {
    query = query.eq('residente_id', residente_id)
  }

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function buscarStatusRotinaHoje(residente_id: string) {
  const supabase = await createClient()

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('registros_rotina')
    .select('tipo_rotina, status')
    .eq('residente_id', residente_id)
    .gte('registrado_em', hoje.toISOString())

  const tiposRegistrados = new Set((data ?? []).map(r => r.tipo_rotina))

  return {
    banho: tiposRegistrados.has('banho'),
    alimentacao: tiposRegistrados.has('alimentacao'),
    sono: tiposRegistrados.has('sono'),
    evacuacao: tiposRegistrados.has('evacuacao'),
    diurese: tiposRegistrados.has('diurese'),
    sinal_atencao: tiposRegistrados.has('sinal_atencao'),
    completo: ['banho', 'alimentacao', 'evacuacao', 'diurese'].every(t => tiposRegistrados.has(t)),
  }
}
