'use client'

import { useState, useEffect, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('config_instituicao').select('*').single().then(({ data }) => { if (data) setConfig(data) })
  }, [])

  async function salvar() {
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from('config_instituicao').update(config).eq('id', config.id)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  if (!config) return <div className="card text-center py-12"><p className="text-muted">Carregando...</p></div>

  const Field = ({ label, field, type = 'text' }: { label: string; field: string; type?: string }) => (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={config[field] ?? ''} onChange={e => setConfig({...config, [field]: type === 'number' ? Number(e.target.value) : e.target.value})} className="input" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <button onClick={salvar} disabled={isPending} className="btn-accent flex items-center gap-2">
          {saved ? <><CheckCircle className="w-4 h-4" />Salvo!</> : isPending ? 'Salvando...' : 'Salvar configurações'}
        </button>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide border-b border-border pb-3">Dados da Instituição</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome da instituição" field="nome" />
          <Field label="CNPJ" field="cnpj" />
          <Field label="Nome do responsável técnico" field="nome_responsavel" />
          <Field label="CRM do responsável" field="crm_responsavel" />
          <Field label="Telefone" field="telefone" />
          <Field label="Email de contato" field="email_contato" type="email" />
          <div className="sm:col-span-2">
            <Field label="Endereço completo" field="endereco" />
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide border-b border-border pb-3">Prazos de Avaliação (em dias)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Índice de Katz" field="prazo_avaliacao_katz_dias" type="number" />
          <Field label="Índice de Barthel" field="prazo_avaliacao_barthel_dias" type="number" />
          <Field label="MNA (Nutrição)" field="prazo_avaliacao_mna_dias" type="number" />
          <Field label="MMSE (Cognitivo)" field="prazo_avaliacao_mmse_dias" type="number" />
          <Field label="GDS-15 (Depressão)" field="prazo_avaliacao_gds_dias" type="number" />
          <Field label="Braden (UPP)" field="prazo_avaliacao_braden_dias" type="number" />
          <Field label="Morse (Quedas)" field="prazo_avaliacao_morse_dias" type="number" />
          <Field label="Revisão do plano (dias)" field="prazo_revisao_plano_dias" type="number" />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-primary-800 uppercase tracking-wide border-b border-border pb-3">Alertas de Medicação</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Field label="Alerta amarelo após (minutos)" field="alerta_med_amarelo_minutos" type="number" />
            <p className="text-xs text-muted mt-1">Dose não administrada após X minutos → alerta amarelo</p>
          </div>
          <div>
            <Field label="Alerta vermelho após (minutos)" field="alerta_med_vermelho_minutos" type="number" />
            <p className="text-xs text-muted mt-1">Dose não administrada após X minutos → alerta vermelho + notificação</p>
          </div>
        </div>
      </div>
    </div>
  )
}
