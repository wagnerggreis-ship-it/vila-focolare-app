import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import { calcularIdade, formatDate } from '@/lib/utils/formatters'
import type { Residente } from '@/lib/types/database'

export default async function ResidentesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; risco?: string }
}) {
  const supabase = await createClient()

  let query = supabase
    .from('residentes')
    .select('*')
    .order('nome')

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  } else {
    query = query.eq('status', 'ativo')
  }

  if (searchParams.risco) {
    query = query.eq('nivel_risco', searchParams.risco)
  }

  if (searchParams.q) {
    query = query.ilike('nome', `%${searchParams.q}%`)
  }

  const { data: residentes } = await query

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Residentes</h1>
          <p className="text-muted text-sm mt-0.5">
            {residentes?.length ?? 0} residente(s) {searchParams.status ?? 'ativo(s)'}
          </p>
        </div>
        <Link href="/residentes/novo" className="btn-accent flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Nova admissão
        </Link>
      </div>

      {/* Filtros e busca */}
      <div className="card-sm flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <form>
            <input
              name="q"
              defaultValue={searchParams.q}
              placeholder="Buscar pelo nome..."
              className="input pl-9"
            />
          </form>
        </div>

        {/* Filtro de risco */}
        <div className="flex gap-2 flex-wrap">
          {['', 'verde', 'amarelo', 'laranja', 'vermelho'].map((nivel) => (
            <Link
              key={nivel}
              href={nivel ? `?risco=${nivel}` : '?'}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                searchParams.risco === nivel || (!searchParams.risco && !nivel)
                  ? 'bg-primary-800 text-white border-primary-800'
                  : 'bg-white text-muted border-border hover:border-primary-300'
              }`}
            >
              {!nivel ? 'Todos' :
               nivel === 'verde' ? '● Estável' :
               nivel === 'amarelo' ? '● Atenção' :
               nivel === 'laranja' ? '● Alerta' : '● Crítico'}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid de residentes */}
      {!residentes || residentes.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-muted text-lg font-medium">Nenhum residente encontrado</p>
          <p className="text-muted text-sm mt-1">
            {searchParams.q ? 'Tente ajustar a busca.' : 'Inicie cadastrando o primeiro residente.'}
          </p>
          {!searchParams.q && (
            <Link href="/residentes/novo" className="btn-accent inline-flex items-center gap-2 mt-4">
              <Plus className="w-4 h-4" />
              Cadastrar primeiro residente
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(residentes as Residente[]).map((residente) => (
            <Link
              key={residente.id}
              href={`/residentes/${residente.id}`}
              className="card-sm hover:shadow-card-hover transition-shadow group cursor-pointer"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-lg flex-shrink-0">
                  {residente.nome.split(' ').slice(0, 2).map(p => p[0]).join('')}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-foreground text-sm leading-tight group-hover:text-primary-800 transition-colors">
                      {residente.nome}
                    </p>
                    <SemaforoRisco nivel={residente.nivel_risco} size="sm" />
                  </div>

                  <p className="text-xs text-muted mt-1">
                    {calcularIdade(residente.data_nascimento)} anos
                    {residente.quarto && ` · Apto ${residente.quarto}`}
                  </p>

                  <p className="text-xs text-muted mt-0.5">
                    Desde {formatDate(residente.data_admissao)}
                  </p>

                  {residente.diagnosticos_principais && residente.diagnosticos_principais.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {residente.diagnosticos_principais.slice(0, 2).map((diag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded font-medium"
                        >
                          {diag}
                        </span>
                      ))}
                      {residente.diagnosticos_principais.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-border text-muted rounded">
                          +{residente.diagnosticos_principais.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {residente.alergias && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] text-red-600 font-semibold">
                    ⚠ Alergias: {residente.alergias}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
