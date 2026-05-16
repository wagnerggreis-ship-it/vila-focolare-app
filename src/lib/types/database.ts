export type NivelRisco = 'verde' | 'amarelo' | 'laranja' | 'vermelho'
export type StatusResidente = 'ativo' | 'afastado' | 'alta' | 'obito'
export type RoleUsuario =
  | 'admin'
  | 'medico'
  | 'enfermeiro'
  | 'tecnico_enfermagem'
  | 'fisioterapeuta'
  | 'nutricionista'
  | 'psicologo'
  | 'assistente_social'
  | 'terapeuta_ocupacional'
  | 'farmaceutico'

export type TipoNota =
  | 'medico'
  | 'enfermagem'
  | 'fisioterapia'
  | 'nutricao'
  | 'psicologia'
  | 'social'
  | 'to'
  | 'farmacia'

export type TipoAvaliacao =
  | 'katz'
  | 'barthel'
  | 'lawton'
  | 'mna'
  | 'mmse'
  | 'gds15'
  | 'pps'
  | 'braden'
  | 'morse'
  | 'disfagia'

export type StatusPlano = 'ativo' | 'em_revisao' | 'encerrado'
export type StatusPrescricao = 'ativa' | 'suspensa' | 'encerrada'
export type StatusAdministracao = 'administrado' | 'nao_administrado' | 'adiado'
export type TipoIncidente =
  | 'queda'
  | 'erro_medicacao'
  | 'lesao_pressao'
  | 'intercorrencia_clinica'
  | 'reacao_adversa'
  | 'equipamento'
  | 'comportamento_risco'
  | 'outros'

export type GravidadeIncidente =
  | 'nivel_0'
  | 'nivel_1'
  | 'nivel_2'
  | 'nivel_3'
  | 'nivel_4'
  | 'nivel_5'
  | 'nivel_6'
  | 'nivel_7'

export type StatusIncidente = 'aberto' | 'investigando' | 'plano_acao' | 'fechado'
export type StatusAcao = 'pendente' | 'em_andamento' | 'concluido'

// ─── Rotina de Cuidado ───────────────────────────────────────────────────────

export type TipoRotina = 'banho' | 'alimentacao' | 'sono' | 'evacuacao' | 'diurese' | 'sinal_atencao'
export type TurnoRotina = 'manha' | 'tarde' | 'noite'

export type StatusBanho = 'realizado' | 'recusado' | 'nao_realizado' | 'higiene_parcial'
export type StatusAlimentacao = 'bem' | 'parcialmente' | 'pouco' | 'recusou' | 'nao_ofertado'
export type StatusSono = 'bem' | 'mal' | 'interrompido' | 'sonolencia_excessiva' | 'agitacao'
export type StatusEvacuacao = 'evacuou' | 'nao_evacuou' | 'alterada' | 'diarreia' | 'constipacao'
export type StatusDiurese = 'presente' | 'reduzida' | 'ausente' | 'alteracao'

export interface RegistroRotina {
  id: string
  residente_id: string
  tipo_rotina: TipoRotina
  status: string
  observacao?: string
  turno?: TurnoRotina
  registrado_por?: string
  registrado_em: string
  created_at: string
  // joins
  residente?: Pick<Residente, 'id' | 'nome' | 'nome_social' | 'quarto' | 'nivel_risco'>
  usuario?: Pick<UserProfile, 'id' | 'nome_completo' | 'role'>
}

// ─── Entidades principais ────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  nome_completo: string
  role: RoleUsuario
  registro_profissional?: string
  especialidade?: string
  foto_url?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Residente {
  id: string
  nome: string
  nome_social?: string
  data_nascimento: string
  sexo?: string
  foto_url?: string
  cpf?: string
  rg?: string
  numero_sus?: string
  plano_saude?: string
  numero_plano?: string
  quarto?: string
  data_admissao: string
  status: StatusResidente
  nivel_risco: NivelRisco
  medico_responsavel_id?: string
  diagnosticos_principais: string[]
  alergias?: string
  observacoes_gerais?: string
  created_at: string
  updated_at: string
  // joins opcionais
  medico_responsavel?: Pick<UserProfile, 'id' | 'nome_completo'>
}

