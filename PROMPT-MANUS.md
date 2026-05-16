# PROMPT COMPLETO PARA O MANUS
## Sistema Vila Focolare — Refinamento Visual, Módulo de Rotina e Finalização do MVP

---

## 1. CONTEXTO DO PROJETO

Você vai trabalhar em um sistema web interno chamado **Sistema Vila Focolare**, uma plataforma de gestão do cuidado residencial para pessoas idosas.

**O que é:**
Uma comunidade residencial — não um hospital, não uma ILPI fria — onde pessoas idosas vivem e recebem cuidado contínuo. O sistema organiza rotinas, medicações, intercorrências e indicadores de qualidade.

**Responsável técnico:** Dr. Wagner Reis — Igarassu-PE

**Tagline oficial da marca:** *"Cuidado com alma"*

**Pergunta central que o sistema deve responder:**
> O cuidado diário está acontecendo de forma segura, organizada e rastreável?

---

## 2. STACK TÉCNICA

```
Next.js 14 (App Router, TypeScript)
Tailwind CSS (design system já configurado)
Supabase (autenticação + banco de dados PostgreSQL)
Radix UI (componentes headless)
Lucide React (ícones)
Recharts (gráficos)
@react-pdf/renderer (exportação PDF)
```

**Projeto localizado em:** `C:/Users/wagne/vila-focolare-app/`

---

## 3. IDENTIDADE VISUAL COMPLETA

### 3.1 Logomarca escolhida

A logomarca oficial é o conceito **"O Abraço"** — dois braços que sobem das laterais, se curvam para dentro e se encontram no alto, formando uma chama no espaço que abraçam. A chama nasce do encontro.

**Arquivo oficial:** `public/logo-encontro-2.svg`

**SVG da logomarca (versão colorida — copiar exatamente):**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80" fill="none">
  <path d="M 8,68 C 8,60 8,50 10,42 C 12,32 18,22 28,14 C 32,11 34,10 36,11 C 32,14 28,20 26,28 C 24,36 24,46 24,56 L 22,68 Z" fill="#2B5F8A"/>
  <path d="M 64,68 C 64,60 64,50 62,42 C 60,32 54,22 44,14 C 40,11 38,10 36,11 C 40,14 44,20 46,28 C 48,36 48,46 48,56 L 50,68 Z" fill="#2B5F8A" opacity="0.8"/>
  <path d="M 36,14 C 30,20 26,30 26,40 C 26,52 30,62 36,68 C 42,62 46,52 46,40 C 46,30 42,20 36,14 Z" fill="#C96B1E"/>
  <ellipse cx="36" cy="44" rx="7" ry="13" fill="#E8924A"/>
  <ellipse cx="36" cy="46" rx="4" ry="8" fill="#F5C89A" opacity="0.9"/>
  <circle cx="36" cy="10" r="4" fill="#C96B1E"/>
  <circle cx="36" cy="10" r="2" fill="#F5C89A"/>
  <text x="80" y="32" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="11" font-weight="400" fill="#4A8BBF" letter-spacing="3">VILA</text>
  <text x="80" y="56" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="23" font-weight="700" fill="#2B5F8A" letter-spacing="0.5">Focolare</text>
  <text x="81" y="69" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="8" font-weight="400" fill="#64748B" letter-spacing="1.2">Cuidado com alma</text>
