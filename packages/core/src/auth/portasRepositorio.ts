// packages/core/src/auth/portasRepositorio.ts

import { ContextoExecucao, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ResolverPermissoesOutput } from "../rbac";
import { UsuarioId } from "../usuarios";

/**
 * Projeção mínima de usuário usada pelos fluxos de autenticação.
 *
 * Este tipo representa apenas os campos necessários para login,
 * validação de credenciais e materialização de sessão.
 */
export type UsuarioAuth = {
  /** Identificador do usuário autenticado. */
  usuarioId: UsuarioId;
  /** Locatário do usuário; `null` representa escopo de plataforma. */
  locatarioId: LocatarioId | null; // NULL = plataforma (superadmin)
  /** E-mail de autenticação do usuário. */
  email: string;
  /** Hash da senha persistida. */
  senhaHash: string;
  /** Estado atual do usuário para fins de autenticação. */
  status: "ATIVO" | "INATIVO" | "BLOQUEADO"; // conforme enum do BD
};

/**
 * Porta de consulta e atualização de usuários para o fluxo de autenticação.
 *
 * Observação:
 * o arquivo atual contém esta interface mais de uma vez. A duplicação deve ser
 * consolidada futuramente, mas sem alterar a estrutura agora.
 */
export interface UsuariosRepositorioAuth {
  /**
   * Busca usuário por e-mail no escopo do locatário.
   *
   * @param params Locatário e e-mail consultado.
   * @returns `Ok(usuario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorEmail(params: { locatarioId: LocatarioId; email: string }): Promise<Result<UsuarioAuth | null, ErroApp>>;

  /**
   * Atualiza o instante do último login do usuário.
   *
   * @param params Usuário autenticado e instante do login.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date }): Promise<Result<void, ErroApp>>;
}

/**
 * Porta de leitura de RBAC usada especificamente pelo fluxo de autenticação.
 *
 * Esta interface representa uma dependência de leitura simples de papéis e
 * permissões, sem acoplar `auth` à implementação concreta do módulo de RBAC.
 */
export interface RbacRepositorio {
  /**
   * Lista papéis do usuário no locatário.
   *
   * @param params Usuário e locatário consultado.
   * @returns `Ok` com os papéis encontrados.
   */
  listarPapeisDoUsuario(params: { usuarioId: UsuarioId; locatarioId: LocatarioId }): Promise<Result<string[], ErroApp>>;

  /**
   * Lista permissões do usuário no locatário.
   *
   * @param params Usuário e locatário consultado.
   * @returns `Ok` com as permissões encontradas.
   */
  listarPermissoesDoUsuario(params: { usuarioId: UsuarioId; locatarioId: LocatarioId }): Promise<Result<string[], ErroApp>>;
}

/**
 * Porta de serviço criptográfico usada por `auth`.
 *
 * Esta interface abstrai comparação de senha, hashing de token e geração de
 * token seguro sem expor implementação criptográfica ao domínio.
 */
export interface CriptoPorta {
  /**
   * Compara a senha informada com o hash persistido.
   *
   * @param senha Senha em texto puro.
   * @param senhaHash Hash persistido.
   * @returns `Ok(true/false)` conforme o resultado da comparação.
   */
  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;

  /**
   * Gera o hash persistível de um token bruto.
   *
   * @param tokenBruto Valor bruto do token.
   * @returns `Ok(hash)` quando a operação é bem-sucedida.
   */
  hashToken(tokenBruto: string): Promise<Result<string, ErroApp>>;

  /**
   * Gera um token bruto seguro para uso em refresh/session flows.
   *
   * @returns `Ok(tokenBruto)` quando a geração é bem-sucedida.
   */
  gerarTokenSeguro(): Promise<Result<string, ErroApp>>; // para refresh bruto
}

/**
 * Porta de emissão e validação de access token.
 *
 * Esta interface abstrai JWT ou qualquer outra tecnologia equivalente
 * usada para serializar a sessão autenticada.
 */
export interface JwtPorta {
  /**
   * Emite um novo access token.
   *
   * @param params Dados necessários para materializar a sessão.
   * @returns `Ok` com token emitido e expiração.
   */
  emitirAccessToken(params: { usuarioId: UsuarioId; locatarioId: LocatarioId; ttlSegundos: number }): Promise<Result<{ token: string; expiraEm: Date }, ErroApp>>;