export interface ContatoResidente {
  id: string
  residente_id: string
  nome: string
  parentesco?: string
  telefone?: string
  email?: string
  contato_principal: boolean
  pode_receber_informacoes: boolean
}

export interface NotaProntuario {
  id: string
  residente_id: string
  autor_id: string
  tipo_nota: TipoNota
  titulo?: string
  conteudo: Record<string, unknown>
  conteudo_texto?: string
  editavel_ate?: string
  created_at: string
  // joins
  autor?: Pick<UserProfile, 'id' | 'nome_completo' | 'role' | 'registro_profissional'>
}

export interface AvaliacaoFuncional {
  id: string
  residente_id: string
  avaliador_id: string
  tipo_avaliacao: TipoAvaliacao
  respostas: Record<string, unknown>
  score_total?: number
  classificacao?: string
  observacoes?: string
  data_avaliacao: string
  created_at: string
  // joins
  avaliador?: Pick<UserProfile, 'id' | 'nome_completo' | 'role'>
}

export interface PlanoCuidado {
  id: string
  residente_id: string
  versao: number
  status: StatusPlano
  data_inicio: string
  data_revisao_prevista: string
  data_revisao_realizada?: string
  assinado_por?: string
  assinado_em?: string
  observacoes?: string
  created_at: string
  updated_at: string
  itens?: PlanoItem[]
}

export interface PlanoItem {
  id: string
  plano_id: string
  area: string
  diagnostico: string
  meta: string
  intervencoes: string
  prazo?: string
  responsavel_id?: string
  status: string
  responsavel?: Pick<UserProfile, 'id' | 'nome_completo'>
}

export interface PrescricaoMedica {
  id: string
  residente_id: string
  prescrito_por: string
  data_inicio: string
  data_fim?: string
  status: StatusPrescricao
  validado_por?: string
  validado_em?: string
  observacoes?: string
  created_at: string
  itens?: PrescricaoItem[]
  prescrito_por_user?: Pick<UserProfile, 'id' | 'nome_completo' | 'registro_profissional'>
}

export interface PrescricaoItem {
  id: string
  prescricao_id: string
  tipo: 'medicamento' | 'procedimento' | 'dieta'
  descricao: string
  principio_ativo?: string
  dose?: string
  via?: string
  frequencia?: string
  horarios?: string[]
  duracao?: string
  observacoes?: string
  ativo: boolean
}

export interface AdministracaoMedicamento {
  id: string
  prescricao_item_id: string
  residente_id: string
  horario_previsto: string
  horario_realizado?: string
  administrado_por?: string
  status: StatusAdministracao
  motivo_nao_administracao?: string
  observacoes?: string
  created_at: string
  prescricao_item?: PrescricaoItem & {
    prescricao?: PrescricaoMedica
  }
  administrado_por_user?: Pick<UserProfile, 'id' | 'nome_completo'>
}

export interface Incidente {
  id: string
  residente_id: string
  registrado_por: string
  tipo: TipoIncidente
  descricao: string
  data_hora_evento: string
  local_ocorrencia?: string
  gravidade: GravidadeIncidente
  dano_causado?: string
  testemunhas?: string
  status: StatusIncidente
  investigacao?: Record<string, unknown>
  fechado_por?: string
  fechado_em?: string
  created_at: string
  updated_at: string
  residente?: Pick<Residente, 'id' | 'nome' | 'foto_url' | 'quarto'>
  registrado_por_user?: Pick<UserProfile, 'id' | 'nome_completo' | 'role'>
  acoes?: AcaoCorretiva[]
}

export interface AcaoCorretiva {
  id: string
  incidente_id: string
  descricao_acao: string
  responsavel_id?: string
  prazo: string
  status: StatusAcao
  evidencia_conclusao?: string
  concluido_em?: string
  responsavel?: Pick<UserProfile, 'id' | 'nome_completo'>
}

export interface IndicadorQualidade {
  id: string
  nome: string
  descricao?: string
  formula?: string
  unidade?: string
  meta_valor?: number
  meta_direcao: 'menor_melhor' | 'maior_melhor'
  periodicidade: string
  ativo: boolean
}

