import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, AlertTriangle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/formatters'
import { TIPO_INCIDENTE_LABELS, GRAVIDADE_LABELS } from '@/lib/types/database'
import type { Incidente } from '@/lib/types/database'

const STATUS_COLORS: Record<string, string> = {
  aberto: 'bg-red-100 text-red-800',
  investigando: 'bg-yellow-100 text-yellow-800',
  plano_acao: 'bg-orange-100 text-orange-800',
  fechado: 'bg-green-100 text-green-800',
}

const GRAVIDADE_CORES: Record<string, string> = {
  nivel_0: 'bg-gray-100 text-gray-700',
  nivel_1: 'bg-blue-100 text-blue-700',
  nivel_2: 'bg-yellow-100 text-yellow-700',
  nivel_3: 'bg-yellow-100 text-yellow-700',
  nivel_4: 'bg-orange-100 text-orange-700',
  nivel_5: 'bg-orange-100 text-orange-700',
  nivel_6: 'bg-red-100 text-red-800',
  nivel_7: 'bg-red-200 text-red-900',
}

export default async function IncidentesPage({
  searchParams,
}: {
  searchParams: { status?: string; tipo?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('incidentes')
    .select('*, residente:residente_id(id, nome, quarto), registrado_por_user:registrado_por(id, nome_completo)')
    .order('created_at', { ascending: false })

  if (searchParams.status) query = query.eq('status', searchParams.status)
  if (searchParams.tipo) query = query.eq('tipo', searchParams.tipo)

  const { data: incidentes } = await query

  const { count: abertos } = await supabase
    .from('incidentes').select('*', { count: 'exact', head: true })
    .in('status', ['aberto', 'investigando', 'plano_acao'])

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Incidentes</h1>
          {(abertos ?? 0) > 0 && (
            <p className="text-sm text-red-600 font-semibold mt-0.5">{abertos} incidente(s) em aberto</p>
          )}
        </div>
        <Link href="/incidentes/novo" className="btn-danger flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Registrar incidente
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['', 'aberto', 'investigando', 'plano_acao', 'fechado'].map(s => (
          <Link key={s} href={s ? `?status=${s}` : '?'}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              (searchParams.status === s || (!searchParams.status && !s))
                ? 'bg-primary-800 text-white border-primary-800'
                : 'bg-white text-muted border-border hover:border-primary-300'
            }`}
          >
            {!s ? 'Todos' : s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      {!incidentes || incidentes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted">Nenhum incidente registrado.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Residente</th>
                <th>Tipo</th>
                <th>Gravidade</th>
                <th>Data/Hora</th>
                <th>Status</th>
                <th>Registrado por</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {incidentes.map((inc: any) => (
                <tr key={inc.id}>
                  <td>
                    <p className="font-semibold text-foreground">{inc.residente?.nome}</p>
                    {inc.residente?.quarto && <p className="text-xs text-muted">Apto {inc.residente.quarto}</p>}
                  </td>
                  <td><span className="text-sm">{TIPO_INCIDENTE_LABELS[inc.tipo as keyof typeof TIPO_INCIDENTE_LABELS] ?? inc.tipo}</span></td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${GRAVIDADE_CORES[inc.gravidade] ?? 'bg-gray-100'}`}>
                      {inc.gravidade.replace('nivel_', 'Nível ')}
                    </span>
                  </td>
                  <td className="text-sm text-muted">{formatDateTime(inc.data_hora_evento)}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[inc.status] ?? 'bg-gray-100'}`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-xs text-muted">{inc.registrado_por_user?.nome_completo}</td>
                  <td>
                    <Link href={`/incidentes/${inc.id}`} className="text-xs text-primary-600 hover:underline">Ver →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