  /**
   * Valida um access token e devolve sua projeção de payload.
   *
   * @param token Token recebido para validação.
   * @returns `Ok(payload)` quando o token é válido.
   */
  validarAccessToken(token: string): Promise<Result<{ usuarioId: UsuarioId; locatarioId: LocatarioId; expiraEm: Date }, ErroApp>>;
}

/**
 * Porta de consulta de usuário para autenticação.
 *
 * Observação:
 * esta interface aparece duplicada no arquivo atual com forma semelhante
 * à anterior e deve ser consolidada futuramente.
 */
export interface UsuariosRepositorioAuth {
  /**
   * Busca usuário por e-mail no escopo do locatário.
   *
   * @param params Locatário e e-mail consultado.
   * @returns `Ok(usuario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorEmail(params: { locatarioId: LocatarioId; email: string }): Promise<Result<{
    usuarioId: UsuarioId;
    locatarioId: LocatarioId | null;
    email: string;
    senhaHash: string;
    status: "ATIVO" | "INATIVO" | "BLOQUEADO";
  } | null, ErroApp>>;

  /**
   * Atualiza o instante do último login.
   *
   * @param params Escopo do locatário, usuário e instante do login.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  atualizarUltimoLogin(params: { locatarioId: LocatarioId; usuarioId: UsuarioId; quando: Date }): Promise<Result<void, ErroApp>>;
}

/**
 * Porta de consulta de locatários usada no fluxo de autenticação.
 *
 * Permite verificar existência e status do locatário antes da emissão da sessão.
 */
export interface LocatariosRepositorioAuth {
  /**
   * Busca locatário por identificador.
   *
   * @param params Identificador do locatário.
   * @returns `Ok(locatario | null)` quando a consulta é bem-sucedida.
   */
  buscarPorId(params: { locatarioId: LocatarioId }): Promise<Result<{ locatarioId: LocatarioId; status: "ATIVO" | "SUSPENSO" | "ENCERRADO" } | null, ErroApp>>;
}

/**
 * Porta de serviço de RBAC usada por `auth`.
 *
 * Diferentemente da porta repositório, aqui `auth` depende de uma operação
 * de mais alto nível: resolução de permissões sobre um contexto de execução.
 */
export interface RbacServicePorta {
  /**
   * Resolve papéis e permissões a partir do contexto informado.
   *
   * @param ctx Contexto autenticado/parcial da operação.
   * @returns `Ok` com o resultado da resolução de autorização.
   */
  resolverPermissoes(ctx: ContextoExecucao): Promise<Result<ResolverPermissoesOutput, ErroApp>>;
}

/**
 * Porta de comparação de senha usada por `auth`.
 *
 * Esta interface é uma especialização mais restrita da dependência criptográfica.
 */
export interface CriptoAuthPorta {
  /**
   * Compara senha em texto puro com hash persistido.
   *
   * @param senha Senha recebida.
   * @param senhaHash Hash persistido.
   * @returns `Ok(true/false)` conforme o resultado da comparação.
   */
  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
}

/**
 * Porta de emissão e validação de access token.
 *
 * Observação:
 * esta interface também aparece duplicada no arquivo atual.
 */
export interface JwtPorta {
  /**
   * Emite um novo access token.
   *
   * @param params Usuário, locatário e TTL do token.
   * @returns `Ok` com token emitido e expiração.
   */
  emitirAccessToken(params: { usuarioId: UsuarioId; locatarioId: LocatarioId; ttlSegundos: number })
    : Promise<Result<{ token: string; expiraEm: Date }, ErroApp>>;

  /**
   * Valida um access token recebido.
   *
   * @param token Token recebido para validação.
   * @returns `Ok(payload)` quando o token é válido.
   */
  validarAccessToken(token: string)
    : Promise<Result<{ usuarioId: UsuarioId; locatarioId: LocatarioId; expiraEm: Date }, ErroApp>>;
}

/**
 * Porta opcional para registro de eventos de segurança.
 *
 * Esta dependência não representa persistência principal do domínio de `auth`,
 * mas sim emissão de rastro operacional e auditoria de segurança.
 */
export interface EventosSegurancaPorta {
  /**
   * Registra um evento relevante de segurança/autenticação.
   *
   * @param params Tipo do evento, contexto envolvido e instante da ocorrência.
   * @returns `Promise<void>` porque o registro pode ser best-effort.
   */
  registrarEvento?(params: {
    tipo:
      | "auth.login.sucesso"
      | "auth.login.falha"
      | "auth.refresh"
      | "auth.logout";
    usuarioId?: UsuarioId | null;
    locatarioId?: LocatarioId | null;
    detalhes?: Record<string, unknown>;
    quando: Date;
  }): Promise<void>;
}
