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
  | "ESTOQUE_ESCREVER"

  // Clientes
  | "CLIENTES_CRIAR"
  | "CLIENTES_LISTAR"
  | "CLIENTES_ATUALIZAR"
  | "CLIENTES_EXCLUIR"

  // Fornecedores
  | "FORNECEDORES_CRIAR"
  | "FORNECEDORES_LISTAR"
  | "FORNECEDORES_ATUALIZAR"
  | "FORNECEDORES_EXCLUIR"

  // Sessões
  | "SESSAO_CRIAR"
  | "SESSAO_RENOVAR"
  | "SESSAO_REVOGAR"
  | "SESSAO_LISTAR";