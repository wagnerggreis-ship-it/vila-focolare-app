import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  const redirectUrl = new URL(request.url)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      redirectUrl.pathname = next.startsWith('/') ? next : '/dashboard'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  redirectUrl.pathname = '/login'
  redirectUrl.search = '?erro=link-invalido'
  return NextResponse.redirect(redirectUrl)
}