</svg>
```

**SVG versão negativa (fundo escuro — sidebar, login):**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80" fill="none">
  <path d="M 8,68 C 8,60 8,50 10,42 C 12,32 18,22 28,14 C 32,11 34,10 36,11 C 32,14 28,20 26,28 C 24,36 24,46 24,56 L 22,68 Z" fill="#FFFFFF"/>
  <path d="M 64,68 C 64,60 64,50 62,42 C 60,32 54,22 44,14 C 40,11 38,10 36,11 C 40,14 44,20 46,28 C 48,36 48,46 48,56 L 50,68 Z" fill="#FFFFFF" opacity="0.8"/>
  <path d="M 36,14 C 30,20 26,30 26,40 C 26,52 30,62 36,68 C 42,62 46,52 46,40 C 46,30 42,20 36,14 Z" fill="#F5C89A"/>
  <ellipse cx="36" cy="44" rx="7" ry="13" fill="#FFF5E8"/>
  <ellipse cx="36" cy="46" rx="4" ry="8" fill="#FFFFFF" opacity="0.9"/>
  <circle cx="36" cy="10" r="4" fill="#F5C89A"/>
  <circle cx="36" cy="10" r="2" fill="#FFFFFF"/>
  <text x="80" y="32" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="11" font-weight="400" fill="rgba(255,255,255,0.65)" letter-spacing="3">VILA</text>
  <text x="80" y="56" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="23" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">Focolare</text>
  <text x="81" y="69" font-family="'Plus Jakarta Sans','Segoe UI',sans-serif" font-size="8" font-weight="400" fill="rgba(255,255,255,0.5)" letter-spacing="1.2">Cuidado com alma</text>
</svg>
```

**SVG símbolo isolado (ícone/favicon):**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 80" fill="none">
  <path d="M 8,68 C 8,60 8,50 10,42 C 12,32 18,22 28,14 C 32,11 34,10 36,11 C 32,14 28,20 26,28 C 24,36 24,46 24,56 L 22,68 Z" fill="#2B5F8A"/>
  <path d="M 64,68 C 64,60 64,50 62,42 C 60,32 54,22 44,14 C 40,11 38,10 36,11 C 40,14 44,20 46,28 C 48,36 48,46 48,56 L 50,68 Z" fill="#2B5F8A" opacity="0.8"/>
  <path d="M 36,14 C 30,20 26,30 26,40 C 26,52 30,62 36,68 C 42,62 46,52 46,40 C 46,30 42,20 36,14 Z" fill="#C96B1E"/>
  <ellipse cx="36" cy="44" rx="7" ry="13" fill="#E8924A"/>
  <ellipse cx="36" cy="46" rx="4" ry="8" fill="#F5C89A" opacity="0.9"/>
  <circle cx="36" cy="10" r="4" fill="#C96B1E"/>
  <circle cx="36" cy="10" r="2" fill="#F5C89A"/>
</svg>
```

### 3.2 Paleta de Cores

**Já configurada no `tailwind.config.ts` — use as classes Tailwind:**

```
AZUL PROFUNDO   #2B5F8A  → bg-primary-800 / text-primary-800
AZUL MÉDIO      #4A8BBF  → bg-primary-600 / text-primary-600
AZUL SUAVE      #9FC5E0  → bg-primary-300 / text-primary-300
AZUL NÉVOA      #E8F3FA  → bg-primary-100 / text-primary-100
AZUL NOITE      #0f2a40  → bg-primary-950

ÂMBAR LAREIRA   #C96B1E  → bg-accent-500 / text-accent-500
ÂMBAR QUENTE    #E8924A  → bg-accent-300
ÂMBAR SUAVE     #F5C89A  → bg-accent-200
ÂMBAR PÁLIDO    #F5E8D5  → bg-accent-100

BRANCO QUENTE   #F9F7F4  → bg-warm-white (background padrão)
CARVÃO          #2D3748  → text-foreground
CINZA TEXTO     #64748B  → text-muted
BORDA           #CBD5E1  → border-border

RISCO VERDE     #16A34A  → risk-verde
RISCO AMARELO   #CA8A04  → risk-amarelo
RISCO LARANJA   #EA580C  → risk-laranja
RISCO VERMELHO  #DC2626  → risk-vermelho
```

### 3.3 Tipografia

```
HEADINGS:  Plus Jakarta Sans (var(--font-jakarta)) — já carregada
CORPO:     Inter (var(--font-inter)) — já carregada

