'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { BotaoRotina } from './BotaoRotina'
import { SecaoRotina } from './SecaoRotina'
import { salvarRegistroRotina } from '@/lib/rotina/actions'
import type { TipoRotina } from '@/lib/types/database'
import { cn } from '@/lib/utils/formatters'

interface OpcaoRotina {
  valor: string
  label: string
  emoji: string
  variant?: 'default' | 'ok' | 'alerta' | 'perigo'
  exigeObservacao?: boolean
}

const OPCOES: Record<TipoRotina, OpcaoRotina[]> = {
  banho: [
    { valor: 'realizado', label: 'Realizado', emoji: '✅', variant: 'ok' },
    { valor: 'recusado', label: 'Recusado', emoji: '❌', variant: 'perigo', exigeObservacao: true },
    { valor: 'nao_realizado', label: 'Não realizado', emoji: '⏭️', variant: 'alerta', exigeObservacao: true },
    { valor: 'higiene_parcial', label: 'Higiene parcial', emoji: '🚿', variant: 'alerta' },
  ],
  alimentacao: [
    { valor: 'bem', label: 'Alimentou-se bem', emoji: '😊', variant: 'ok' },
    { valor: 'parcialmente', label: 'Parcialmente', emoji: '😐', variant: 'alerta' },
    { valor: 'pouco', label: 'Comeu pouco', emoji: '😟', variant: 'alerta', exigeObservacao: true },
    { valor: 'recusou', label: 'Recusou', emoji: '❌', variant: 'perigo', exigeObservacao: true },
    { valor: 'nao_ofertado', label: 'Não ofertado', emoji: '🚫', variant: 'alerta', exigeObservacao: true },
  ],
  sono: [
    { valor: 'bem', label: 'Dormiu bem', emoji: '😴', variant: 'ok' },
    { valor: 'mal', label: 'Dormiu mal', emoji: '😣', variant: 'alerta' },
    { valor: 'interrompido', label: 'Interrompido', emoji: '🔄', variant: 'alerta' },
    { valor: 'sonolencia_excessiva', label: 'Sonolência excessiva', emoji: '😵', variant: 'perigo', exigeObservacao: true },
    { valor: 'agitacao', label: 'Agitação noturna', emoji: '😤', variant: 'perigo', exigeObservacao: true },
  ],
  evacuacao: [
    { valor: 'evacuou', label: 'Evacuou', emoji: '✅', variant: 'ok' },
    { valor: 'nao_evacuou', label: 'Não evacuou', emoji: '⏭️', variant: 'alerta' },
    { valor: 'alterada', label: 'Alterada', emoji: '⚠️', variant: 'alerta', exigeObservacao: true },
    { valor: 'diarreia', label: 'Diarreia', emoji: '🔴', variant: 'perigo', exigeObservacao: true },
    { valor: 'constipacao', label: 'Constipação', emoji: '🟡', variant: 'alerta', exigeObservacao: true },
  ],
  diurese: [
    { valor: 'presente', label: 'Presente', emoji: '✅', variant: 'ok' },
    { valor: 'reduzida', label: 'Reduzida', emoji: '⬇️', variant: 'alerta', exigeObservacao: true },
    { valor: 'ausente', label: 'Ausente', emoji: '❌', variant: 'perigo', exigeObservacao: true },
    { valor: 'alteracao', label: 'Alteração', emoji: '⚠️', variant: 'alerta', exigeObservacao: true },
  ],
  sinal_atencao: [],
}

const SINAIS = [
  { valor: 'dor', label: 'Dor', emoji: '😣' },
  { valor: 'febre', label: 'Febre', emoji: '🌡️' },
  { valor: 'falta_de_ar', label: 'Falta de ar', emoji: '😮‍💨' },
  { valor: 'tontura', label: 'Tontura', emoji: '💫' },
  { valor: 'sonolencia_incomum', label: 'Sonolência incomum', emoji: '😪' },
  { valor: 'agitacao_confusao', label: 'Agitação/confusão', emoji: '😤' },
  { valor: 'queda', label: 'Queda', emoji: '⚠️' },
  { valor: 'quase_queda', label: 'Quase queda', emoji: '⚡' },
  { valor: 'recusa_importante', label: 'Recusa importante', emoji: '🚫' },
  { valor: 'outro', label: 'Outro', emoji: '📋' },
]

