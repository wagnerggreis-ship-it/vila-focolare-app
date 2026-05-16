# 🏠 Guia de Deploy — Vila Focolare
**Sistema de Gestão Clínica | Para o Dr. Wagner Reis**

Este guia foi escrito para quem nunca fez deploy de um sistema web antes. Siga os passos na ordem — cada etapa depende da anterior. Estima-se **60 a 90 minutos** para a primeira configuração.

---

## 📋 O que você vai precisar criar (tudo gratuito)

| Conta | Site | Para que serve |
|-------|------|----------------|
| GitHub | github.com | Guardar os arquivos do sistema |
| Supabase | supabase.com | Banco de dados + autenticação |
| Vercel | vercel.com | Hospedar o sistema na internet |
| Resend | resend.com | Enviar emails de notificação (opcional) |

---

## ETAPA 1 — Criar conta no GitHub

1. Acesse **github.com** e clique em **"Sign up"**
2. Preencha: email, senha, nome de usuário
3. Confirme seu email
4. Após entrar, clique em **"+ New repository"** (botão verde no canto superior)
5. Configure:
   - **Repository name:** `vila-focolare-app`
   - **Visibility:** Private (privado — só você acessa)
   - Deixe as demais opções desmarcadas
6. Clique em **"Create repository"**

### Subir os arquivos para o GitHub

1. Na página do repositório recém-criado, clique em **"uploading an existing file"** (link azul no texto central)
2. **Comprima** a pasta `C:\Users\wagne\vila-focolare-app\` em um arquivo ZIP:
   - Clique com o botão direito na pasta
   - "Comprimir para arquivo ZIP"
3. No GitHub, **arraste o ZIP** para a área de upload
4. Role até o final e clique em **"Commit changes"**

> **Alternativa mais fácil:** Instale o **GitHub Desktop** (desktop.github.com) — é um programa visual que sincroniza a pasta automaticamente sem precisar de linha de comando. Após instalar: File → Add local repository → selecionar `C:\Users\wagne\vila-focolare-app\` → Publish repository.

---

## ETAPA 2 — Criar e configurar o Supabase

### 2.1 Criar o projeto

1. Acesse **supabase.com** e clique em **"Start your project"**
2. Crie uma conta (pode usar a conta Google)
3. Clique em **"New project"**
4. Configure:
   - **Name:** `vila-focolare`
   - **Database Password:** crie uma senha forte e **salve em local seguro**
   - **Region:** `South America (São Paulo)`
5. Clique em **"Create new project"** — aguarde cerca de 2 minutos

### 2.2 Executar o banco de dados

1. No painel do Supabase, clique em **"SQL Editor"** (ícone de banco de dados no menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo `C:\Users\wagne\vila-focolare\spec\system-spec.md` no Bloco de Notas
4. Localize a seção **"BANCO DE DADOS — SCHEMA SQL COMPLETO"**
5. Copie todo o conteúdo SQL (começa em `CREATE EXTENSION` e vai até o final dos `INSERT INTO`)
6. Cole no SQL Editor do Supabase
7. Clique em **"Run"** (botão verde) — aguarde a mensagem "Success"

### 2.3 Configurar o Storage (fotos)

1. No menu lateral do Supabase, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Nome: `fotos-residentes` | Marque **"Public bucket"** | Clique em "Save"
4. Repita para criar mais um bucket: `documentos` (Public)

### 2.4 Copiar as chaves de API

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Copie e guarde em um bloco de notas:
   - **Project URL** → vai para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon (public) key** → vai para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (clique em "Reveal") → vai para `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ A `service_role key` é secreta. Nunca compartilhe nem publique.

---

## ETAPA 3 — Deploy no Vercel

1. Acesse **vercel.com** e clique em **"Sign Up"**
2. Escolha **"Continue with GitHub"** — isso conecta as duas contas automaticamente
3. Na tela inicial do Vercel, clique em **"Add New Project"**
4. Você verá o repositório `vila-focolare-app` — clique em **"Import"**
5. Deixe as configurações padrão e procure a seção **"Environment Variables"**
6. Adicione cada variável clicando em **"Add"** para cada uma:

```
Nome da variável                    Valor
─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL            [cole o Project URL do Supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY       [cole a anon key do Supabase]
SUPABASE_SERVICE_ROLE_KEY           [cole a service_role key do Supabase]
RESEND_API_KEY                      [cole a chave do Resend — ver Etapa 4]
RESEND_FROM_EMAIL                   sistema@vilafocolare.com.br
RESPONSAVEL_TECNICO_EMAIL           [seu email pessoal]
```