H1: 32px / Bold 700 / #2D3748
H2: 24px / SemiBold 600 / #2D3748
H3: 20px / SemiBold 600 / #2B5F8A
Body: 16px / Regular 400 / #2D3748
Small: 14px / Regular 400 / #64748B
Label: 12px / SemiBold 600 uppercase / #64748B
```

### 3.4 Componentes visuais base (já no globals.css)

```css
.card          → bg-card rounded-lg shadow-card p-6
.btn-primary   → bg-primary-800 hover:bg-primary-900 text-white ...
.btn-secondary → bg-white border border-primary-300 text-primary-800 ...
.btn-accent    → bg-accent-500 text-white ...  (botão âmbar — CTAs principais)
.input         → border rounded-md min-h-[48px] ...
.sidebar-item  → flex items-center gap-3 px-3 py-2.5 rounded-md ...
.badge-verde / .badge-amarelo / .badge-laranja / .badge-vermelho
```

---

## 4. O QUE JÁ EXISTE NO SISTEMA

O projeto já tem estrutura funcional. **Não recrie o que já existe — refine e complete:**

### Telas já implementadas:
```
✅ /login                          → Tela de login (fundo azul + card branco)
✅ /dashboard                      → Central de comando (StatCards + residentes + timeline)
✅ /residentes                     → Lista de moradores
✅ /residentes/[id]                → Ficha do morador
✅ /residentes/[id]/prontuario     → Prontuário com notas clínicas
✅ /residentes/[id]/avaliacoes     → Avaliações (Katz, Barthel, Braden, Morse, GDS-15, PPS)
✅ /residentes/[id]/plano-cuidados → Plano de cuidados
✅ /residentes/[id]/prescricoes    → Prescrições médicas
✅ /residentes/[id]/medicacoes     → Medicações do residente
✅ /residentes/novo                → Cadastro de novo morador
✅ /medicacoes                     → Grade de medicações (visão geral)
✅ /incidentes                     → Lista de incidentes/intercorrências
✅ /incidentes/novo                → Registro de incidente
✅ /incidentes/[id]                → Detalhe do incidente
✅ /qualidade/indicadores          → Indicadores de qualidade
✅ /qualidade/relatorios           → Relatórios
✅ /admin/usuarios                 → Gestão de usuários
✅ /admin/configuracoes            → Configurações
✅ /admin/auditoria                → Auditoria do sistema
```

### Componentes de layout já implementados:
```
✅ Sidebar.tsx    → Sidebar desktop (bg-primary-800, logo branca, nav items)
✅ Header.tsx     → Cabeçalho mobile
✅ MobileNav.tsx  → Navegação inferior mobile
✅ StatCard.tsx   → Cards de estatística do dashboard
✅ SemaforoRisco.tsx → Badges de risco coloridos
```

### Autenticação:
```
✅ Supabase Auth com perfis de acesso
✅ Perfis: admin, medico, enfermeiro, tecnico_enfermagem, fisioterapeuta,
          nutricionista, psicologo, assistente_social, terapeuta_ocupacional, farmaceutico
✅ Middleware de proteção de rotas
```

---

## 5. O QUE FALTA CONSTRUIR (PRIORIDADE ALTA)

### 5.1 — MÓDULO ROTINA DE CUIDADO (MAIS IMPORTANTE)
**Este módulo ainda não existe. É a principal lacuna do sistema.**

**Objetivo:** Permitir que as cuidadoras registrem, pelo celular com poucos cliques, as rotinas básicas de cada morador.

**Rotas a criar:**
```
/rotina                     → Tela "Meu Turno" — visão geral das pendências do turno
/rotina/[residenteId]       → Registro rápido de rotina de um morador específico
```

**Tela /rotina — "Meu Turno" (mobile-first):**
```
Header: "Meu Turno — [turno: manhã/tarde/noite]" + data atual
Lista de moradores ativos com:
  - Avatar com iniciais
  - Nome preferido / nome
  - Semáforo de risco
  - Indicadores visuais: banho ✓/pendente, alimentação ✓/pendente, medicação ✓/pendente
  - Botão "Registrar" para abrir o formulário de rotina
