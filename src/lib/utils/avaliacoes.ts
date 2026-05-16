// Calculadores de score e classificação para todos os instrumentos de avaliação

// ─── KATZ ────────────────────────────────────────────────────────────────────
// 6 itens, 0 = dependente, 1 = independente. Máx: 6

export interface KatzRespostas {
  banho: 0 | 1
  vestir: 0 | 1
  higiene: 0 | 1
  transferencia: 0 | 1
  continencia: 0 | 1
  alimentacao: 0 | 1
}

export function calcularKatz(respostas: KatzRespostas): { score: number; classificacao: string } {
  const score = Object.values(respostas).reduce((a, b) => a + b, 0)
  let classificacao: string
  if (score === 6) classificacao = 'Independente'
  else if (score >= 4) classificacao = 'Dependência parcial'
  else if (score >= 2) classificacao = 'Dependência moderada'
  else classificacao = 'Dependência severa'
  return { score, classificacao }
}

// ─── BARTHEL ─────────────────────────────────────────────────────────────────
// 10 itens. Máx: 100

export interface BarthelRespostas {
  alimentacao: 0 | 5 | 10
  banho: 0 | 5
  higiene_pessoal: 0 | 5
  vestir: 0 | 5 | 10
  bexiga: 0 | 5 | 10
  intestino: 0 | 5 | 10
  uso_banheiro: 0 | 5 | 10
  transferencia: 0 | 5 | 10 | 15
  deambulacao: 0 | 5 | 10 | 15
  escadas: 0 | 5 | 10
}

export function calcularBarthel(respostas: BarthelRespostas): { score: number; classificacao: string } {
  const score = Object.values(respostas).reduce((a, b) => a + b, 0)
  let classificacao: string
  if (score === 100) classificacao = 'Independente'
  else if (score >= 85) classificacao = 'Dependência mínima'
  else if (score >= 60) classificacao = 'Dependência moderada'
  else if (score >= 40) classificacao = 'Dependência grave'
  else classificacao = 'Dependência total'
  return { score, classificacao }
}

// ─── MNA ─────────────────────────────────────────────────────────────────────
// Triagem (máx 14) + Avaliação global (máx 16). Total máx: 30

export function calcularMNA(scoreA: number, scoreB: number): { score: number; classificacao: string } {
  const score = scoreA + scoreB
  let classificacao: string
  if (score >= 24) classificacao = 'Estado nutricional normal'
  else if (score >= 17) classificacao = 'Risco de desnutrição'
  else classificacao = 'Desnutrido'
  return { score, classificacao }
}

// Apenas triagem (parte A) — máx 14
export function trigemMNA(scoreTriagem: number): string {
  if (scoreTriagem >= 12) return 'Normal (sem risco)' // não precisa da parte B
  if (scoreTriagem >= 8) return 'Possível desnutrição — continuar avaliação'
  return 'Desnutrido — continuar avaliação'
}

// ─── MMSE ─────────────────────────────────────────────────────────────────────
// Máx: 30 pontos

export function calcularMMSE(score: number, escolaridade: 'analfabeto' | 'ate4anos' | 'mais4anos'): { score: number; classificacao: string; pontoCutoff: number } {
  const cutoffs = { analfabeto: 13, ate4anos: 18, mais4anos: 26 }
  const cutoff = cutoffs[escolaridade]
  const classificacao = score <= cutoff ? 'Sugestivo de comprometimento cognitivo' : 'Sem comprometimento cognitivo'
  return { score, classificacao, pontoCutoff: cutoff }
}

// ─── GDS-15 ───────────────────────────────────────────────────────────────────
// 15 perguntas, respostas booleanas. Cada resposta "depressiva" = 1 ponto.

export interface GDS15Respostas {
  satisfeito_com_vida: boolean        // Não = depressivo
  abandonou_atividades: boolean       // Sim = depressivo
  vida_vazia: boolean                 // Sim = depressivo
  entediado: boolean                  // Sim = depressivo
  bem_humorado: boolean               // Não = depressivo
  medo_algo_ruim: boolean             // Sim = depressivo
  feliz_maior_tempo: boolean          // Não = depressivo
  desamparado: boolean                // Sim = depressivo
  prefere_ficar_em_casa: boolean      // Sim = depressivo
  problemas_memoria: boolean          // Sim = depressivo
  maravilhoso_estar_vivo: boolean     // Não = depressivo
  inutil: boolean                     // Sim = depressivo
  cheio_energia: boolean              // Não = depressivo
  situacao_sem_esperanca: boolean     // Sim = depressivo
  maioria_melhor: boolean             // Sim = depressivo
}

