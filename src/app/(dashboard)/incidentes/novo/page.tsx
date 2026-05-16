'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { TIPO_INCIDENTE_LABELS, GRAVIDADE_LABELS } from '@/lib/types/database'
import type { TipoIncidente, GravidadeIncidente } from '@/lib/types/database'

export default function NovoIncidentePage() {
  const router = useRouter()
  const [residentes, setResidentes] = useState<any[]>([])
  const [form, setForm] = useState({
    residente_id: '', tipo: '' as TipoIncidente | '',
    data_hora_evento: new Date().toISOString().slice(0, 16),
    local_ocorrencia: '', descricao: '', gravidade: '' as GravidadeIncidente | '',
    dano_causado: '', testemunhas: '',
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('residentes').select('id, nome, quarto').eq('status', 'ativo').order('nome')
      .then(({ data }) => setResidentes(data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.residente_id || !form.tipo || !form.gravidade) return
    setError(null)

    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error: e } = await supabase.from('incidentes').insert({
        residente_id: form.residente_id,
        registrado_por: user?.id,
        tipo: form.tipo,
        descricao: form.descricao,
        data_hora_evento: new Date(form.data_hora_evento).toISOString(),
        local_ocorrencia: form.local_ocorrencia || null,
        gravidade: form.gravidade,
        dano_causado: form.dano_causado || null,
        testemunhas: form.testemunhas || null,
        status: 'aberto',
      }).select().single()

      if (e) { setError(e.message); return }

      // Notificar admins
      const { data: admins } = await supabase
        .from('user_profiles').select('id').eq('role', 'admin').eq('ativo', true)
      if (admins?.length && data) {
        await supabase.from('notificacoes').insert(admins.map(a => ({
          destinatario_id: a.id,
          tipo: 'incidente_novo',
          titulo: `Novo incidente registrado`,
          mensagem: `${TIPO_INCIDENTE_LABELS[form.tipo as TipoIncidente]} — gravidade: ${form.gravidade.replace('nivel_', 'Nível ')}`,
          link: `/incidentes/${data.id}`,
          lida: false,
        })))
      }

      router.push(`/incidentes/${data.id}`)
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/incidentes" className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Registrar Incidente
          </h1>
          <p className="text-muted text-sm">Preencha todas as informações com precisão e objetividade.</p>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Residente afetado *</label>
            <select value={form.residente_id} onChange={e => setForm({...form, residente_id: e.target.value})} className="input" required>
              <option value="">Selecionar residente...</option>
              {residentes.map(r => <option key={r.id} value={r.id}>{r.nome}{r.quarto ? ` — Apto ${r.quarto}` : ''}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Tipo de incidente *</label>
            <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value as TipoIncidente})} className="input" required>
              <option value="">Selecionar tipo...</option>
              {Object.entries(TIPO_INCIDENTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Data e hora do evento *</label>
            <input type="datetime-local" value={form.data_hora_evento} onChange={e => setForm({...form, data_hora_evento: e.target.value})} className="input" required />
          </div>

          <div>
            <label className="label">Local de ocorrência</label>
            <input value={form.local_ocorrencia} onChange={e => setForm({...form, local_ocorrencia: e.target.value})} className="input" placeholder="Ex: quarto, banheiro, corredor..." />
          </div>
        </div>

        <div>
          <label className="label">Descrição detalhada do evento *</label>
          <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} className="input min-h-[120px] resize-y" placeholder="Descreva o que aconteceu, em qual contexto, quais foram os fatos observados..." required minLength={30} />
          <p className="text-xs text-muted mt-1">Mínimo 30 caracteres ({form.descricao.length}/30)</p>
        </div>

        <div>
          <label className="label">Gravidade estimada *</label>
          <div className="space-y-1.5">
            {Object.entries(GRAVIDADE_LABELS).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setForm({...form, gravidade: k as GravidadeIncidente})}
                className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${form.gravidade === k ? 'border-primary-800 bg-primary-50' : 'border-border hover:border-primary-300'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Dano causado</label>
            <textarea value={form.dano_causado} onChange={e => setForm({...form, dano_causado: e.target.value})} className="input min-h-[80px] resize-y" placeholder="Descreva os danos identificados..." />
          </div>
          <div>
            <label className="label">Testemunhas</label>
            <textarea value={form.testemunhas} onChange={e => setForm({...form, testemunhas: e.target.value})} className="input min-h-[80px] resize-y" placeholder="Nome e função das testemunhas..." />
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/incidentes" className="btn-secondary flex-1 text-center">Cancelar</Link>
          <button type="submit" disabled={isPending || form.descricao.length < 30} className="btn-danger flex-1 flex items-center justify-center gap-2">
            {isPending ? 'Registrando...' : <><AlertTriangle className="w-4 h-4" />Registrar incidente</>}
          </button>
        </div>
      </form>
    </div>
  )
}
