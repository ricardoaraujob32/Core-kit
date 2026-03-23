// packages/core/src/erros.ts

/**
 * Catálogo canônico de códigos de erro da aplicação.
 *
 * Este tipo concentra todos os códigos usados pelos pacotes do Core e serve
 * como contrato comum entre domínio, adapters, API HTTP, logs e auditoria.
 *
 * Regras:
 * - cada pacote pode ter códigos específicos do seu domínio;
 * - códigos genéricos continuam existindo para falhas transversais;
 * - mensagens padrão devem permanecer centralizadas neste arquivo;
 * - códigos novos devem ser acrescentados aqui antes de serem usados nos módulos.
 */
export type CodigoErroApp =
  // genéricos / transversais
  | "NAO_AUTORIZADO"
  | "NAO_AUTENTICADO"
  | "INVALIDO"
  | "NAO_ENCONTRADO"
  | "ERRO_INTERNO"
  | "CONFLITO"
  | "SESSAO_INVALIDA"

  // locatários
  | "LOCATARIO_INVALIDO"
  | "LOCATARIO_NAO_ENCONTRADO"
  | "LOCATARIO_SUSPENSO"
  | "LOCATARIO_ENCERRADO"

  // usuários
  | "USUARIO_INVALIDO"
  | "USUARIO_NAO_ENCONTRADO"
  | "USUARIO_INATIVO"
  | "USUARIO_SUSPENSO"
  | "USUARIO_ENCERRADO"
  | "USUARIO_EMAIL_JA_EXISTE"

  // tokens
  | "TOKEN_INVALIDO"
  | "TOKEN_NAO_ENCONTRADO"
  | "TOKEN_REVOGADO"
  | "TOKEN_EXPIRADO"
  | "TOKEN_HASH_JA_EXISTE"
  | "TOKEN_ROTACAO_CONFLITO"

  // auth
  | "AUTH_CREDENCIAIS_INVALIDAS"
  | "AUTH_TOKEN_INVALIDO_OU_EXPIRADO"
  | "AUTH_USUARIO_NAO_PODE_AUTENTICAR"
  | "AUTH_LOCATARIO_NAO_PODE_AUTENTICAR"
  | "AUTH_ENTRADA_INVALIDA"
  | "AUTH_SESSAO_INVALIDA"

  // rbac
  | "RBAC_PERMISSAO_INVALIDA"
  | "RBAC_NAO_AUTENTICADO"
  | "RBAC_NAO_AUTORIZADO"

  // módulos
  | "MODULOS_LOCATARIO_ID_INVALIDO"
  | "MODULOS_CODIGO_INVALIDO"
  | "MODULOS_REPOSITORIO_FALHA"
  | "MODULO_NAO_HABILITADO"

  // auditoria
  | "AUDITORIA_INVALIDA"

  // assinaturas
  | "ASSINATURA_INVALIDA"
  | "ASSINATURA_NAO_ENCONTRADA"
  | "ASSINATURA_ATIVA_JA_EXISTE"
  | "ASSINATURA_TRANSICAO_STATUS_INVALIDA"
  | "PLANO_INVALIDO"
  | "MODULO_INVALIDO"
  | "MODULO_ASSINATURA_JA_VINCULADO"
  | "MODULO_ASSINATURA_NAO_VINCULADO"

  // exportações
  | "EXPORTACAO_INVALIDA"
  | "EXPORTACAO_NAO_ENCONTRADA"
  | "EXPORTACAO_TRANSICAO_STATUS_INVALIDA"

  // importações
  | "IMPORTACAO_INVALIDA"
  | "IMPORTACAO_NAO_ENCONTRADA"
  | "ITEM_IMPORTACAO_NAO_ENCONTRADO"
  | "IMPORTACAO_TRANSICAO_STATUS_INVALIDA"

  // backups
  | "BACKUP_INVALIDO"
  | "BACKUP_NAO_ENCONTRADO"
  | "BACKUP_NAO_PERTENCE_AO_LOCATARIO"
  | "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO"
  | "BACKUP_EM_ABERTO_JA_EXISTE"
  | "RESTAURACAO_EM_ABERTO_JA_EXISTE";

