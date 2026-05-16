import { format, formatDistanceToNow, parseISO, differenceInYears, isAfter, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { NivelRisco, RoleUsuario, TipoNota } from '@/lib/types/database'

// ─── Datas ───────────────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: ptBR })
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true })
}

export function calcularIdade(dataNascimento: string): number {
  return differenceInYears(new Date(), parseISO(dataNascimento))
}

export function isVencido(dataLimite: string): boolean {
  return isBefore(parseISO(dataLimite), new Date())
}

export function isVencendoEm(dataLimite: string, dias: number): boolean {
  const limite = parseISO(dataLimite)
  const alerta = addDays(new Date(), dias)
  return isAfter(alerta, limite) && !isBefore(limite, new Date())
}

// ─── Risco ───────────────────────────────────────────────────────────────────

export const RISCO_COLORS: Record<NivelRisco, { bg: string; text: string; border: string; dot: string }> = {
  verde: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    dot: 'bg-risk-verde',
  },
  amarelo: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-risk-amarelo',
  },
  laranja: {
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dot: 'bg-risk-laranja',
  },
  vermelho: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
    dot: 'bg-risk-vermelho',
  },
}

export const RISCO_LABELS: Record<NivelRisco, string> = {
  verde: 'Estável',
  amarelo: 'Atenção',
  laranja: 'Alerta',
  vermelho: 'Crítico',
}

// ─── Profissão ────────────────────────────────────────────────────────────────

export const TIPO_NOTA_LABELS: Record<TipoNota, string> = {
  medico: 'Evolução Médica',
  enfermagem: 'Enfermagem',
  fisioterapia: 'Fisioterapia',
  nutricao: 'Nutrição',
  psicologia: 'Psicologia',
  social: 'Serviço Social',
  to: 'Terapia Ocupacional',
  farmacia: 'Farmácia',
}

export const NOTA_COLORS: Record<TipoNota, string> = {
  medico: 'bg-blue-100 text-blue-800',
  enfermagem: 'bg-emerald-100 text-emerald-800',
  fisioterapia: 'bg-purple-100 text-purple-800',
  nutricao: 'bg-orange-100 text-orange-800',
  psicologia: 'bg-pink-100 text-pink-800',
  social: 'bg-teal-100 text-teal-800',
  to: 'bg-indigo-100 text-indigo-800',
  farmacia: 'bg-yellow-100 text-yellow-800',
}

export const ROLE_SHORT: Record<RoleUsuario, string> = {
  admin: 'Admin',
  medico: 'Dr./Dra.',
  enfermeiro: 'Enf.',
  tecnico_enfermagem: 'Téc. Enf.',
  fisioterapeuta: 'Fisio.',
  nutricionista: 'Nutri.',
  psicologo: 'Psico.',
  assistente_social: 'A.S.',
  terapeuta_ocupacional: 'T.O.',
  farmaceutico: 'Farm.',
}

// ─── Formatação de texto ──────────────────────────────────────────────────────

export function primeiroNome(nomeCompleto: string): string {
  return nomeCompleto.split(' ')[0]
}

export function nomeAbreviado(nomeCompleto: string): string {
  const partes = nomeCompleto.split(' ')
  if (partes.length <= 2) return nomeCompleto
  return `${partes[0]} ${partes[partes.length - 1]}`
}

export function iniciais(nomeCompleto: string): string {
  return nomeCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
