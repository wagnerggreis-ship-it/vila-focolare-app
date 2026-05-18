'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo/data'

async function getAppOrigin() {
  const headerStore = await headers()
  const origin = headerStore.get('origin')
  if (origin) return origin

  const host = headerStore.get('host')
  const protocol = headerStore.get('x-forwarded-proto') ?? 'https'
  return host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL ?? ''
}

export async function signIn(formData: FormData) {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  // ── MODO DEMONSTRAÇÃO ───────────────────────────────────────────────────────
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const cookieStore = await cookies()
      cookieStore.set('vila_demo', '1', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 28800, // 8 h
        path: '/',
      })
      redirect('/dashboard')
    }
    return { error: 'Modo demonstração — use admin@demo.com / admin123' }
  }

  // ── PRODUÇÃO ────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou senha inválidos. Se for o primeiro acesso, use o link recebido por email ou clique em “Primeiro acesso / esqueci minha senha”.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email || !email.includes('@')) {
    return { error: 'Informe um email válido para receber o link de acesso.' }
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return { error: 'No modo demonstração, use admin@demo.com / admin123.' }
  }

  const origin = await getAppOrigin()
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/nova-senha`,
  })

  if (error) {
    return { error: 'Não foi possível enviar o link agora. Verifique o email e tente novamente.' }
  }

  return {
    success: 'Enviamos um link para esse email. Ao abrir o link, o profissional poderá definir uma nova senha de acesso.',
  }
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (password.length < 8) {
    return { error: 'A nova senha deve ter pelo menos 8 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas informadas não coincidem.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Não foi possível atualizar a senha. Abra novamente o link enviado por email e tente outra vez.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  // ── MODO DEMONSTRAÇÃO ───────────────────────────────────────────────────────
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const cookieStore = await cookies()
    cookieStore.delete('vila_demo')
    redirect('/login')
  }

  // ── PRODUÇÃO ────────────────────────────────────────────────────────────────
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}
