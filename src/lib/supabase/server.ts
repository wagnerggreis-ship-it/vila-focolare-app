import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createDemoClient } from '@/lib/demo/client'

export async function createClient() {
  // ── MODO DEMONSTRAÇÃO ─────────────────────────────────────────────────────
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const cookieStore = await cookies()
    if (cookieStore.get('vila_demo')?.value === '1') {
      return createDemoClient() as any
    }
  }

  // ── PRODUÇÃO ──────────────────────────────────────────────────────────────
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]),
            )
          } catch {
            // Server Component — cookies podem ser somente leitura
          }
        },
      },
    },
  )
}
