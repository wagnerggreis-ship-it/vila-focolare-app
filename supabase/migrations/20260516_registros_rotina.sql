-- Módulo Rotina de Cuidado — Vila Focolare
-- Tabela: registros_rotina
-- Atualizado com políticas RLS explícitas de segurança

CREATE TABLE IF NOT EXISTS registros_rotina (
  id              uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  residente_id    uuid          NOT NULL REFERENCES residentes(id) ON DELETE CASCADE,
  tipo_rotina     text          NOT NULL CHECK (tipo_rotina IN (
                                  'banho', 'alimentacao', 'sono',
                                  'evacuacao', 'diurese', 'sinal_atencao'
                                )),
  status          text          NOT NULL CHECK (length(trim(status)) > 0),
  observacao      text,
  turno           text          CHECK (turno IN ('manha', 'tarde', 'noite')),
  registrado_por  uuid          NOT NULL REFERENCES user_profiles(id),
  registrado_em   timestamptz   NOT NULL DEFAULT now(),
  created_at      timestamptz   NOT NULL DEFAULT now()
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_registros_rotina_residente ON registros_rotina(residente_id);
CREATE INDEX IF NOT EXISTS idx_registros_rotina_data     ON registros_rotina(registrado_em DESC);
CREATE INDEX IF NOT EXISTS idx_registros_rotina_tipo     ON registros_rotina(tipo_rotina);
CREATE INDEX IF NOT EXISTS idx_registros_rotina_turno    ON registros_rotina(turno);

-- Row Level Security
ALTER TABLE registros_rotina ENABLE ROW LEVEL SECURITY;

-- ── SELECT: qualquer usuário autenticado pode ler ─────────────────────────────
CREATE POLICY "rr_select_autenticado"
  ON registros_rotina FOR SELECT
  TO authenticated
  USING (true);

-- ── INSERT: usuário autenticado pode inserir seu próprio registro ─────────────
CREATE POLICY "rr_insert_proprio"
  ON registros_rotina FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = registrado_por);

-- ── UPDATE: apenas administrador pode atualizar registros ────────────────────
CREATE POLICY "rr_update_admin"
  ON registros_rotina FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin' AND ativo = true
    )
  );

-- ── DELETE: NEGADO para todos — registros são imutáveis ─────────────────────
-- Cuidadoras não podem excluir registros; somente DBA pode via service role
CREATE POLICY "rr_delete_negado"
  ON registros_rotina FOR DELETE
  TO authenticated
  USING (false);

-- ── COMENTÁRIO: contexto de uso ───────────────────────────────────────────────
COMMENT ON TABLE registros_rotina IS
  'Registros de rotina diária (banho, alimentação, sono, evacuação, diurese, sinais).
   Criados pelas cuidadoras durante o plantão. Imutáveis após inserção.
   Apenas administradores podem corrigir via UPDATE com justificativa.';

COMMENT ON COLUMN registros_rotina.registrado_por IS
  'Obrigatório — usuário autenticado que realizou o registro.
   Garante rastreabilidade total de quem, quando e o quê foi registrado.';
