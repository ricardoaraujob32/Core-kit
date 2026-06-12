-- CONFIGURAÇÕES DO LOCATÁRIO (ENTIDADE FRACA)
-- Representa preferências e identidade visual do locatário.
--
-- REGRAS:
-- - NÃO existe sem locatário
-- - Pode haver múltiplas configurações (histórico / perfis)
-- - Apenas uma pode estar ativa (regra de negócio, não estrutural)
-- - Alterações NÃO impactam plano ou assinatura
--
-- EXEMPLOS:
-- - identidade visual
-- - emails
-- - tema
CREATE TABLE IF NOT EXISTS core.configuracoes_locatario (
  locatario_id       UUID NOT NULL,
  configuracao_id    UUID NOT NULL,
  modo_tema          core.config_locatario NOT NULL DEFAULT 'SISTEMA',
  identidade_visual  TEXT UNIQUE NOT NULL CHECK(length(trim(identidade_visual))>0), -- nome da identidade (padrão, natal, ano novo, etc)
  cor_primaria       TEXT NULL, -- ex: "#3B82F6"
  cor_secundaria     TEXT NULL, -- ex: "#3B82F6"
  cor_terciaria      TEXT NULL, -- ex: "#3B82F6"
  url_logo           TEXT NULL, -- logomarca da empresa
  ativa              BOOLEAN NOT NULL DEFAULT FALSE, -- somente 1 configuração ativa por locatário;
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em      TIMESTAMPTZ NOT NULL DEFAULT now()  -- atualizado por trigger
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pk_configuracoes_locatario') THEN
    ALTER TABLE configuracoes_locatario
    ADD CONSTRAINT pk_configuracoes_locatario
    PRIMARY KEY (locatario_id, configuracao_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_configuracoes_locatario_locatarios') THEN
    ALTER TABLE configuracoes_locatario
    ADD CONSTRAINT fk_configuracoes_locatario_locatarios
    FOREIGN KEY (locatario_id)
    REFERENCES locatarios (locatario_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_configuracoes_locatario_ativa
ON configuracoes_locatario(locatario_id)
WHERE ativa = TRUE;



-- ============================================================
-- P3: Sempre 1 configuração ativa por locatário
-- - Inseriu a primeira config do locatário => força ativa=true
-- - Ao ativar uma config => desativa as demais do mesmo locatário
-- - Não permite ficar com 0 ativas (bloqueia desativação da última ativa)
-- ============================================================
CREATE OR REPLACE FUNCTION trg_configuracoes_locatario_p3_ativa_unica()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  has_any boolean;
  has_other_active boolean;
BEGIN
  -- primeira configuração do locatário deve ser ativa
  IF TG_OP = 'INSERT' THEN
    SELECT EXISTS (
      SELECT 1 FROM configuracoes_locatario
      WHERE locatario_id = NEW.locatario_id
    ) INTO has_any;

    IF NOT has_any THEN
      NEW.ativa := TRUE;
    END IF;

    IF NEW.ativa THEN
      UPDATE configuracoes_locatario
      SET ativa = FALSE
      WHERE locatario_id = NEW.locatario_id
        AND configuracao_id IS DISTINCT FROM NEW.configuracao_id;
    END IF;

    RETURN NEW;
  END IF;

  -- update: ativar => desativar as demais; desativar última ativa => bloquear
  IF TG_OP = 'UPDATE' THEN
    IF NEW.ativa AND NOT OLD.ativa THEN
      UPDATE configuracoes_locatario
      SET ativa = FALSE
      WHERE locatario_id = NEW.locatario_id
        AND configuracao_id <> NEW.configuracao_id;
      RETURN NEW;
    END IF;

    IF (NOT NEW.ativa) AND OLD.ativa THEN
      SELECT EXISTS (
        SELECT 1
        FROM configuracoes_locatario
        WHERE locatario_id = NEW.locatario_id
          AND ativa = TRUE
          AND configuracao_id <> NEW.configuracao_id
      ) INTO has_other_active;

      IF NOT has_other_active THEN
        RAISE EXCEPTION 'não é permitido deixar o locatário sem configuração ativa';
      END IF;

      RETURN NEW;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_configuracoes_locatario_p3') THEN
    CREATE TRIGGER tg_configuracoes_locatario_p3
    BEFORE INSERT OR UPDATE ON configuracoes_locatario
    FOR EACH ROW
    EXECUTE FUNCTION trg_configuracoes_locatario_p3_ativa_unica();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tg_configuracoes_locatario_set_atualizado_em') THEN
    CREATE TRIGGER tg_configuracoes_locatario_set_atualizado_em
    BEFORE INSERT OR UPDATE ON configuracoes_locatario
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_atualizado_em();
  END IF;
END;
$$;