export function calcularGDS15(respostas: GDS15Respostas): { score: number; classificacao: string } {
  const depressivos: (keyof GDS15Respostas)[] = [
    'abandonou_atividades', 'vida_vazia', 'entediado', 'medo_algo_ruim',
    'desamparado', 'prefere_ficar_em_casa', 'problemas_memoria',
    'inutil', 'situacao_sem_esperanca', 'maioria_melhor',
  ]
  const naoDepressivos: (keyof GDS15Respostas)[] = [
    'satisfeito_com_vida', 'bem_humorado', 'feliz_maior_tempo',
    'maravilhoso_estar_vivo', 'cheio_energia',
  ]
  let score = 0
  depressivos.forEach((k) => { if (respostas[k]) score++ })
  naoDepressivos.forEach((k) => { if (!respostas[k]) score++ })

  let classificacao: string
  if (score <= 4) classificacao = 'Normal'
  else if (score <= 8) classificacao = 'Depressão leve'
  else if (score <= 11) classificacao = 'Depressão moderada'
  else classificacao = 'Depressão severa'
  return { score, classificacao }
}

// ─── PPS ─────────────────────────────────────────────────────────────────────
// 11 níveis (0, 10, 20, ..., 100%). Score direto.

export const PPS_SCORES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const
export type PPSScore = (typeof PPS_SCORES)[number]

export function classificarPPS(score: PPSScore): string {
  if (score === 0) return 'Morte'
  if (score <= 20) return 'Fase final da vida — cuidados de conforto totais'
  if (score <= 40) return 'Acamado / incapacitado — cuidados paliativos intensivos'
  if (score <= 60) return 'Redução significativa de atividade — suporte intensivo'
  if (score <= 80) return 'Atividade reduzida mas ambulatório'
  return 'Independente / ativo'
}

// ─── BRADEN ───────────────────────────────────────────────────────────────────
// 6 itens: percepção sensorial, umidade, atividade, mobilidade, nutrição, fricção/cisalhamento
// Máx: 23. Fricção: máx 3. Demais: máx 4.

export interface BradenRespostas {
  percepcao_sensorial: 1 | 2 | 3 | 4
  umidade: 1 | 2 | 3 | 4
  atividade: 1 | 2 | 3 | 4
  mobilidade: 1 | 2 | 3 | 4
  nutricao: 1 | 2 | 3 | 4
  friccao_cisalhamento: 1 | 2 | 3
}

export function calcularBraden(respostas: BradenRespostas): { score: number; classificacao: string; corRisco: string } {
  const score = Object.values(respostas).reduce((a, b) => a + b, 0)
  let classificacao: string
  let corRisco: string
  if (score <= 9) { classificacao = 'Risco muito alto'; corRisco = 'vermelho' }
  else if (score <= 12) { classificacao = 'Risco alto'; corRisco = 'laranja' }
  else if (score <= 14) { classificacao = 'Risco moderado'; corRisco = 'amarelo' }
  else if (score <= 18) { classificacao = 'Risco baixo'; corRisco = 'amarelo' }
  else { classificacao = 'Sem risco'; corRisco = 'verde' }
  return { score, classificacao, corRisco }
}

// ─── MORSE ───────────────────────────────────────────────────────────────────
// 6 itens. Máx: 125.

export interface MorseRespostas {
  historico_queda: 0 | 25
  diagnostico_secundario: 0 | 15
  auxilio_ambulacao: 0 | 15 | 30
  terapia_intravenosa: 0 | 20
  marcha: 0 | 10 | 20
  estado_mental: 0 | 15
}

export function calcularMorse(respostas: MorseRespostas): { score: number; classificacao: string; corRisco: string } {
  const score = Object.values(respostas).reduce((a, b) => a + b, 0)
  let classificacao: string
  let corRisco: string
  if (score < 25) { classificacao = 'Risco baixo'; corRisco = 'verde' }
  else if (score < 50) { classificacao = 'Risco moderado'; corRisco = 'amarelo' }
  else { classificacao = 'Risco alto'; corRisco = 'vermelho' }
  return { score, classificacao, corRisco }
}