Botão flutuante (FAB) vermelho: "+ Intercorrência" → redireciona para /incidentes/novo
```

**Tela /rotina/[residenteId] — Registro de Rotina:**
```
Seções colapsáveis, cada uma com botões grandes (min 56px altura):

── BANHO ──────────────────────────────
[ ✅ Realizado ] [ ❌ Recusado ] [ ⏭ Não realizado ] [ 🚿 Higiene parcial ]
Campo: Observação (opcional, obrigatório se recusado)

── ALIMENTAÇÃO ────────────────────────
[ 😊 Bem ] [ 😐 Parcialmente ] [ 😟 Pouco ] [ ❌ Recusou ] [ 🚫 Não ofertado ]
Campo: Observação (opcional, obrigatório se recusou ou pouco)

── SONO ────────────────────────────────
[ 😴 Bem ] [ 😣 Mal ] [ 🔄 Interrompido ] [ 😵 Sonolência excessiva ] [ 😤 Agitação ]
Campo: Observação (opcional)

── EVACUAÇÃO ───────────────────────────
[ ✅ Evacuou ] [ ⏭ Não evacuou ] [ ⚠️ Alterada ] [ 🔴 Diarreia ] [ 🟡 Constipação ]
Campo: Observação (opcional)

── DIURESE ─────────────────────────────
[ ✅ Presente ] [ ⬇️ Reduzida ] [ ❌ Ausente ] [ ⚠️ Alteração ]
Campo: Observação (opcional, obrigatório se ausente ou alteração)

── SINAIS DE ATENÇÃO ───────────────────
Chips/tags selecionáveis (múltipla seleção):
[ Dor ] [ Febre ] [ Falta de ar ] [ Tontura ]
[ Sonolência incomum ] [ Agitação/confusão ] [ Queda ] [ Quase queda ]
[ Recusa importante ] [ Outro ]
Campo: Descrição breve (obrigatório se qualquer sinal selecionado)
Botão: "Abrir Intercorrência" (aparece quando sinal crítico é selecionado)

