import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDateTime, formatDate } from '@/lib/utils/formatters'
import { TIPO_INCIDENTE_LABELS, GRAVIDADE_LABELS } from '@/lib/types/database'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import IncidenteDetailClient from './IncidenteDetailClient'

export default async function IncidenteDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: incidente }, { data: { user } }] = await Promise.all([
    supabase
      .from('incidentes')
      .select(`*, residente:residente_id(id, nome, quarto), registrado_por_user:registrado_por(id, nome_completo, role), acoes:acoes_corretivas(*, responsavel:responsavel_id(id, nome_completo))`)
      .eq('id', params.id)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!incidente) notFound()

  const [{ data: profile }, { data: profissionais }] = await Promise.all([
    supabase.from('user_profiles').select('id, nome_completo, role').eq('id', user?.id ?? '').single(),
    supabase.from('user_profiles').select('id, nome_completo, role').eq('ativo', true).order('nome_completo'),
  ])

  const isAdmin = profile?.role === 'admin'

  return (
    <IncidenteDetailClient
      incidente={incidente as any}
      isAdmin={isAdmin}
      currentUserId={user?.id ?? ''}
      profissionais={profissionais ?? []}
    />
  )
}