7. Após adicionar todas as variáveis, clique em **"Deploy"**
8. Aguarde 3 a 5 minutos — o Vercel vai compilar e publicar o sistema
9. Ao finalizar, você receberá uma URL como: `vila-focolare-app.vercel.app` ✅

---

## ETAPA 4 — Configurar emails (Resend — opcional)

> O sistema funciona sem isso, mas os alertas por email não serão enviados.

1. Acesse **resend.com** e crie uma conta gratuita
2. Vá em **"API Keys"** → **"Create API Key"**
3. Nomeie como `vila-focolare` e copie a chave gerada
4. Cole na variável `RESEND_API_KEY` no Vercel (Settings → Environment Variables)

---

## ETAPA 5 — Criar o primeiro usuário (você)

### 5.1 Criar a conta no Supabase

1. No Supabase, vá em **"Authentication"** → **"Users"**
2. Clique em **"Invite user"**
3. Insira seu email: `wagnerggreis@gmail.com`
4. Clique em **"Send invite"**
5. Você receberá um email — clique no link e defina sua senha

### 5.2 Registrar como Administrador no banco

1. Ainda no Supabase, vá em **"SQL Editor"** → **"New query"**
2. Vá em **"Authentication"** → **"Users"** e copie o **ID** do usuário criado (uma sequência longa como `123e4567-e89b...`)
3. Execute este SQL substituindo `[SEU-ID]`, seu nome e CRM:

```sql
INSERT INTO user_profiles (id, nome_completo, role, registro_profissional, especialidade, ativo)
VALUES (
  '[SEU-ID]',
  'Dr. Wagner Reis',
  'admin',
  'CRM-PE-XXXXX',
  'Medicina Paliativa',
  true
);
```

4. Clique em **"Run"** — "Success"!

---

## ETAPA 6 — Primeiro acesso ao sistema

1. Acesse a URL gerada pelo Vercel: `https://vila-focolare-app.vercel.app`
2. Use seu email e a senha definida no passo 5.1
3. Você verá o Dashboard como Responsável Técnico 🎉

### Criar demais usuários

Após o primeiro acesso, vá em:
**Administração → Usuários → Novo usuário**

Preencha nome, email e função de cada profissional. Eles receberão um email para definir a própria senha.

---

## ETAPA 7 — Domínio personalizado (opcional)

Para ter um endereço profissional como `sistema.vilafocolare.com.br`:

1. No Vercel, acesse seu projeto → **"Settings"** → **"Domains"**
2. Clique em **"Add"** e insira o domínio desejado
3. Siga as instruções para configurar o DNS no seu provedor de domínio
4. O Vercel configura o HTTPS automaticamente

---

## 🔒 Segurança e Backup

| Item | Status |
|------|--------|
| Criptografia em trânsito (HTTPS) | ✅ Automático no Vercel |
| Criptografia dos dados em repouso | ✅ Automático no Supabase |
| Backup automático diário | ✅ Supabase (7 dias no plano gratuito) |
| Servidor na região de São Paulo | ✅ Configurado na Etapa 2 |
| Log de auditoria imutável | ✅ Configurado no banco de dados |
| Conformidade LGPD | ✅ Supabase é certificado ISO 27001 |

---

## 🆘 Problemas comuns

**"Tela em branco após login"**
→ Verifique se as variáveis de ambiente foram adicionadas corretamente no Vercel (Settings → Environment Variables)

**"Erro 500 ao carregar"**
→ Verifique se o SQL foi executado corretamente no Supabase (Etapa 2.2)

**"Usuário não consegue entrar"**
→ Certifique-se que o `user_profiles` foi inserido (Etapa 5.2)

**"Como atualizar o sistema após alterações?"**
→ Se usar o GitHub Desktop: sincronize a pasta (Commit + Push). O Vercel detecta automaticamente e refaz o deploy em ~3 minutos.

---

## 📞 Precisa de ajuda?

Volte à conversa com o Claude Code e descreva o erro — com o contexto deste projeto, consigo te ajudar a resolver rapidamente.

---

*Vila Focolare — Sistema de Gestão Clínica*
*Dr. Wagner Reis — Responsável Técnico*
*Guia gerado em maio/2026*