Botão final: [ SALVAR REGISTRO ] — btn-accent, grande, posição fixa no bottom
```

**Banco de dados — tabela `registros_rotina`:**
```sql
id              uuid PRIMARY KEY
residente_id    uuid REFERENCES residentes(id)
tipo_rotina     text  -- 'banho' | 'alimentacao' | 'sono' | 'evacuacao' | 'diurese' | 'sinal_atencao'
status          text  -- depende do tipo (ver opções acima)
observacao      text
turno           text  -- 'manha' | 'tarde' | 'noite'
registrado_por  uuid REFERENCES user_profiles(id)
registrado_em   timestamptz DEFAULT now()
created_at      timestamptz DEFAULT now()
```

### 5.2 — ATUALIZAÇÃO DO LOGO

O arquivo `public/logo-white.svg` tem um símbolo antigo e diferente da logomarca oficial escolhida. 

**Ação:** Substituir o conteúdo de `public/logo-white.svg` com o SVG da versão negativa fornecido na seção 3.1 deste documento.

Também criar/verificar existência de:
- `public/logo-encontro-2.svg` → logo colorida (já deve existir)
- `public/logo-icon.svg` → símbolo isolado

### 5.3 — RENOMEAÇÃO DE LINGUAGEM

O sistema usa termos hospitalares que devem ser suavizados. **Fazer as seguintes substituições:**

```
"Sistema de Gestão Clínica"   → "Gestão do Cuidado · Rotina e Segurança"
"Residentes"                  → "Moradores" (labels visíveis ao usuário)
"Incidentes"                  → "Intercorrências" (labels visíveis)
"Evoluções Recentes"          → "Últimos Registros"
"Paciente" (se existir)       → "Morador"
```

**IMPORTANTE:** Mudar apenas os textos exibidos ao usuário (labels, títulos, descrições). NÃO renomear rotas de URL nem nomes de tabelas do banco de dados — isso quebraria o sistema.

Arquivos a atualizar:
- `src/app/layout.tsx` — title e description do metadata
- `src/components/layout/Sidebar.tsx` — labels de navegação
- `src/app/(dashboard)/dashboard/page.tsx` — títulos dos cards

### 5.4 — REFINAMENTO DA TELA DE LOGIN

A tela de login já tem boa estrutura. Refinamentos:

1. Substituir o `Image` src="/logo-white.svg" pelo SVG inline da logomarca negativa (evita dependência do arquivo e garante o logo correto)
2. Mudar o subtítulo de "Sistema de Gestão Clínica" para "Gestão do cuidado · Igarassu-PE"
3. Adicionar animação suave de entrada no card (opacity + translateY)
4. A linha "Acessar com PIN (técnicos)" pode ser removida (era TODO, não implementado)

### 5.5 — REFINAMENTO DO DASHBOARD

O dashboard já tem os StatCards. Melhorias:

1. **Adicionar card de Rotinas do dia** — mostrando quantos moradores já tiveram rotina registrada hoje vs. total
2. **Melhorar a Timeline** — renomear "Evoluções Recentes" para "Últimos Registros" e incluir registros de rotina além de notas de prontuário
3. **Adicionar seção "Próximos alertas"** — medicações nas próximas 2h
4. **Melhorar semáforo de residentes** — incluir quantidade de alertas pendentes de cada morador

### 5.6 — MOBILE NAVIGATION

O componente `MobileNav.tsx` precisa incluir a rota `/rotina` com ícone de checklist para cuidadoras.

Navegação mobile (bottom nav) sugerida:
```
[🏠 Início]  [👥 Moradores]  [✅ Meu Turno]  [💊 Medicações]  [⚠️ Intercorrências]
  /dashboard    /residentes      /rotina          /medicacoes       /incidentes
```

---

## 6. AJUSTES VISUAIS GERAIS

### 6.1 Sidebar
A sidebar já está bem estruturada. Pequenos refinamentos:
- Adicionar item "Meu Turno" com ícone `ClipboardList` apontando para `/rotina`
- Posicioná-lo como segundo item, logo após Dashboard
- Label "Residentes" → "Moradores" (apenas o label exibido)
- Label "Incidentes" → "Intercorrências"

### 6.2 Cards de moradores
Nos cards/lista de moradores, incluir:
- Indicador visual de "rotina pendente hoje" (pequeno ícone laranja)
- Tooltip ou badge com última rotina registrada

### 6.3 Página de indicadores (/qualidade/indicadores)
Adicionar seção "Indicadores de Rotina":
- % moradores com banho registrado hoje
- % moradores com alimentação registrada hoje
- % moradores com rotina completa hoje (todos os itens)

---

## 7. ESTRUTURA DE ARQUIVOS A CRIAR

```
src/app/(dashboard)/rotina/
  ├── page.tsx                    → Tela "Meu Turno"
  └── [residenteId]/
      └── page.tsx                → Formulário de registro de rotina

src/components/rotina/
  ├── MeuTurnoCard.tsx            → Card de morador no turno
  ├── BotaoRotina.tsx             → Botão grande de opção (banho, alimentação, etc.)
  ├── SecaoRotina.tsx             → Seção colapsável (wrapper de cada categoria)
  └── FormRegistroRotina.tsx      → Formulário completo de rotina
