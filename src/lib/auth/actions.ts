'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/demo/data'

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
    return { error: 'Email ou senha inválidos. Verifique seus dados e tente novamente.' }
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
