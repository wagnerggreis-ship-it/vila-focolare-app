-- Diário automático de medicações
-- Evita duplicidade por item prescrito, residente e horário previsto.

create unique index if not exists idx_administracoes_medicamento_diario_unico
  on public.administracoes_medicamento (prescricao_item_id, residente_id, horario_previsto);

comment on index public.idx_administracoes_medicamento_diario_unico is
  'Garante uma única checagem prevista por medicação, residente e horário no diário de medicações.';
