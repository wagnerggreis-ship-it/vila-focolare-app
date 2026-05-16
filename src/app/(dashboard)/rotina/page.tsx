import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardCheck, AlertTriangle, Users, CheckCircle2 } from 'lucide-react'
import { MeuTurnoCard } from '@/components/rotina/MeuTurnoCard'
import { buscarStatusRotinaHoje } from '@/lib/rotina/actions'
import type { Residente } from '@/lib/types/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const revalidate = 0

function detectarTurno() {
  const hora = new Date().getHours()
  if (hora >= 6 && hora < 14) return { label: 'Manhã', emoji: '🌅', color: 'text-amber-600' }
  if (hora >= 14 && hora < 22) return { label: 'Tarde', emoji: '☀️', color: 'text-orange-500' }
  return { label: 'Noite', emoji: '🌙', color: 'text-indigo-500' }
}

export default async function MeuTurnoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: residentes } = await supabase
    .from('residentes')
    .select('*')
    .eq('status', 'ativo')
    .order('nome')

  const lista = (residentes ?? []) as Residente[]

  // Buscar status de rotina de cada morador em paralelo
  const statusList = await Promise.all(
    lista.map(r => buscarStatusRotinaHoje(r.id))
  )

  const turno = detectarTurno()
  const hoje = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const completos = statusList.filter(s => s.completo).length

  return (
    <div className="space-y-5 animate-fade-in pb-24 lg:pb-6">
      {/* Cabeçalho do turno */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="w-5 h-5 text-primary-800" />
            <h1 className="text-xl font-bold text-foreground">Meu Turno</h1>
            <span className={`text-base font-semibold ${turno.color}`}>
              {turno.emoji} {turno.label}
            </span>
          </div>
          <p className="text-sm text-muted capitalize">{hoje}</p>
        </div>

        {/* Progresso geral */}
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-800">{completos}/{lista.length}</p>
          <p className="text-xs text-muted">rotinas completas</p>
        </div>
      </div>

      {/* Barra de progresso */}
      {lista.length > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${lista.length > 0 ? (completos / lista.length) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Aviso se todas completas */}
      {completos === lista.length && lista.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-800">Todas as rotinas completas!</p>
            <p className="text-sm text-green-700">Excelente trabalho no turno de hoje.</p>
          </div>
        </div>
      )}

      {/* Alerta para registrar intercorrências */}
      <div className="flex items-center justify-between p-3 bg-accent-50 border border-accent-200 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-accent-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Observe algum sinal de atenção?</span>
        </div>
        <Link
          href="/incidentes/novo"
          className="text-xs font-bold text-accent-700 hover:text-accent-900 underline whitespace-nowrap"
        >
          Registrar →
        </Link>
      </div>

      {/* Lista de moradores */}
      {lista.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhum morador ativo</p>
          <p className="text-sm mt-1">Cadastre moradores para registrar rotinas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
            Moradores ({lista.length})
          </h2>
          {lista.map((residente, i) => (
            <MeuTurnoCard
              key={residente.id}
              residente={residente}
              statusRotina={statusList[i]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
