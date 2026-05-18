'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABELS } from '@/lib/types/database'
import type { RoleUsuario, UserProfile } from '@/lib/types/database'
import { Plus, UserX, UserCheck } from 'lucide-react'

const ROLE_COLORS: Record<RoleUsuario, string> = {
  admin: 'bg-purple-100 text-purple-800', medico: 'bg-blue-100 text-blue-800',
  enfermeiro: 'bg-emerald-100 text-emerald-800', tecnico_enfermagem: 'bg-teal-100 text-teal-800',
  fisioterapeuta: 'bg-indigo-100 text-indigo-800', nutricionista: 'bg-orange-100 text-orange-800',
  psicologo: 'bg-pink-100 text-pink-800', assistente_social: 'bg-cyan-100 text-cyan-800',
  terapeuta_ocupacional: 'bg-violet-100 text-violet-800', farmaceutico: 'bg-yellow-100 text-yellow-800',
}

interface Props { usuarios: UserProfile[] }

export default function UsuariosClient({ usuarios: initialUsuarios }: Props) {
  const [usuarios, setUsuarios] = useState(initialUsuarios)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nome_completo: '', email: '', role: 'enfermeiro' as RoleUsuario, registro_profissional: '', especialidade: '' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function criarUsuario() {
    setError(null)
    startTransition(async () => {
      try {
        const resp = await fetch('/api/admin/criar-usuario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const isJson = resp.headers.get('content-type')?.includes('application/json')
        const resultado = isJson ? await resp.json() : null

        if (!resp.ok) {
          setError(resultado?.error ?? 'Não foi possível criar o usuário. Tente novamente em instantes.')
          return
        }

        if (!resultado?.profile) {
          setError('Usuário criado, mas o perfil não foi retornado. Atualize a página para conferir a lista.')
          return
        }

        setUsuarios([resultado.profile, ...usuarios])
        setShowModal(false)
        setForm({ nome_completo: '', email: '', role: 'enfermeiro', registro_profissional: '', especialidade: '' })
      } catch {
        setError('Não foi possível criar o usuário. Verifique a conexão e tente novamente.')
      }
    })
  }

  async function alterarStatus(id: string, ativo: boolean) {
    const supabase = createClient()
    startTransition(async () => {
      await supabase.from('user_profiles').update({ ativo }).eq('id', id)
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, ativo } : u))
    })
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários do Sistema</h1>
          <p className="text-muted text-sm">{usuarios.filter(u => u.ativo).length} ativos · {usuarios.filter(u => !u.ativo).length} inativos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-accent flex items-center gap-2">
          <Plus className="w-4 h-4" />Novo usuário
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Função</th>
              <th>Registro profissional</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xs font-bold flex-shrink-0">
                      {u.nome_completo.split(' ').slice(0, 2).map(p => p[0]).join('')}
                    </div>
                    <span className="font-semibold text-foreground text-sm">{u.nome_completo}</span>
                  </div>
                </td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="text-sm text-muted">{u.registro_profissional ?? '—'}</td>
                <td>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => alterarStatus(u.id, !u.ativo)}
                    className={`text-xs flex items-center gap-1 font-semibold ${u.ativo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                  >
                    {u.ativo ? <><UserX className="w-3.5 h-3.5" />Desativar</> : <><UserCheck className="w-3.5 h-3.5" />Reativar</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Novo Usuário</h2>
            <div className="space-y-3">
              <div><label className="label">Nome completo *</label><input value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} className="input" /></div>
              <div><label className="label">Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" /></div>
              <div>
                <label className="label">Função *</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value as RoleUsuario})} className="input">
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className="label">Registro profissional</label><input value={form.registro_profissional} onChange={e => setForm({...form, registro_profissional: e.target.value})} className="input" placeholder="CRM, COREN, CRN..." /></div>
              <div><label className="label">Especialidade</label><input value={form.especialidade} onChange={e => setForm({...form, especialidade: e.target.value})} className="input" /></div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-muted">O usuário receberá um email para definir sua senha.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={criarUsuario} disabled={isPending || !form.nome_completo || !form.email} className="btn-accent flex-1">{isPending ? 'Criando...' : 'Criar usuário'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
