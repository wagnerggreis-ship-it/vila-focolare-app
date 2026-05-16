import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import type { UserProfile } from '@/lib/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.ativo) redirect('/login')

  // Notificações não lidas
  const { count: notificacoesNaoLidas } = await supabase
    .from('notificacoes')
    .select('*', { count: 'exact', head: true })
    .eq('destinatario_id', user.id)
    .eq('lida', false)

  return (
    <div className="min-h-screen bg-warm-white">
      <Sidebar profile={profile as UserProfile} />

      {/* Conteúdo principal com offset da sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          profile={profile as UserProfile}
          notificacoesNaoLidas={notificacoesNaoLidas ?? 0}
        />

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      <MobileNav />

      {/* Botão flutuante de incidente — visível em todas as telas */}
      <BotaoIncidenteFlutante />
    </div>
  )
}

function BotaoIncidenteFlutante() {
  return (
    <a
      href="/incidentes/novo"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-14 h-14 bg-destructive hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors group"
      title="Registrar intercorrência"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      {/* Tooltip */}
      <span className="absolute right-16 bg-foreground text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Registrar intercorrência
      </span>
    </a>
  )
}
