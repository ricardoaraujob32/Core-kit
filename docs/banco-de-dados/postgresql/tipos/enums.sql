-- Tipos (ENUM) - opcional/recomendado
DO $$
BEGIN
-- =========================================================
-- ENUM: status_locatario
-- Representa o estado operacional do locatário (tenant).
--
-- REGRAS DE NEGÓCIO:
-- - Controla acesso do locatário ao sistema
-- - NÃO indica remoção física de dados
-- - Exclusão é sempre lógica
--
-- ESTADOS:
-- - ATIVO     → locatário operacional e com acesso permitido
-- - SUSPENSO  → acesso temporariamente bloqueado (inadimplência, suporte, etc)
-- - EXCLUIDO  → exclusão lógica / desativação definitiva
--
-- CONSISTÊNCIA:
-- - EXCLUIDO normalmente implica excluido_em preenchido
-- - Registros nunca devem ser removidos fisicamente
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_locatario') THEN
    CREATE TYPE status_locatario AS ENUM ('ATIVO','SUSPENSO','EXCLUIDO');
  END IF;

-- =========================================================
-- ENUM: planos_locatario
-- Classificação comercial de planos disponíveis.
--
-- REGRAS:
-- - Valores representam categorias de produto, não regras técnicas
-- - Mudanças de plano NÃO alteram histórico
--
-- EXEMPLOS:
-- - GRATUITO    → acesso básico / onboarding
-- - BASICO      → plano de entrada
-- - PRO         → funcionalidades avançadas
-- - EMPRESARIAL → uso intensivo / limites maiores
--
-- IMPORTANTE:
-- - Limites reais devem ser controlados por tabela de limites
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'planos_locatario') THEN
    CREATE TYPE planos_locatario AS ENUM ('GRATUITO','BASICO','PRO','EMPRESARIAL');
  END IF; 

-- =========================================================
-- ENUM: status_usuario
-- Estado operacional da conta do usuário.
--
-- REGRAS:
-- - NÃO é exclusão lógica
-- - Controla autenticação/autorização
--
-- ESTADOS:
-- - ATIVO      → usuário autenticável
-- - BLOQUEADO  → acesso negado sem remover vínculos
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_usuario') THEN
    CREATE TYPE status_usuario AS ENUM ('ATIVO','BLOQUEADO');
  END IF;

-- =========================================================
-- ENUM: tipo_origem_importacao
-- Origem dos dados em rotinas de importação.
--
-- USO:
-- - Controla pipeline de parsing/validação
-- - NÃO representa formato de armazenamento interno
--
-- VALORES:
-- - CSV
-- - XLSX
-- - GOOGLE_SHEETS
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_origem_importacao') THEN
    CREATE TYPE tipo_origem_importacao AS ENUM ('CSV', 'XLSX', 'GOOGLE_SHEETS');
  END IF;

-- =========================================================
-- ENUM: status_job
-- Máquina de estados de jobs assíncronos.
--
-- REGRAS IMPORTANTES:
-- - Jobs NÃO devem pular estados arbitrariamente
-- - SUCESSO e ERRO são estados terminais
--
-- TRANSIÇÕES ESPERADAS:
-- PENDENTE → EXECUTANDO
-- EXECUTANDO → SUCESSO | ERRO | CANCELADO
--
-- ESTADOS:
-- - PENDENTE     → aguardando execução
-- - EXECUTANDO   → em processamento
-- - SUCESSO      → concluído com êxito (terminal)
-- - ERRO         → falha definitiva (terminal)
-- - CANCELADO    → encerrado manualmente
-- =========================================================

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_job') THEN
    CREATE TYPE status_job AS ENUM ('PENDENTE', 'EXECUTANDO', 'SUCESSO', 'ERRO', 'CANCELADO');
  END IF;

-- =========================================================
-- ENUM: formato_exportacao
-- Formato de saída em rotinas de exportação.
--
-- REGRAS:
-- - Controla serialização/renderização
-- - NÃO define tipo MIME automaticamente
--
-- VALORES:
-- - CSV
-- - XLSX
-- - PDF
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'formato_exportacao') THEN
    CREATE TYPE formato_exportacao AS ENUM ('CSV', 'XLSX', 'PDF');
  END IF;

-- =========================================================
-- ENUM: status_assinatura
-- Estados da assinatura de um locatário
--
-- REGRAS IMPORTANTES:
-- - Reativação de locatário geralmente é possível
--
-- TRANSIÇÕES ESPERADAS:
-- ATIVA → SUSPENSA | CANCELADA | EXPIRADA
-- SUSPENSA → ATIVA
-- CANCELADA → ATIVA
-- EXPIRADA → ATIVA
--
-- ESTADOS:
-- - ATIVA     → em uso
-- - SUSPENSA  → por decisão do administrador do sistema
-- - CANCELADA → cancelada pelo locatário
-- - EXPIRADA  → chegou ao fim do contrato
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_assinatura') THEN
    CREATE TYPE status_assinatura AS ENUM ('ATIVA','SUSPENSA','CANCELADA','EXPIRADA');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ciclo_cobranca') THEN
    CREATE TYPE ciclo_cobranca AS ENUM ('MENSAL','ANUAL');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_modulo_assinatura') THEN
    CREATE TYPE status_modulo_assinatura AS ENUM ('ATIVO','SUSPENSO','REMOVIDO');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'origem_modulo_assinatura') THEN
    CREATE TYPE origem_modulo_assinatura AS ENUM ('PLANO_SUGERIDO','ADDON','CORTESIA','MANUAL_SUPERADMIN');
  END IF;

-- =========================================================
-- ENUMs recomendados (mínimos para o pacote)
-- =========================================================
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_token') THEN
    CREATE TYPE tipo_token AS ENUM ('ACESSO','REFRESH','RECUPERACAO_SENHA','CONFIRMACAO_EMAIL');
  END IF;
END $$;






