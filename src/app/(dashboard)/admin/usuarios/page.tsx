import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROLE_LABELS } from '@/lib/types/database'
import UsuariosClient from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user?.id ?? '').single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: usuarios } = await supabase
    .from('user_profiles')
    .select('*')
    .order('nome_completo')

  return <UsuariosClient usuarios={usuarios ?? []} />
}
