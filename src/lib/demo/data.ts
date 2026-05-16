// ────────────────────────────────────────────────────────────────────────────
// Demo data — Vila Focolare  |  apenas para NEXT_PUBLIC_DEMO_MODE=true
// Não afeta dados reais do Supabase.
// ────────────────────────────────────────────────────────────────────────────

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEMO_EMAIL   = 'admin@demo.com'
export const DEMO_PASSWORD = 'admin123'

// Helpers de data
const dt = (daysAgo: number, hour = 10, min = 0) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}
const hoje = (hour: number, min = 0) => dt(0, hour, min)
const dataNasc = (anos: number) => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - anos)
  return d.toISOString().split('T')[0]
}

// ── IDs fixos ────────────────────────────────────────────────────────────────
const R1 = '00000000-0000-0000-0001-000000000001' // Maria
const R2 = '00000000-0000-0000-0001-000000000002' // José
const R3 = '00000000-0000-0000-0001-000000000003' // Antônia
const R4 = '00000000-0000-0000-0001-000000000004' // Raimundo
const R5 = '00000000-0000-0000-0001-000000000005' // Benedita

// ── user_profiles ────────────────────────────────────────────────────────────
export const user_profiles = [
  {
    id: DEMO_USER_ID,
    nome_completo: 'Dr. Wagner Reis',
    role: 'admin',
    registro_profissional: 'CRM-PE 12345',
    especialidade: 'Geriatria',
    ativo: true,
    created_at: dt(30),
    updated_at: dt(1),
  },
]

// ── residentes ───────────────────────────────────────────────────────────────
export const residentes = [
  {
    id: R1,
    nome: 'Maria Aparecida Santos',
    nome_social: 'Dona Maria',
    data_nascimento: dataNasc(82),
    sexo: 'feminino',
    quarto: '01',
    data_admissao: '2025-03-10',
    status: 'ativo',
    nivel_risco: 'amarelo',
    diagnosticos_principais: ['Hipertensão', 'Diabetes tipo 2', 'Osteoporose'],
    alergias: 'Dipirona',
    observacoes_gerais: 'Prefere banho de manhã. Gosta de música sertaneja.',
    medico_responsavel_id: DEMO_USER_ID,
    medico_responsavel: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(90), updated_at: dt(1),
  },
  {
    id: R2,
    nome: 'José Ferreira Lima',
    nome_social: 'Seu José',
    data_nascimento: dataNasc(87),
    sexo: 'masculino',
    quarto: '02',
    data_admissao: '2025-01-15',
    status: 'ativo',
    nivel_risco: 'verde',
    diagnosticos_principais: ['Insuficiência cardíaca leve', 'Hipertensão'],
    alergias: null,
    observacoes_gerais: 'Muito comunicativo. Gosta de ouvir histórias.',
    medico_responsavel_id: DEMO_USER_ID,
    medico_responsavel: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(120), updated_at: dt(2),
  },
  {
    id: R3,
    nome: 'Antônia Bezerra Costa',
    nome_social: 'Dona Antônia',
    data_nascimento: dataNasc(77),
    sexo: 'feminino',
    quarto: '03',
    data_admissao: '2025-06-01',
    status: 'ativo',
    nivel_risco: 'laranja',
    diagnosticos_principais: ['Alzheimer moderado', 'HAS', 'Dislipidemia'],
    alergias: 'Penicilina',
    observacoes_gerais: 'Necessita supervisão constante. Risco de fuga. Calma com música.',
    medico_responsavel_id: DEMO_USER_ID,
    medico_responsavel: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(60), updated_at: dt(0),
  },
  {
    id: R4,
    nome: 'Raimundo Soares',
    nome_social: 'Seu Raimundo',
    data_nascimento: dataNasc(90),
    sexo: 'masculino',
    quarto: '04',
    data_admissao: '2024-11-20',
    status: 'ativo',
    nivel_risco: 'vermelho',
    diagnosticos_principais: ['DPOC grave', 'Insuficiência renal crônica', 'HAS'],
    alergias: 'Contraste iodado',
    observacoes_gerais: 'Oxigenoterapia contínua. Dieta hipossódica. Pesar diariamente.',
    medico_responsavel_id: DEMO_USER_ID,
    medico_responsavel: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(180), updated_at: dt(0),
  },
  {
    id: R5,
    nome: 'Benedita Oliveira',
    nome_social: 'Dona Bene',
    data_nascimento: dataNasc(74),
    sexo: 'feminino',
    quarto: '05',
    data_admissao: '2026-01-08',
    status: 'ativo',
    nivel_risco: 'verde',
    diagnosticos_principais: ['Hipotireoidismo', 'Artrose'],
    alergias: null,
    observacoes_gerais: 'Bastante independente. Gosta de bordado.',
    medico_responsavel_id: DEMO_USER_ID,
    medico_responsavel: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(45), updated_at: dt(3),
  },
]

