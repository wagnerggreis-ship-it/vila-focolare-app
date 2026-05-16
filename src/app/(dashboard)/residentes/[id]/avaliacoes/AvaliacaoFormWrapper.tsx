'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { TipoAvaliacao } from '@/lib/types/database'
import { AVALIACAO_LABELS } from '@/lib/types/database'
import FormKatz from '@/components/avaliacoes/instrumentos/FormKatz'
import FormBarthel from '@/components/avaliacoes/instrumentos/FormBarthel'
import FormBraden from '@/components/avaliacoes/instrumentos/FormBraden'
import FormMorse from '@/components/avaliacoes/instrumentos/FormMorse'
import FormGDS15 from '@/components/avaliacoes/instrumentos/FormGDS15'
import FormPPS from '@/components/avaliacoes/instrumentos/FormPPS'

interface Props {
  instrumento: TipoAvaliacao
  residenteId: string
  residenteNome: string
  userId: string
}

export default function AvaliacaoFormWrapper({ instrumento, residenteId, residenteNome, userId }: Props) {
  const router = useRouter()

  const onSaved = () => {
    router.push(`/residentes/${residenteId}/avaliacoes`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href={`/residentes/${residenteId}/avaliacoes`} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{AVALIACAO_LABELS[instrumento]}</h1>
          <p className="text-muted text-sm">{residenteNome}</p>
        </div>
      </div>

      {instrumento === 'katz' && <FormKatz residenteId={residenteId} userId={userId} onSaved={onSaved} />}
      {instrumento === 'barthel' && <FormBarthel residenteId={residenteId} userId={userId} onSaved={onSaved} />}
      {instrumento === 'braden' && <FormBraden residenteId={residenteId} userId={userId} onSaved={onSaved} />}
      {instrumento === 'morse' && <FormMorse residenteId={residenteId} userId={userId} onSaved={onSaved} />}
      {instrumento === 'gds15' && <FormGDS15 residenteId={residenteId} userId={userId} onSaved={onSaved} />}
      {instrumento === 'pps' && <FormPPS residenteId={residenteId} userId={userId} onSaved={onSaved} />}
      {!['katz','barthel','braden','morse','gds15','pps'].includes(instrumento) && (
        <div className="card text-center py-12">
          <p className="text-muted">Formulário para {AVALIACAO_LABELS[instrumento]} em desenvolvimento.</p>
        </div>
      )}
    </div>
  )
}
