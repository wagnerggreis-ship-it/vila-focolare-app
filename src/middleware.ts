import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLoginRoute  = pathname.startsWith('/login')
  const isAuthRoute   = pathname.startsWith('/login') || pathname.startsWith('/auth/callback') || pathname.startsWith('/nova-senha')
  const isPublicRoute = pathname === '/'
  const isAdminRoute  = pathname.startsWith('/admin')

  // ── MODO DEMONSTRAÇÃO ───────────────────────────────────────────────────────
  // Evita inicializar Supabase (que precisaria de SUPABASE_URL real).
  // Autenticação é verificada apenas pelo cookie vila_demo=1.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const isDemo = request.cookies.get('vila_demo')?.value === '1'

    if (!isDemo && !isAuthRoute && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (isDemo && isLoginRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // /admin em demo mode — demo user é admin, permitir acesso
    return NextResponse.next({ request })
  }

  // ── PRODUÇÃO ────────────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2],
            ),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. Sem autenticação → redireciona para /login
  if (!user && !isAuthRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. Já autenticado tentando acessar /login → redireciona para /dashboard
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. Rotas /admin → verificar perfil admin
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, ativo')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' && profile?.ativo === true
    if (!isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}