// ── contatos_residentes ───────────────────────────────────────────────────────
export const contatos_residentes = [
  { id: 'c1', residente_id: R1, nome: 'Ana Santos (filha)', parentesco: 'filha', telefone: '(81) 99800-1111', contato_principal: true },
  { id: 'c2', residente_id: R2, nome: 'Carlos Lima (filho)', parentesco: 'filho', telefone: '(81) 99800-2222', contato_principal: true },
  { id: 'c3', residente_id: R3, nome: 'Pedro Bezerra (irmão)', parentesco: 'irmão', telefone: '(81) 99800-3333', contato_principal: true },
  { id: 'c4', residente_id: R4, nome: 'Lúcia Soares (filha)', parentesco: 'filha', telefone: '(81) 99800-4444', contato_principal: true },
  { id: 'c5', residente_id: R5, nome: 'Marcos Oliveira (filho)', parentesco: 'filho', telefone: '(81) 99800-5555', contato_principal: true },
]

// ── incidentes ────────────────────────────────────────────────────────────────
export const incidentes = [
  {
    id: 'i1', residente_id: R1,
    residente: { id: R1, nome: 'Maria Aparecida Santos', quarto: '01' },
    tipo: 'queda', gravidade: 'nivel_2',
    status: 'aberto',
    descricao: 'Paciente encontrada no chão ao lado da cama às 07h15. Sem lesões aparentes.',
    conduta_imediata: 'Auxílio para levantar, ausculta cardíaca, PA aferida. Família comunicada.',
    data_hora_evento: hoje(7, 15),
    local_ocorrencia: 'Quarto 01',
    familiar_notificado: true,
    gestor_notificado: true,
    created_at: hoje(7, 20), updated_at: hoje(7, 20),
  },
  {
    id: 'i2', residente_id: R4,
    residente: { id: R4, nome: 'Raimundo Soares', quarto: '04' },
    tipo: 'intercorrencia_clinica', gravidade: 'nivel_3',
    status: 'investigando',
    descricao: 'Saturação de O2 em 88% com O2 a 3L/min. Dispneia em repouso.',
    conduta_imediata: 'Aumentado fluxo O2 para 5L/min. Médico acionado às 06h30.',
    data_hora_evento: hoje(6, 30),
    local_ocorrencia: 'Quarto 04',
    familiar_notificado: true,
    gestor_notificado: true,
    created_at: hoje(6, 35), updated_at: hoje(9, 0),
  },
  {
    id: 'i3', residente_id: R3,
    residente: { id: R3, nome: 'Antônia Bezerra Costa', quarto: '03' },
    tipo: 'comportamento_risco', gravidade: 'nivel_1',
    status: 'fechado',
    descricao: 'Dona Antônia tentou sair pelo portão principal. Contida com gentileza.',
    conduta_imediata: 'Reorientada, encaminhada à sala de estar. Familiar comunicado.',
    data_hora_evento: dt(1, 14, 30),
    local_ocorrencia: 'Portão principal',
    familiar_notificado: true,
    gestor_notificado: false,
    created_at: dt(1, 14, 35), updated_at: dt(1, 16, 0),
  },
  {
    id: 'i4', residente_id: R2,
    residente: { id: R2, nome: 'José Ferreira Lima', quarto: '02' },
    tipo: 'outros', gravidade: 'nivel_1',
    status: 'fechado',
    descricao: 'Seu José referiu dor lombar ao acordar. Sem irradiação.',
    conduta_imediata: 'Analgésico aplicado conforme prescrição SOS. Melhora em 30min.',
    data_hora_evento: dt(2, 8, 0),
    local_ocorrencia: 'Quarto 02',
    familiar_notificado: false,
    gestor_notificado: false,
    created_at: dt(2, 8, 5), updated_at: dt(2, 9, 0),
  },
]

