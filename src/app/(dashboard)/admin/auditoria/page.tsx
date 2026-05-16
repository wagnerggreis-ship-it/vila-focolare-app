import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateTime } from '@/lib/utils/formatters'
import { Shield } from 'lucide-react'

const ACAO_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  READ_SENSITIVE: 'bg-yellow-100 text-yellow-800',
}

export default async function AuditoriaPage({
  searchParams,
}: { searchParams: { page?: string; acao?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user?.id ?? '').single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const page = Number(searchParams.page ?? '1')
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('audit_log')
    .select('*, usuario:usuario_id(id, nome_completo)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (searchParams.acao) query = query.eq('acao', searchParams.acao)

  const { data: logs, count } = await query
  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold">Log de Auditoria</h1>
          <p className="text-muted text-sm">{count ?? 0} registros · Append-only (imutável)</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['', 'CREATE', 'UPDATE', 'DELETE', 'READ_SENSITIVE'].map(a => (
          <a key={a} href={a ? `?acao=${a}` : '?'}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${(searchParams.acao === a || (!searchParams.acao && !a)) ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-muted border-border hover:border-primary-300'}`}>
            {a || 'Todas as ações'}
          </a>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Data/Hora</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Tabela</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log: any) => (
              <tr key={log.id}>
                <td className="text-xs text-muted whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                <td className="text-sm">{log.usuario?.nome_completo ?? 'Sistema'}</td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ACAO_COLORS[log.acao] ?? 'bg-gray-100 text-gray-700'}`}>
                    {log.acao}
                  </span>
                </td>
                <td className="text-sm font-mono text-muted">{log.tabela}</td>
                <td className="text-xs text-muted max-w-xs truncate">
                  {log.detalhes ? JSON.stringify(log.detalhes).slice(0, 80) + '...' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?page=${p}${searchParams.acao ? `&acao=${searchParams.acao}` : ''}`}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium ${p === page ? 'bg-primary-800 text-white' : 'bg-white border border-border text-muted hover:border-primary-300'}`}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
