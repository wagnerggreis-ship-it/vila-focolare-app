import { NextResponse } from 'next/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { RoleUsuario } from '@/lib/types/database'

const ROLES_VALIDOS: RoleUsuario[] = [
  'admin',
  'medico',
  'enfermeiro',
  'tecnico_enfermagem',
  'fisioterapeuta',
  'nutricionista',
  'psicologo',
  'assistente_social',
  'terapeuta_ocupacional',
  'farmaceutico',
]

type CriarUsuarioPayload = {
  nome_completo?: string
  email?: string
  role?: RoleUsuario
  registro_profissional?: string
  especialidade?: string
}

function normalizarTexto(valor: unknown) {
  return typeof valor === 'string' ? valor.trim() : ''
}

function jsonErro(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return jsonErro('Sessão expirada. Faça login novamente para criar usuários.', 401)
  }

  const { data: solicitante, error: solicitanteError } = await supabase
    .from('user_profiles')
    .select('role, ativo')
    .eq('id', user.id)
    .single()

  if (solicitanteError || solicitante?.role !== 'admin' || solicitante?.ativo === false) {
    return jsonErro('Apenas administradores ativos podem criar novos usuários.', 403)
  }

  let payload: CriarUsuarioPayload
  try {
    payload = await request.json()
  } catch {
    return jsonErro('Dados inválidos. Revise o formulário e tente novamente.')
  }

  const nomeCompleto = normalizarTexto(payload.nome_completo)
  const email = normalizarTexto(payload.email).toLowerCase()
  const role = payload.role
  const registroProfissional = normalizarTexto(payload.registro_profissional)
  const especialidade = normalizarTexto(payload.especialidade)

  if (!nomeCompleto) return jsonErro('Informe o nome completo.')
  if (!email || !email.includes('@')) return jsonErro('Informe um email válido.')
  if (!role || !ROLES_VALIDOS.includes(role)) return jsonErro('Selecione uma função válida.')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonErro(
      'Configuração de criação de usuários ausente. Verifique SUPABASE_SERVICE_ROLE_KEY no ambiente de produção.',
      500,
    )
  }

  const admin = createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const redirectTo = origin ? `${origin}/auth/callback?next=/nova-senha` : undefined

  const { data: convite, error: conviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      nome_completo: nomeCompleto,
      role,
    },
    redirectTo,
  })

  if (conviteError || !convite.user) {
    return jsonErro(conviteError?.message ?? 'Não foi possível enviar o convite ao novo usuário.', 400)
  }

  const profile = {
    id: convite.user.id,
    nome_completo: nomeCompleto,
    role,
    registro_profissional: registroProfissional || null,
    especialidade: especialidade || null,
    ativo: true,
  }

  const { data: perfilCriado, error: profileError } = await admin
    .from('user_profiles')
    .insert(profile)
    .select('*')
    .single()

  if (profileError) {
    await admin.auth.admin.deleteUser(convite.user.id)
    return jsonErro(`Convite cancelado: não foi possível criar o perfil do usuário. ${profileError.message}`, 400)
  }

  return NextResponse.json({ profile: perfilCriado })
}