// ── planos_cuidado ────────────────────────────────────────────────────────────
export const planos_cuidado = [
  { id: 'pc1', residente_id: R1, status: 'ativo', versao: 2, data_revisao_prevista: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], assinado_por: DEMO_USER_ID, created_at: dt(60), updated_at: dt(5) },
  { id: 'pc2', residente_id: R2, status: 'ativo', versao: 1, data_revisao_prevista: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], assinado_por: null, created_at: dt(90), updated_at: dt(10) },
  { id: 'pc3', residente_id: R3, status: 'ativo', versao: 3, data_revisao_prevista: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], assinado_por: DEMO_USER_ID, created_at: dt(45), updated_at: dt(2) },
  { id: 'pc4', residente_id: R4, status: 'ativo', versao: 4, data_revisao_prevista: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], assinado_por: null, created_at: dt(180), updated_at: dt(1) },
  { id: 'pc5', residente_id: R5, status: 'ativo', versao: 1, data_revisao_prevista: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0], assinado_por: DEMO_USER_ID, created_at: dt(30), updated_at: dt(7) },
]

// ── notas_prontuario ──────────────────────────────────────────────────────────
export const notas_prontuario = [
  { id: 'n1', residente_id: R4, tipo_nota: 'medico', titulo: 'Piora da função respiratória', texto: 'Paciente com aumento da dispneia. Iniciado aumento de O2.', autor_id: DEMO_USER_ID, autor: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, residente: { id: R4, nome: 'Raimundo Soares' }, created_at: hoje(9, 0), updated_at: hoje(9, 0) },
  { id: 'n2', residente_id: R1, tipo_nota: 'enfermagem', titulo: 'Avaliação pós-queda', texto: 'Ausência de lesões cutâneas. PA 130/80. Orientada em tempo e espaço.', autor_id: DEMO_USER_ID, autor: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, residente: { id: R1, nome: 'Maria Aparecida Santos' }, created_at: hoje(7, 30), updated_at: hoje(7, 30) },
  { id: 'n3', residente_id: R3, tipo_nota: 'psicologia', titulo: 'Sessão de acompanhamento', texto: 'Paciente agitada. Atividades de estimulação cognitiva com boa resposta.', autor_id: DEMO_USER_ID, autor: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, residente: { id: R3, nome: 'Antônia Bezerra Costa' }, created_at: dt(1, 15, 0), updated_at: dt(1, 15, 0) },
  { id: 'n4', residente_id: R2, tipo_nota: 'nutricao', titulo: 'Avaliação nutricional mensal', texto: 'Peso estável. Boa aceitação da dieta. Sem intercorrências alimentares.', autor_id: DEMO_USER_ID, autor: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, residente: { id: R2, nome: 'José Ferreira Lima' }, created_at: dt(3, 10, 0), updated_at: dt(3, 10, 0) },
  { id: 'n5', residente_id: R5, tipo_nota: 'fisioterapia', titulo: 'Sessão de fisioterapia', texto: 'Exercícios de fortalecimento MMII. Boa tolerância ao esforço.', autor_id: DEMO_USER_ID, autor: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, residente: { id: R5, nome: 'Benedita Oliveira' }, created_at: dt(1, 9, 0), updated_at: dt(1, 9, 0) },
]