```

---

## 8. ESPECIFICAÇÕES DE UX OBRIGATÓRIAS

### Para cuidadoras (mobile-first):
- Toque mínimo: **56px de altura** em qualquer botão interativo
- Fonte mínima: **16px** em textos de ação
- Feedback visual imediato ao selecionar uma opção (cor de destaque, ícone de check)
- Estado selecionado deve ser óbvio — não pode parecer igual ao não-selecionado
- Scroll mínimo — formulário de rotina deve ser fluido, não longo
- Salvar individualmente cada seção (não forçar preencher tudo de uma vez)
- Botão "Salvar" sempre visível (sticky bottom ou sempre no final da seção)

### Para desktop (admin/gestão):
- Dashboard deve ter visão clara de pendências
- Tabelas devem ter filtros por data e morador
- Cards de estatística com números grandes e legíveis
- Cores semânticas nos alertas (verde=ok, amarelo=atenção, vermelho=urgente)

### Linguagem (microcopy):
```
✅ "Registro salvo com sucesso"
✅ "Dona Maria ainda não teve rotina registrada hoje"
✅ "Medicação das 08h — Losartana 50mg — Pendente"
✅ "2 moradores sem banho registrado"
❌ "Registro #4821 processado"
❌ "ERRO: campo obrigatório"  → ✅ "Informe o motivo da recusa"
```

---

## 9. BANCO DE DADOS — SUPABASE

### Tabela nova a criar: `registros_rotina`
```sql
CREATE TABLE registros_rotina (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id    uuid NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  tipo_rotina     text NOT NULL CHECK (tipo_rotina IN (
                    'banho', 'alimentacao', 'sono', 'evacuacao', 'diurese', 'sinal_atencao'
                  )),
  status          text NOT NULL,
  observacao      text,
  turno           text CHECK (turno IN ('manha', 'tarde', 'noite')),
  registrado_por  uuid REFERENCES user_profiles(id),
  registrado_em   timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE registros_rotina ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários autenticados leem registros_rotina"
  ON registros_rotina FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuários autenticados inserem registros_rotina"
  ON registros_rotina FOR INSERT TO authenticated WITH CHECK (auth.uid() = registrado_por);
```

### Verificar se a tabela `residentes` tem os campos:
- `nome_preferido` (text, nullable) — nome que a equipe usa no dia a dia
- `nivel_risco` (text) — 'verde' | 'amarelo' | 'laranja' | 'vermelho'
- `quarto` (text, nullable) — localização/quarto

---

## 10. DADOS DE DEMONSTRAÇÃO

Crie seed data para testes (se não existir):

```typescript
// 5 moradores fictícios
const moradores = [
  { nome: "Maria Aparecida Santos", nome_preferido: "Dona Maria", data_nascimento: "1942-03-15", quarto: "01", nivel_risco: "amarelo", status: "ativo" },
  { nome: "José Ferreira Lima", nome_preferido: "Seu José", data_nascimento: "1938-07-22", quarto: "02", nivel_risco: "verde", status: "ativo" },
  { nome: "Antônia Bezerra Costa", nome_preferido: "Dona Antônia", data_nascimento: "1945-11-08", quarto: "03", nivel_risco: "laranja", status: "ativo" },
  { nome: "Raimundo Soares", nome_preferido: "Seu Raimundo", data_nascimento: "1935-05-30", quarto: "04", nivel_risco: "vermelho", status: "ativo" },
  { nome: "Benedita Oliveira", nome_preferido: "Dona Bene", data_nascimento: "1950-09-12", quarto: "05", nivel_risco: "verde", status: "ativo" },
]
```

---

## 11. ORDEM DE EXECUÇÃO

Execute exatamente nesta sequência:

### ETAPA 1 — Inspeção (não modifique nada ainda)
1. Leia a estrutura atual do projeto
2. Leia `tailwind.config.ts` para entender o design system
3. Leia `src/app/globals.css` para entender os componentes base
4. Leia `src/components/layout/Sidebar.tsx`
5. Leia `src/app/(dashboard)/dashboard/page.tsx`
6. Confirme quais arquivos SVG existem em `public/`
7. Liste o que encontrou antes de começar

### ETAPA 2 — Logo e identidade visual
1. Atualize `public/logo-white.svg` com o SVG negativo da seção 3.1
2. Confirme que `public/logo-encontro-2.svg` existe e está correto
3. Confirme que `public/logo-icon.svg` existe

### ETAPA 3 — Linguagem e metadados
1. Atualize `src/app/layout.tsx` — title e description
2. Atualize os labels da sidebar (Residentes→Moradores, Incidentes→Intercorrências)
3. Adicione item "Meu Turno" na sidebar apuntando para `/rotina`
4. Atualize navegação mobile em `MobileNav.tsx`

### ETAPA 4 — Tela de Login
1. Substitua o `Image` pelo SVG inline da logo negativa
2. Ajuste o subtítulo
3. Adicione animação de entrada
4. Remova o botão PIN (era TODO não implementado)

### ETAPA 5 — Módulo Rotina (principal)
1. Crie a estrutura de pastas `src/app/(dashboard)/rotina/`
2. Crie os componentes em `src/components/rotina/`
3. Implemente `/rotina` — Meu Turno
4. Implemente `/rotina/[residenteId]` — Formulário de rotina
5. Crie o SQL da tabela `registros_rotina` em `supabase/migrations/`

### ETAPA 6 — Dashboard
1. Adicione card de "Rotinas do dia"
2. Renomeie "Evoluções Recentes" para "Últimos Registros"
3. Inclua registros de rotina na timeline

### ETAPA 7 — Testes e ajustes
1. Verifique responsividade mobile de todas as telas novas
2. Verifique que botões têm pelo menos 56px de altura
3. Verifique que a logo nova aparece corretamente em: login, sidebar, e mobile header
4. Verifique que as cores estão corretas (sem erros de classe Tailwind)

---

## 12. ENTREGÁVEIS ESPERADOS

Ao final, o sistema deve ter:

- [ ] Logo oficial "O Abraço" aplicada em toda a interface
- [ ] Linguagem residencial em todos os textos visíveis ao usuário
- [ ] Módulo `/rotina` completo e funcional (mobile-first)
- [ ] Sidebar com item "Meu Turno"
- [ ] Mobile bottom nav com "Meu Turno"
- [ ] Dashboard com card de rotinas do dia
- [ ] Tabela `registros_rotina` com RLS configurado
- [ ] Login refinado com logo inline e texto correto
- [ ] Nenhuma tela existente quebrada

---

## 13. RESTRIÇÕES IMPORTANTES

```
❌ NÃO renomear rotas de URL (ex: /residentes continua sendo /residentes)
❌ NÃO renomear tabelas do banco de dados
❌ NÃO remover funcionalidades existentes que funcionam
❌ NÃO recriar do zero o que já existe — apenas refinar
❌ NÃO usar linguagem hospitalar pesada na interface do usuário
❌ NÃO criar telas de administração complexas (já existem)
❌ NÃO usar animações pesadas que afetem performance no mobile
✅ SEMPRE testar responsividade mobile
✅ SEMPRE usar as classes Tailwind do design system existente
✅ SEMPRE usar a logomarca oficial "O Abraço" (logo-encontro-2.svg)
✅ SEMPRE manter o padrão de código TypeScript + Next.js App Router
```

---

## 14. REFERÊNCIA FINAL — ARQUIVOS CHAVE

```
tailwind.config.ts              → Design system completo (cores, fontes, sombras)
src/app/globals.css             → Componentes base (card, btn-*, input, label, badges)
src/lib/types/database.ts       → Tipos TypeScript de todas as entidades
src/lib/supabase/client.ts      → Cliente Supabase para client components
src/lib/supabase/server.ts      → Cliente Supabase para server components
src/middleware.ts               → Proteção de rotas
src/components/layout/Sidebar.tsx → Sidebar (a modificar)
src/components/layout/MobileNav.tsx → Nav mobile (a modificar)
public/logo-encontro-2.svg      → Logo oficial colorida
public/logo-white.svg           → Logo negativa (a atualizar)
public/logo-icon.svg            → Símbolo isolado
```

---

*Documento gerado em maio/2026 para uso no Manus — Vila Focolare · Dr. Wagner Reis · Igarassu-PE*
