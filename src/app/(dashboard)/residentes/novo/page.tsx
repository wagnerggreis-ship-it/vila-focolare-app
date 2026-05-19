'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoResidentePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [diagnosticos, setDiagnosticos] = useState<string[]>([])
  const [diagInput, setDiagInput] = useState('')

  function adicionarDiagnostico() {
    const trimmed = diagInput.trim()
    if (trimmed && !diagnosticos.includes(trimmed)) {
      setDiagnosticos([...diagnosticos, trimmed])
      setDiagInput('')
    }
  }

  function removerDiagnostico(diag: string) {
    setDiagnosticos(diagnosticos.filter(d => d !== diag))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Sessão expirada. Faça login novamente.'); return }

      const { data, error: insertError } = await supabase
        .from('residentes')
        .insert({
          nome: formData.get('nome') as string,
          nome_social: formData.get('nome_social') as string || null,
          data_nascimento: formData.get('data_nascimento') as string,
          sexo: formData.get('sexo') as string || null,
          cpf: formData.get('cpf') as string || null,
          rg: formData.get('rg') as string || null,
          numero_sus: formData.get('numero_sus') as string || null,
          plano_saude: formData.get('plano_saude') as string || null,
          numero_plano: formData.get('numero_plano') as string || null,
          quarto: formData.get('quarto') as string || null,
          data_admissao: formData.get('data_admissao') as string,
          diagnosticos_principais: diagnosticos,
          alergias: formData.get('alergias') as string || null,
          observacoes_gerais: formData.get('observacoes_gerais') as string || null,
          medico_responsavel_id: formData.get('medico_responsavel_id') as string || null,
          status: 'ativo',
          nivel_risco: 'verde',
        })
        .select()
        .single()

      if (insertError) { setError('Erro ao cadastrar residente: ' + insertError.message); return }
      router.push(`/residentes/${data.id}`)
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/residentes" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Admissão</h1>
          <p className="text-muted text-sm">Cadastro de novo residente na Villa Focolari</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dados pessoais */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-primary-800 border-b border-border pb-3">Dados Pessoais</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nome completo *</label>
              <input name="nome" required className="input" placeholder="Nome completo da residente" />
            </div>
            <div>
              <label className="label">Como gosta de ser chamada</label>
              <input name="nome_social" className="input" placeholder="Apelido ou nome social" />
            </div>
            <div>
              <label className="label">Sexo</label>
              <select name="sexo" className="input">
                <option value="">Selecione</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="label">Data de nascimento *</label>
              <input name="data_nascimento" type="date" required className="input" />
            </div>
            <div>
              <label className="label">CPF</label>
              <input name="cpf" className="input" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="label">RG</label>
              <input name="rg" className="input" placeholder="Número do RG" />
            </div>
            <div>
              <label className="label">Número do Cartão SUS</label>
              <input name="numero_sus" className="input" placeholder="000 0000 0000 0000" />
            </div>
            <div>
              <label className="label">Plano de Saúde</label>
              <input name="plano_saude" className="input" placeholder="Nome do plano" />
            </div>
            <div>
              <label className="label">Número do Plano</label>
              <input name="numero_plano" className="input" placeholder="Número da carteirinha" />
            </div>
          </div>
        </div>

        {/* Dados de admissão */}
        <div className="card space-y-4">
          <h2 className="text-base font-bold text-primary-800 border-b border-border pb-3">Dados da Admissão</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Data de admissão *</label>
              <input
                name="data_admissao"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="input"
              />
            </div>
            <div>
              <label className="label">Apto / Quarto</label>
              <input name="quarto" className="input" placeholder="Ex: 01, 02A, Suite 3" />
            </div>
          </div>

          {/* Diagnósticos */}
          <div>
            <label className="label">Diagnósticos principais</label>
            <div className="flex gap-2">
              <input
                value={diagInput}
                onChange={e => setDiagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarDiagnostico() } }}
                className="input flex-1"
                placeholder="Ex: HAS, DM2, ICC — pressione Enter para adicionar"
              />
              <button type="button" onClick={adicionarDiagnostico} className="btn-secondary px-3">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {diagnosticos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {diagnosticos.map(d => (
                  <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-800 border border-primary-200 rounded-full text-xs font-semibold">
                    {d}
                    <button type="button" onClick={() => removerDiagnostico(d)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Alergias conhecidas</label>
            <input name="alergias" className="input" placeholder="Ex: Dipirona, Penicilina — deixe em branco se não há" />
          </div>

          <div>
            <label className="label">Observações gerais de admissão</label>
            <textarea name="observacoes_gerais" className="input min-h-[80px] resize-y" placeholder="Contexto clínico e social relevante para a admissão..." />
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 justify-end">
          <Link href="/residentes" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={isPending} className="btn-accent flex items-center gap-2">
            {isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Salvando...</>
            ) : 'Confirmar admissão'}
          </button>
        </div>
      </form>
    </div>
  )
}
