import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatDateTime } from '@/lib/utils/formatters'
import { isBefore, parseISO } from 'date-fns'
import { CheckCircle, AlertCircle, Clock, PenLine } from 'lucide-react'
import PlanoCuidadosClient from './PlanoCuidadosClient'
import type { PlanoCuidado, Residente } from '@/lib/types/database'

export default async function PlanoCuidadosPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: residente }, { data: { user } }] = await Promise.all([
    supabase.from('residentes').select('id, nome, nivel_risco').eq('id', params.id).single(),
    supabase.auth.getUser(),
  ])

  if (!residente) notFound()

  const [{ data: plano }, { data: profile }, { data: profissionais }] = await Promise.all([
    supabase
      .from('planos_cuidado')
      .select('*, itens:plano_itens(*, responsavel:responsavel_id(id, nome_completo))')
      .eq('residente_id', params.id)
      .eq('status', 'ativo')
      .order('versao', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('user_profiles').select('id, nome_completo, role').eq('id', user?.id ?? '').single(),
    supabase.from('user_profiles').select('id, nome_completo, role').eq('ativo', true).order('nome_completo'),
  ])

  const isAdmin = profile?.role === 'admin' || profile?.role === 'medico'
  const vencido = plano ? isBefore(parseISO(plano.data_revisao_prevista), new Date()) : false

  return (
    <PlanoCuidadosClient
      residente={residente as Pick<Residente, 'id' | 'nome' | 'nivel_risco'>}
      plano={plano as PlanoCuidado | null}
      isAdmin={isAdmin}
      currentUserId={user?.id ?? ''}
      profissionais={profissionais ?? []}
      vencido={vencido}
    />
  )
}