/**
 * Resolve a mensagem padrão associada a um código de erro.
 *
 * Esta função garante consistência textual entre backend, logs, auditoria
 * e borda HTTP, evitando mensagens divergentes espalhadas por vários módulos.
 *
 * @param codigo Código canônico do erro.
 * @returns Mensagem padrão associada ao código informado.
 */
export function mapCodigoErroToMensagemErro(codigo: CodigoErroApp): string {
  switch (codigo) {
    case "NAO_AUTENTICADO":
      return "Usuário não autenticado.";
    case "NAO_AUTORIZADO":
      return "Permissões insuficientes.";
    case "INVALIDO":
      return "Validação transversal inválida.";
    case "NAO_ENCONTRADO":
      return "Recurso não encontrado.";
    case "CONFLITO":
      return "Conflito de dados.";
    case "ERRO_INTERNO":
      return "Erro interno.";
    case "SESSAO_INVALIDA":
      return "Sessão inválida.";

    case "LOCATARIO_INVALIDO":
      return "Dados do locatário são inválidos.";
    case "LOCATARIO_NAO_ENCONTRADO":
      return "Locatário não encontrado.";
    case "LOCATARIO_SUSPENSO":
      return "Locatário suspenso.";
    case "LOCATARIO_ENCERRADO":
      return "Locatário encerrado.";

    case "USUARIO_INVALIDO":
      return "Dados do usuário inválidos.";
    case "USUARIO_NAO_ENCONTRADO":
      return "Usuário não encontrado.";
    case "USUARIO_INATIVO":
      return "Usuário inativo.";
    case "USUARIO_SUSPENSO":
      return "Usuário suspenso.";
    case "USUARIO_ENCERRADO":
      return "Usuário encerrado.";
    case "USUARIO_EMAIL_JA_EXISTE":
      return "Já existe usuário com este e-mail no escopo informado.";

    case "TOKEN_INVALIDO":
      return "Dados do token inválidos.";
    case "TOKEN_NAO_ENCONTRADO":
      return "Token não encontrado.";
    case "TOKEN_REVOGADO":
      return "Token revogado.";
    case "TOKEN_EXPIRADO":
      return "Token expirado.";
    case "TOKEN_HASH_JA_EXISTE":
      return "Já existe token com este hash.";
    case "TOKEN_ROTACAO_CONFLITO":
      return "Conflito na rotação do token.";

    case "AUTH_CREDENCIAIS_INVALIDAS":
      return "Credenciais inválidas.";
    case "AUTH_TOKEN_INVALIDO_OU_EXPIRADO":
      return "Token inválido ou expirado.";
    case "AUTH_USUARIO_NAO_PODE_AUTENTICAR":
      return "Usuário não pode autenticar.";
    case "AUTH_LOCATARIO_NAO_PODE_AUTENTICAR":
      return "Locatário não pode autenticar.";
    case "AUTH_ENTRADA_INVALIDA":
      return "Entrada inválida para autenticação.";
    case "AUTH_SESSAO_INVALIDA":
      return "Sessão inválida de autenticação.";

    case "RBAC_PERMISSAO_INVALIDA":
      return "Permissão inválida.";
    case "RBAC_NAO_AUTENTICADO":
      return "Usuário não autenticado para resolução de autorização.";
    case "RBAC_NAO_AUTORIZADO":
      return "Usuário não possui a permissão necessária.";

    case "MODULOS_LOCATARIO_ID_INVALIDO":
      return "Identificador de locatário inválido para consulta de módulos.";
    case "MODULOS_CODIGO_INVALIDO":
      return "Código do módulo inválido.";
    case "MODULOS_REPOSITORIO_FALHA":
      return "Falha ao consultar módulos habilitados.";
    case "MODULO_NAO_HABILITADO":
      return "Módulo não habilitado para o locatário.";

    case "AUDITORIA_INVALIDA":
      return "Dados de auditoria são inválidos.";

    case "ASSINATURA_INVALIDA":
      return "Dados da assinatura são inválidos.";
    case "ASSINATURA_NAO_ENCONTRADA":
      return "Assinatura não encontrada.";
    case "ASSINATURA_ATIVA_JA_EXISTE":
      return "Já existe uma assinatura ativa para este locatário.";
    case "ASSINATURA_TRANSICAO_STATUS_INVALIDA":
      return "A transição de status da assinatura é inválida.";
    case "PLANO_INVALIDO":
      return "Plano inválido ou inativo.";
    case "MODULO_INVALIDO":
      return "Módulo inválido ou inativo.";
    case "MODULO_ASSINATURA_JA_VINCULADO":
      return "O módulo já está vinculado à assinatura.";
    case "MODULO_ASSINATURA_NAO_VINCULADO":
      return "O módulo não está vinculado à assinatura.";

    case "EXPORTACAO_INVALIDA":
      return "Dados da exportação são inválidos.";
    case "EXPORTACAO_NAO_ENCONTRADA":
      return "Exportação não encontrada.";
    case "EXPORTACAO_TRANSICAO_STATUS_INVALIDA":
      return "A transição de status da exportação é inválida.";

    case "IMPORTACAO_INVALIDA":
      return "Dados da importação são inválidos.";
    case "IMPORTACAO_NAO_ENCONTRADA":
      return "Importação não encontrada.";
    case "ITEM_IMPORTACAO_NAO_ENCONTRADO":
      return "Item de importação não encontrado.";
    case "IMPORTACAO_TRANSICAO_STATUS_INVALIDA":
      return "A transição de status da importação é inválida.";

    case "BACKUP_INVALIDO":
      return "Dados de backup ou restauração são inválidos.";
    case "BACKUP_NAO_ENCONTRADO":
      return "Backup não encontrado.";
    case "BACKUP_NAO_PERTENCE_AO_LOCATARIO":
      return "O backup informado não pertence ao locatário.";
    case "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO":
      return "O backup não está disponível para restauração.";
    case "BACKUP_EM_ABERTO_JA_EXISTE":
      return "Já existe um backup em aberto para este locatário.";
    case "RESTAURACAO_EM_ABERTO_JA_EXISTE":
      return "Já existe uma restauração em aberto para este locatário.";

    default:
      return "Erro desconhecido.";
  }
}

