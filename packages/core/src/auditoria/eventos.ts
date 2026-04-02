// packages/core/src/auditoria/eventos.ts

/**
 * Destino lógico de publicação do evento de auditoria.
 */
export type DestinoAuditoria = "PLATAFORMA" | "LOCATARIO" | "AMBAS";

/**
 * Categoria canônica do evento auditado.
 */
export type CategoriaAuditoria =
  | "OPERACAO"
  | "SEGURANCA"
  | "ERRO"
  | "COMPLIANCE";

/**
 * Definição canônica de um evento de auditoria.
 *
 * Esta estrutura é a fonte de verdade para:
 * - categoria do evento;
 * - destino de publicação;
 * - exigência de `locatarioAlvoId`.
 */
export type EventoAuditoriaDef = {
  /**
   * Nome estável do evento.
   */
  evento: string;

  /**
   * Categoria semântica do evento.
   */
  categoria: CategoriaAuditoria;

  /**
   * Destino de publicação.
   */
  destino: DestinoAuditoria;

  /**
   * Indica se o evento exige `locatarioAlvoId`.
   *
   * Casos típicos:
   * - impersonação;
   * - operação de plataforma que afeta um locatário específico.
   */
  exigeLocatarioAlvo?: boolean;
};

/**
 * Matriz canônica de eventos do sistema.
 *
 * Observação:
 * - novos eventos só devem ser usados após inclusão aqui;
 * - isso evita “strings mágicas” e destinos implícitos.
 */
export const EVENTOS_AUDITORIA: EventoAuditoriaDef[] = [
  // =========================
  // USUÁRIOS
  // =========================
  { evento: "usuario.listado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.obtido", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.criado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.atualizado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.inativado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.reativado", categoria: "OPERACAO", destino: "LOCATARIO" },

  {
    evento: "plataforma.usuario.acao_impersonada",
    categoria: "OPERACAO",
    destino: "AMBAS",
    exigeLocatarioAlvo: true,
  },

  // =========================
  // LOCATÁRIOS
  // =========================
  { evento: "locatario.obtido", categoria: "OPERACAO", destino: "LOCATARIO" },

  {
    evento: "plataforma.locatario.listado",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.locatario.obtido",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.locatario.criado",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },
  {
    evento: "plataforma.locatario.atualizado",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },
  {
    evento: "plataforma.locatario.suspenso",
    categoria: "COMPLIANCE",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },

  // =========================
  // AUTH / SEGURANÇA
  // =========================
  {
    evento: "auth.login.sucesso",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "auth.login.falha",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },
  {
    evento: "auth.sessao.revogada",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "plataforma.auth.sessao.revogada",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.impersonacao.iniciada",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },
  {
    evento: "plataforma.impersonacao.encerrada",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },

  // =========================
  // RBAC
  // =========================
  {
    evento: "rbac.papel.criado",
    categoria: "OPERACAO",
    destino: "LOCATARIO",
  },
  {
    evento: "rbac.papel.atualizado",
    categoria: "OPERACAO",
    destino: "LOCATARIO",
  },
  {
    evento: "rbac.permissao.atribuida",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "rbac.permissao.removida",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "rbac.usuario.papeis_atualizados",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "plataforma.rbac.intervencao",
    categoria: "COMPLIANCE",
    destino: "PLATAFORMA",
  },

  // =========================
  // AUDITORIA
  // =========================
  {
    evento: "auditoria.locatario.listada",
    categoria: "OPERACAO",
    destino: "LOCATARIO",
  },
  {
    evento: "auditoria.plataforma.listada",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
  },
];