const SECOES = [
  { tipo: 'banho' as TipoRotina, titulo: 'Banho', emoji: '🚿', essencial: true },
  { tipo: 'alimentacao' as TipoRotina, titulo: 'Alimentação', emoji: '🍽️', essencial: true },
  { tipo: 'sono' as TipoRotina, titulo: 'Sono', emoji: '😴', essencial: false },
  { tipo: 'evacuacao' as TipoRotina, titulo: 'Evacuação', emoji: '🚽', essencial: true },
  { tipo: 'diurese' as TipoRotina, titulo: 'Diurese', emoji: '💧', essencial: true },
]

interface RegistroState {
  status: string
  observacao: string
  salvo: boolean
  erro: string | null
}

interface FormRegistroRotinaProps {
  residenteId: string
  statusInicial?: Record<string, boolean>
}

export function FormRegistroRotina({ residenteId, statusInicial = {} }: FormRegistroRotinaProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [registros, setRegistros] = useState<Record<TipoRotina, RegistroState>>({
    banho: { status: '', observacao: '', salvo: statusInicial.banho ?? false, erro: null },
    alimentacao: { status: '', observacao: '', salvo: statusInicial.alimentacao ?? false, erro: null },
    sono: { status: '', observacao: '', salvo: statusInicial.sono ?? false, erro: null },
    evacuacao: { status: '', observacao: '', salvo: statusInicial.evacuacao ?? false, erro: null },
    diurese: { status: '', observacao: '', salvo: statusInicial.diurese ?? false, erro: null },
    sinal_atencao: { status: '', observacao: '', salvo: false, erro: null },
  })

  const [sinaisSelecionados, setSinaisSelecionados] = useState<string[]>([])
  const [descricaoSinal, setDescricaoSinal] = useState('')
  const [sinalSalvo, setSinalSalvo] = useState(statusInicial.sinal_atencao ?? false)
  const [errGlobal, setErrGlobal] = useState<string | null>(null)

  function selecionarStatus(tipo: TipoRotina, valor: string) {
    setRegistros(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], status: valor, erro: null },
    }))
  }

  function setObservacao(tipo: TipoRotina, obs: string) {
    setRegistros(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], observacao: obs },
    }))
  }

  async function salvarSecao(tipo: TipoRotina) {
    const reg = registros[tipo]
    if (!reg.status) {
      setRegistros(prev => ({ ...prev, [tipo]: { ...prev[tipo], erro: 'Selecione uma opção' } }))
      return
    }
    const opcao = OPCOES[tipo].find(o => o.valor === reg.status)
    if (opcao?.exigeObservacao && !reg.observacao.trim()) {
      setRegistros(prev => ({ ...prev, [tipo]: { ...prev[tipo], erro: 'Informe uma observação para esta opção' } }))
      return
    }

    const fd = new FormData()
    fd.set('residente_id', residenteId)
    fd.set('tipo_rotina', tipo)
    fd.set('status', reg.status)
    if (reg.observacao) fd.set('observacao', reg.observacao)

    startTransition(async () => {
      const result = await salvarRegistroRotina(fd)
      if (result.error) {
        setRegistros(prev => ({ ...prev, [tipo]: { ...prev[tipo], erro: result.error! } }))
      } else {
        setRegistros(prev => ({ ...prev, [tipo]: { ...prev[tipo], salvo: true, erro: null } }))
      }
    })
  }

  async function salvarSinais() {
    if (sinaisSelecionados.length === 0) return
    if (!descricaoSinal.trim()) {
      setErrGlobal('Descreva brevemente o que foi observado')
      return
    }
    const fd = new FormData()
    fd.set('residente_id', residenteId)
    fd.set('tipo_rotina', 'sinal_atencao')
    fd.set('status', sinaisSelecionados.join(','))
    fd.set('observacao', descricaoSinal)

    startTransition(async () => {
      const result = await salvarRegistroRotina(fd)
      if (result.error) {
        setErrGlobal(result.error)
      } else {
        setSinalSalvo(true)
        setErrGlobal(null)
      }
    })
  }

  const todosEssenciaisSalvos = ['banho', 'alimentacao', 'evacuacao', 'diurese'].every(
    t => registros[t as TipoRotina].salvo,
  )

  return (
    <div className="space-y-4 pb-32">
      {/* Seções de rotina */}
      {SECOES.map(secao => {
        const reg = registros[secao.tipo]
        const opcoes = OPCOES[secao.tipo]
        const opcaoSelecionada = opcoes.find(o => o.valor === reg.status)

        return (
          <SecaoRotina
            key={secao.tipo}
            titulo={secao.titulo}
            emoji={secao.emoji}
            concluida={reg.salvo}
            defaultOpen={!reg.salvo}
          >
            {reg.salvo ? (
              <div className="flex items-center gap-2 text-green-700 text-sm font-medium py-1">
                <CheckCircle2 className="w-4 h-4" />
                Registrado com sucesso
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {opcoes.map(opcao => (
                    <BotaoRotina
                      key={opcao.valor}
                      label={opcao.label}
                      emoji={opcao.emoji}
                      selected={reg.status === opcao.valor}
                      onClick={() => selecionarStatus(secao.tipo, opcao.valor)}
                      variant={opcao.variant}
                    />
                  ))}
                </div>

                {/* Observação */}
                {(opcaoSelecionada?.exigeObservacao || reg.status) && (
                  <div className="mt-2">
                    <label className="label text-xs">
                      Observação {opcaoSelecionada?.exigeObservacao ? '(obrigatório)' : '(opcional)'}
                    </label>
                    <textarea
                      value={reg.observacao}
                      onChange={e => setObservacao(secao.tipo, e.target.value)}
                      placeholder="Descreva brevemente..."
                      rows={2}
                      className="input resize-none text-sm"
                    />
                  </div>
                )}

                {reg.erro && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {reg.erro}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => salvarSecao(secao.tipo)}
                  disabled={!reg.status || isPending}
                  className={cn(
                    'btn-accent w-full mt-3 flex items-center justify-center gap-2 text-sm',
                    (!reg.status || isPending) && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <Save className="w-4 h-4" />
                  Salvar {secao.titulo}
                </button>
              </>
            )}
          </SecaoRotina>
        )
      })}

      {/* Sinais de atenção */}
      <SecaoRotina
        titulo="Sinais de atenção"
        emoji="⚠️"
        concluida={sinalSalvo}
        defaultOpen={false}
      >
        {sinalSalvo ? (
          <div className="flex items-center gap-2 text-green-700 text-sm font-medium py-1">
            <CheckCircle2 className="w-4 h-4" />
            Sinais registrados
          </div>
        ) : (
          <>
            <p className="text-sm text-muted mb-3">
              Selecione todos os sinais observados (opcional se não houver nada):
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {SINAIS.map(sinal => {
                const ativo = sinaisSelecionados.includes(sinal.valor)
                return (
                  <button
                    key={sinal.valor}
                    type="button"
                    onClick={() => setSinaisSelecionados(prev =>
                      ativo ? prev.filter(s => s !== sinal.valor) : [...prev, sinal.valor]
                    )}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all active:scale-95',
                      ativo
                        ? 'border-accent-500 bg-accent-500 text-white'
                        : 'border-border bg-white text-foreground hover:border-accent-300',
                    )}
                  >
                    <span>{sinal.emoji}</span>
                    {sinal.label}
                  </button>
                )
              })}
            </div>

            {sinaisSelecionados.length > 0 && (
              <div className="mt-2">
                <label className="label text-xs">Descreva o que foi observado (obrigatório)</label>
                <textarea
                  value={descricaoSinal}
                  onChange={e => setDescricaoSinal(e.target.value)}
                  placeholder="Ex: Morador referiu dor no joelho direito ao deambular..."
                  rows={3}
                  className="input resize-none text-sm"
                />
                {errGlobal && (
                  <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errGlobal}
                  </div>
                )}
                <button
                  type="button"
                  onClick={salvarSinais}
                  disabled={isPending}
                  className="btn-accent w-full mt-3 text-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar sinais de atenção
                </button>
              </div>
            )}
          </>
        )}
      </SecaoRotina>

      {/* Botão voltar / concluir fixo no bottom — acima do MobileNav em mobile */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 lg:pl-[272px] z-50">
        {todosEssenciaisSalvos ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-green-700 text-sm font-medium flex-1">
              <CheckCircle2 className="w-4 h-4" />
              Rotina essencial completa!
            </div>
            <button
              type="button"
              onClick={() => router.push('/rotina')}
              className="btn-accent px-6"
            >
              Concluir
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => router.push('/rotina')}
            className="btn-secondary w-full"
          >
            ← Voltar para Meu Turno
          </button>
        )}
      </div>
    </div>
  )
}
