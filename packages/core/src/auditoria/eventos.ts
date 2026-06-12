// packages/core/src/auditoria/eventos.ts

import { CategoriaAuditoria } from "./tipos";

export type DestinoAuditoria = "LOCATARIO" | "PLATAFORMA";

export type EventoAuditoriaDef = {
  evento: string;
  categoria: CategoriaAuditoria;
  destino: DestinoAuditoria;
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

  // {
  //   evento: "plataforma.usuario.acao_impersonada",
  //   categoria: "OPERACAO",
  //   destino: "AMBAS",
  //   exigeLocatarioAlvo: true,
  // },

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

  // Auth de locatário
  {
    evento: "auth.login.sucesso",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "auth.login.falha",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "auth.refresh",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "auth.logout",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "auth.sessao.revogada",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },

  // Auth de plataforma
  {
    evento: "plataforma.auth.login.sucesso",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.auth.login.falha",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.auth.refresh",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.auth.logout",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.auth.sessao.revogada",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },

  // Impersonação
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

    // =========================
  // CLIENTES
  // =========================
  { evento: "cliente.listado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "cliente.obtido", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "cliente.criado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "cliente.atualizado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "cliente.excluido", categoria: "OPERACAO", destino: "LOCATARIO" },

  // =========================
  // FORNECEDORES
  // =========================
  { evento: "fornecedor.listado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "fornecedor.obtido", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "fornecedor.criado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "fornecedor.atualizado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "fornecedor.excluido", categoria: "OPERACAO", destino: "LOCATARIO" },

  // =========================
  // PRODUTOS
  // =========================
  { evento: "produto.listado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "produto.obtido", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "produto.criado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "produto.atualizado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "produto.excluido", categoria: "OPERACAO", destino: "LOCATARIO" },

  // =========================
  // TRANSAÇÕES COMERCIAIS
  // =========================
  { evento: "transacao.listada", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.obtida", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.venda.criada", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.compra.criada", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.item_adicionado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.item_atualizado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.item_removido", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.confirmada", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "transacao.cancelada", categoria: "OPERACAO", destino: "LOCATARIO" },
];
