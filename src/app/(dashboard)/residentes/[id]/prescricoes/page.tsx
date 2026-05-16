import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils/formatters'
import { CheckCircle, Clock, Plus } from 'lucide-react'
import PrescricoesClient from './PrescricoesClient'
import type { Residente, PrescricaoMedica } from '@/lib/types/database'

export default async function PrescricoesPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: residente }, { data: { user } }] = await Promise.all([
    supabase.from('residentes').select('id, nome, nivel_risco, alergias').eq('id', params.id).single(),
    supabase.auth.getUser(),
  ])

  if (!residente) notFound()

  const [{ data: prescricoes }, { data: profile }, { data: medicos }] = await Promise.all([
    supabase
      .from('prescricoes_medicas')
      .select('*, itens:prescricao_itens(*), prescrito_por_user:prescrito_por(id, nome_completo, registro_profissional)')
      .eq('residente_id', params.id)
      .order('created_at', { ascending: false }),
    supabase.from('user_profiles').select('id, nome_completo, role').eq('id', user?.id ?? '').single(),
    supabase.from('user_profiles').select('id, nome_completo').in('role', ['medico', 'admin']).eq('ativo', true),
  ])

  const podePrescrever = profile?.role === 'admin' || profile?.role === 'medico'

  return (
    <PrescricoesClient
      residente={residente as any}
      prescricoes={prescricoes as PrescricaoMedica[] ?? []}
      podePrescrever={podePrescrever}
      currentUserId={user?.id ?? ''}
    />
  )
}