// ── avaliacoes_funcionais ─────────────────────────────────────────────────────
export const avaliacoes_funcionais = [
  { id: 'av1', residente_id: R1, tipo_avaliacao: 'barthel', score_total: 60, data_avaliacao: dt(30).split('T')[0], avaliador_id: DEMO_USER_ID, avaliador: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, created_at: dt(30) },
  { id: 'av2', residente_id: R1, tipo_avaliacao: 'braden', score_total: 16, data_avaliacao: dt(15).split('T')[0], avaliador_id: DEMO_USER_ID, avaliador: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, created_at: dt(15) },
  { id: 'av3', residente_id: R2, tipo_avaliacao: 'katz', score_total: 4, data_avaliacao: dt(20).split('T')[0], avaliador_id: DEMO_USER_ID, avaliador: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, created_at: dt(20) },
  { id: 'av4', residente_id: R3, tipo_avaliacao: 'gds15', score_total: 10, data_avaliacao: dt(10).split('T')[0], avaliador_id: DEMO_USER_ID, avaliador: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, created_at: dt(10) },
  { id: 'av5', residente_id: R4, tipo_avaliacao: 'pps', score_total: 40, data_avaliacao: dt(5).split('T')[0], avaliador_id: DEMO_USER_ID, avaliador: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, created_at: dt(5) },
  { id: 'av6', residente_id: R5, tipo_avaliacao: 'barthel', score_total: 85, data_avaliacao: dt(7).split('T')[0], avaliador_id: DEMO_USER_ID, avaliador: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis', role: 'admin' }, created_at: dt(7) },
]

// ── prescricoes_medicas ───────────────────────────────────────────────────────
const PI = (id: string, descricao: string, dose: string, via: string, frequencia: string, horarios: string[]) =>
  ({ id, ativo: true, descricao, dose, via, frequencia, horarios })

export const prescricoes_medicas = [
  {
    id: 'pm1', residente_id: R1, status: 'ativa', prescrito_por: DEMO_USER_ID,
    prescrito_por_user: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(30),
    itens: [
      PI('pi1-1', 'Losartana 50mg — 1 comprimido', '50mg', 'oral', '1x/dia', ['08:00']),
      PI('pi1-2', 'Metformina 850mg — 1 comprimido', '850mg', 'oral', '2x/dia', ['08:00', '20:00']),
      PI('pi1-3', 'Carbonato de Cálcio 500mg + Vit D', '500mg', 'oral', '1x/dia', ['12:00']),
    ],
  },
  {
    id: 'pm2', residente_id: R2, status: 'ativa', prescrito_por: DEMO_USER_ID,
    prescrito_por_user: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(45),
    itens: [
      PI('pi2-1', 'Furosemida 40mg — 1 comprimido', '40mg', 'oral', '1x/dia', ['08:00']),
      PI('pi2-2', 'Espironolactona 25mg — 1 comprimido', '25mg', 'oral', '1x/dia', ['08:00']),
      PI('pi2-3', 'Atenolol 50mg — 1 comprimido', '50mg', 'oral', '1x/dia', ['08:00']),
    ],
  },
  {
    id: 'pm3', residente_id: R4, status: 'ativa', prescrito_por: DEMO_USER_ID,
    prescrito_por_user: { id: DEMO_USER_ID, nome_completo: 'Dr. Wagner Reis' },
    created_at: dt(60),
    itens: [
      PI('pi4-1', 'Brometo de Ipratrópio — 2 jatos', '40mcg', 'inalatório', '3x/dia', ['08:00', '14:00', '20:00']),
      PI('pi4-2', 'Salbutamol SOS — 2 jatos', '200mcg', 'inalatório', 'SOS', []),
      PI('pi4-3', 'Prednisona 20mg — 1 comprimido', '20mg', 'oral', '1x/dia', ['08:00']),
    ],
  },
]

// ── administracoes_medicamento ────────────────────────────────────────────────
export const administracoes_medicamento = [
  // Maria — hoje
  { id: 'adm1', residente_id: R1, prescricao_id: 'pm1', prescricao_item_id: 'pi1-1', horario_previsto: hoje(8, 0), horario_realizado: hoje(8, 5), status: 'administrado', administrado_por: DEMO_USER_ID, residente: { id: R1, nome: 'Maria Aparecida Santos', quarto: '01', alergias: 'Dipirona' }, prescricao_item: { descricao: 'Losartana 50mg — 1 comprimido', dose: '50mg', via: 'oral' } },
  { id: 'adm2', residente_id: R1, prescricao_id: 'pm1', prescricao_item_id: 'pi1-2', horario_previsto: hoje(8, 0), horario_realizado: hoje(8, 5), status: 'administrado', administrado_por: DEMO_USER_ID, residente: { id: R1, nome: 'Maria Aparecida Santos', quarto: '01', alergias: 'Dipirona' }, prescricao_item: { descricao: 'Metformina 850mg — 1 comprimido', dose: '850mg', via: 'oral' } },
  { id: 'adm3', residente_id: R1, prescricao_id: 'pm1', prescricao_item_id: 'pi1-3', horario_previsto: hoje(12, 0), status: 'pendente', residente: { id: R1, nome: 'Maria Aparecida Santos', quarto: '01', alergias: 'Dipirona' }, prescricao_item: { descricao: 'Carbonato de Cálcio + Vit D', dose: '500mg', via: 'oral' } },
  // José — hoje
  { id: 'adm4', residente_id: R2, prescricao_id: 'pm2', prescricao_item_id: 'pi2-1', horario_previsto: hoje(8, 0), horario_realizado: hoje(8, 10), status: 'administrado', administrado_por: DEMO_USER_ID, residente: { id: R2, nome: 'José Ferreira Lima', quarto: '02', alergias: null }, prescricao_item: { descricao: 'Furosemida 40mg — 1 comprimido', dose: '40mg', via: 'oral' } },
  { id: 'adm5', residente_id: R2, prescricao_id: 'pm2', prescricao_item_id: 'pi2-2', horario_previsto: hoje(8, 0), status: 'pendente', residente: { id: R2, nome: 'José Ferreira Lima', quarto: '02', alergias: null }, prescricao_item: { descricao: 'Espironolactona 25mg — 1 comprimido', dose: '25mg', via: 'oral' } },
  // Raimundo — hoje
  { id: 'adm6', residente_id: R4, prescricao_id: 'pm3', prescricao_item_id: 'pi4-1', horario_previsto: hoje(8, 0), status: 'nao_administrado', motivo_nao_administracao: 'Paciente com dispneia — aguardando avaliação médica', residente: { id: R4, nome: 'Raimundo Soares', quarto: '04', alergias: 'Contraste iodado' }, prescricao_item: { descricao: 'Brometo de Ipratrópio — 2 jatos', dose: '40mcg', via: 'inalatório' } },
  { id: 'adm7', residente_id: R4, prescricao_id: 'pm3', prescricao_item_id: 'pi4-3', horario_previsto: hoje(8, 0), status: 'pendente', residente: { id: R4, nome: 'Raimundo Soares', quarto: '04', alergias: 'Contraste iodado' }, prescricao_item: { descricao: 'Prednisona 20mg — 1 comprimido', dose: '20mg', via: 'oral' } },
]

// ── registros_rotina (hoje) ───────────────────────────────────────────────────
export const registros_rotina = [
  // Maria — banho e alimentação feitos
  { id: 'rr1', residente_id: R1, tipo_rotina: 'banho', status: 'realizado', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(7, 45), created_at: hoje(7, 45) },
  { id: 'rr2', residente_id: R1, tipo_rotina: 'alimentacao', status: 'alimentou-se parcialmente', observacao: 'Comeu metade do café da manhã. Referiu enjoo leve.', turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(8, 30), created_at: hoje(8, 30) },
  // José — tudo completo
  { id: 'rr3', residente_id: R2, tipo_rotina: 'banho', status: 'realizado', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(8, 0), created_at: hoje(8, 0) },
  { id: 'rr4', residente_id: R2, tipo_rotina: 'alimentacao', status: 'bem', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(8, 35), created_at: hoje(8, 35) },
  { id: 'rr5', residente_id: R2, tipo_rotina: 'evacuacao', status: 'evacuou', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(9, 0), created_at: hoje(9, 0) },
  { id: 'rr6', residente_id: R2, tipo_rotina: 'diurese', status: 'presente', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(9, 5), created_at: hoje(9, 5) },
  // Benedita — completa
  { id: 'rr7', residente_id: R5, tipo_rotina: 'banho', status: 'realizado', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(8, 15), created_at: hoje(8, 15) },
  { id: 'rr8', residente_id: R5, tipo_rotina: 'alimentacao', status: 'bem', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(8, 40), created_at: hoje(8, 40) },
  { id: 'rr9', residente_id: R5, tipo_rotina: 'evacuacao', status: 'evacuou', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(9, 10), created_at: hoje(9, 10) },
  { id: 'rr10', residente_id: R5, tipo_rotina: 'diurese', status: 'presente', observacao: null, turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(9, 15), created_at: hoje(9, 15) },
  // Raimundo — apenas banho (situação crítica)
  { id: 'rr11', residente_id: R4, tipo_rotina: 'banho', status: 'higiene_parcial', observacao: 'Higiene no leito. Dispneico ao esforço.', turno: 'manha', registrado_por: DEMO_USER_ID, registrado_em: hoje(7, 30), created_at: hoje(7, 30) },
  // Antônia — sem registro (pendente)
]

// ── indicadores_qualidade ─────────────────────────────────────────────────────
export const indicadores_qualidade = [
  { id: 'iq1', nome: 'Taxa de Quedas (por 1000 dias)', ativo: true, unidade: 'quedas/1000 dias-paciente', meta_valor: 2, meta_direcao: 'menor_melhor' },
  { id: 'iq2', nome: 'Aderência Medicamentosa', ativo: true, unidade: '%', meta_valor: 95, meta_direcao: 'maior_melhor' },
  { id: 'iq3', nome: 'Lesões de Pressão (novas)', ativo: true, unidade: 'casos', meta_valor: 0, meta_direcao: 'menor_melhor' },
  { id: 'iq4', nome: 'Satisfação da Família', ativo: true, unidade: '%', meta_valor: 90, meta_direcao: 'maior_melhor' },
]

export const medicoes_indicadores = [
  { id: 'mi1', indicador_id: 'iq1', periodo_inicio: dt(60).split('T')[0], periodo_fim: dt(31).split('T')[0], valor_calculado: 1.2, atingiu_meta: true, observacoes: 'Mês anterior', created_at: dt(30) },
  { id: 'mi2', indicador_id: 'iq1', periodo_inicio: dt(30).split('T')[0], periodo_fim: dt(1).split('T')[0], valor_calculado: 0.8, atingiu_meta: true, observacoes: 'Mês atual', created_at: dt(1) },
  { id: 'mi3', indicador_id: 'iq2', periodo_inicio: dt(60).split('T')[0], periodo_fim: dt(31).split('T')[0], valor_calculado: 93.5, atingiu_meta: false, observacoes: 'Atenção ao turno noturno', created_at: dt(30) },
  { id: 'mi4', indicador_id: 'iq2', periodo_inicio: dt(30).split('T')[0], periodo_fim: dt(1).split('T')[0], valor_calculado: 96.2, atingiu_meta: true, observacoes: 'Melhora após capacitação', created_at: dt(1) },
  { id: 'mi5', indicador_id: 'iq3', periodo_inicio: dt(30).split('T')[0], periodo_fim: dt(1).split('T')[0], valor_calculado: 0, atingiu_meta: true, observacoes: null, created_at: dt(1) },
  { id: 'mi6', indicador_id: 'iq4', periodo_inicio: dt(30).split('T')[0], periodo_fim: dt(1).split('T')[0], valor_calculado: 94, atingiu_meta: true, observacoes: 'Pesquisa mensal', created_at: dt(1) },
]

export const notificacoes: any[] = []

// ── Mapa de tabelas ───────────────────────────────────────────────────────────
export const DEMO_DATA: Record<string, any[]> = {
  user_profiles,
  residentes,
  contatos_residentes,
  incidentes,
  planos_cuidado,
  notas_prontuario,
  avaliacoes_funcionais,
  prescricoes_medicas,
  administracoes_medicamento,
  registros_rotina,
  indicadores_qualidade,
  medicoes_indicadores,
  notificacoes,
  // Tabelas que existem mas sem dados demo relevantes
  prescricoes: prescricoes_medicas,
  prescricao_itens: prescricoes_medicas.flatMap(p => p.itens ?? []),
}
