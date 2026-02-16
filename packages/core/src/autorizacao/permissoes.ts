/**
 * Permissões oficiais do sistema.
 *
 * Regra de ouro:
 * - Backend, Core e Frontend compartilham ESTE contrato.
 * - Nunca usar strings mágicas fora daqui.
 * - Mudanças aqui são mudanças de domínio.
 */

export type Permissao =
  // Locatário
  | "LOCATARIO_LER"
  | "LOCATARIO_ESCREVER"

  // Usuários
  | "USUARIOS_LER"
  | "USUARIOS_CRIAR"
  | "USUARIOS_EDITAR"
  | "USUARIOS_REMOVER"

  // Auditoria
  | "AUDITORIA_LER"

  // Importação / Exportação
  | "IMPORTACAO_EXECUTAR"
  | "EXPORTACAO_EXECUTAR"

  // Estoque
  | "ESTOQUE_LER"
  | "ESTOQUE_ESCREVER";
