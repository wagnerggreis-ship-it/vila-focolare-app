import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FormRegistroRotina } from '@/components/rotina/FormRegistroRotina'
import { SemaforoRisco } from '@/components/residentes/SemaforoRisco'
import { buscarStatusRotinaHoje } from '@/lib/rotina/actions'
import { calcularIdade } from '@/lib/utils/formatters'
import type { Residente } from '@/lib/types/database'

interface Props {
  params: { residenteId: string }
}

export default async function RegistroRotinaPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: residente } = await supabase
    .from('residentes')
    .select('*')
    .eq('id', params.residenteId)
    .single()

  if (!residente) notFound()

  const r = residente as Residente
  const statusHoje = await buscarStatusRotinaHoje(r.id)

  return (
    <div className="animate-fade-in">
      {/* Header fixo mobile */}
      <div className="sticky top-0 bg-white border-b border-border z-30 -mx-4 px-4 pb-3 mb-5 lg:mx-0 lg:px-0 lg:static lg:bg-transparent lg:border-none">
        <Link
          href="/rotina"
          className="flex items-center gap-2 text-sm text-muted hover:text-primary-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Meu Turno
        </Link>

        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-base flex-shrink-0">
              {(r.nome_social ?? r.nome).split(' ').slice(0, 2).map((p: string) => p[0]).join('')}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5">
              <SemaforoRisco nivel={r.nivel_risco} size="sm" showLabel={false} />
            </div>
          </div>

          <div>
            <h1 className="text-lg font-bold text-foreground">
              {r.nome_social ?? r.nome.split(' ')[0]}
            </h1>
            <p className="text-xs text-muted">
              {calcularIdade(r.data_nascimento)} anos
              {r.quarto ? ` · Quarto ${r.quarto}` : ''}
              {' · '}<SemaforoRisco nivel={r.nivel_risco} size="sm" />
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de rotina */}
      <FormRegistroRotina
        residenteId={r.id}
        statusInicial={statusHoje}
      />
    </div>
  )
}