export interface MedicaoIndicador {
  id: string
  indicador_id: string
  periodo_inicio: string
  periodo_fim: string
  valor_calculado: number
  atingiu_meta?: boolean
  observacoes?: string
  created_at: string
  indicador?: IndicadorQualidade
}

export interface Notificacao {
  id: string
  destinatario_id: string
  tipo: string
  titulo: string
  mensagem: string
  link?: string
  lida: boolean
  created_at: string
}

export interface ConfigInstituicao {
  id: string
  nome: string
  cnpj?: string
  crm_responsavel?: string
  nome_responsavel: string
  endereco?: string
  telefone?: string
  email_contato?: string
  logo_url?: string
  prazo_revisao_plano_dias: number
  prazo_avaliacao_katz_dias: number
  prazo_avaliacao_barthel_dias: number
  prazo_avaliacao_mna_dias: number
  prazo_avaliacao_mmse_dias: number
  prazo_avaliacao_gds_dias: number
  prazo_avaliacao_braden_dias: number
  prazo_avaliacao_morse_dias: number
  alerta_med_amarelo_minutos: number
  alerta_med_vermelho_minutos: number
}

// ─── Helpers de UI ───────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<RoleUsuario, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  enfermeiro: 'Enfermeiro(a)',
  tecnico_enfermagem: 'Técnico de Enfermagem',
  fisioterapeuta: 'Fisioterapeuta',
  nutricionista: 'Nutricionista',
  psicologo: 'Psicólogo(a)',
  assistente_social: 'Assistente Social',
  terapeuta_ocupacional: 'Terapeuta Ocupacional',
  farmaceutico: 'Farmacêutico(a)',
}

export const TIPO_NOTA_LABELS: Record<TipoNota, string> = {
  medico: 'Médico',
  enfermagem: 'Enfermagem',
  fisioterapia: 'Fisioterapia',
  nutricao: 'Nutrição',
  psicologia: 'Psicologia',
  social: 'Serviço Social',
  to: 'Terapia Ocupacional',
  farmacia: 'Farmácia',
}

export const AVALIACAO_LABELS: Record<TipoAvaliacao, string> = {
  katz: 'Índice de Katz',
  barthel: 'Índice de Barthel',
  lawton: 'Escala de Lawton-Brody',
  mna: 'Mini Nutritional Assessment (MNA)',
  mmse: 'Mini Mental State Examination (MMSE)',
  gds15: 'Escala de Depressão Geriátrica (GDS-15)',
  pps: 'Palliative Performance Scale (PPS)',
  braden: 'Escala de Braden',
  morse: 'Escala de Morse',
  disfagia: 'Avaliação de Disfagia',
}

export const NIVEL_RISCO_LABELS: Record<NivelRisco, string> = {
  verde: 'Estável',
  amarelo: 'Atenção',
  laranja: 'Alerta',
  vermelho: 'Crítico',
}

export const TIPO_INCIDENTE_LABELS: Record<TipoIncidente, string> = {
  queda: 'Queda',
  erro_medicacao: 'Erro de Medicação',
  lesao_pressao: 'Lesão por Pressão',
  intercorrencia_clinica: 'Intercorrência Clínica',
  reacao_adversa: 'Reação Adversa a Medicamento',
  equipamento: 'Evento com Equipamento',
  comportamento_risco: 'Comportamento de Risco',
  outros: 'Outro',
}

export const GRAVIDADE_LABELS: Record<GravidadeIncidente, string> = {
  nivel_0: 'Nível 0 — Near miss (quase aconteceu)',
  nivel_1: 'Nível 1 — Evento sem dano',
  nivel_2: 'Nível 2 — Dano leve',
  nivel_3: 'Nível 3 — Dano leve a moderado',
  nivel_4: 'Nível 4 — Dano moderado',
  nivel_5: 'Nível 5 — Dano moderado a grave',
  nivel_6: 'Nível 6 — Dano grave',
  nivel_7: 'Nível 7 — Óbito relacionado ao evento',
}