/**
 * Erro de domínio da aplicação.
 * - NÃO depende de HTTP
 * - NÃO lança exceção
 * - É dado puro (serializável)
 */
export interface ErroApp {
  codigo: CodigoErroApp;
  mensagem: string;
  detalhes?: Record<string, unknown>;
  causa?: unknown;
}

/**
 * Construtor padrão de erros. Use o wrapper padrão para garantir argumentos validados.
 * @param codigo codigo de erro padronizado.
 * @param mensagem se não fornecida, vai exibir mensagem padronizada a partir do código.
 * @param detalhes Detalhes estruturados para cliente/logs. Deve ser JSON-safe.
 * @param causa Causa original do erro (ex: exceção capturada). Nunca deve ser enviada diretamente ao cliente.
 * @returns um erro padronizado para ser usado em API ROP.
 */
export function erroApp(codigo: CodigoErroApp, mensagem: string, detalhes?: Record<string, unknown>, causa?: unknown,): ErroApp {
  return {codigo: codigo, mensagem: mensagem, detalhes: detalhes, causa: causa,};
}

/**
 * Type guard utilitário.
 * @param value o valor
 * @returns true se for ErroApp; do contrário, false
 */
export function isErroApp(value: unknown): value is ErroApp {
  if (!value || typeof value !== "object") return false;

  const v = value as Partial<ErroApp>;

  return typeof v.codigo === "string" && typeof v.mensagem === "string";
}
