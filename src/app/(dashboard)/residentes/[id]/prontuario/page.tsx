import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProntuarioClient from './ProntuarioClient'
import type { Residente } from '@/lib/types/database'

export default async function ProntuarioPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [{ data: residente }, { data: notas }, { data: { user } }] = await Promise.all([
    supabase.from('residentes').select('id, nome, nivel_risco').eq('id', params.id).single(),
    supabase
      .from('notas_prontuario')
      .select('*, autor:autor_id(id, nome_completo, role, registro_profissional)')
      .eq('residente_id', params.id)
      .order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ])

  if (!residente) notFound()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, nome_completo, role, registro_profissional')
    .eq('id', user?.id ?? '')
    .single()

  return (
    <ProntuarioClient
      residente={residente as Pick<Residente, 'id' | 'nome' | 'nivel_risco'>}
      notas={notas ?? []}
      currentUser={profile}
    />
  )
}
