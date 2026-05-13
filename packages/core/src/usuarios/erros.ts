// packages/core/src/usuarios/erros.ts

import { LocatarioId } from "../locatarios";
import { createErroApp } from "../kernel";
import { UsuarioId } from "./tipos";

/**
 * 
 */
export type CodigoErroUsuario =
  "USUARIO_INVALIDO" |
  "USUARIO_NAO_ENCONTRADO" |
  "USUARIO_INATIVO" |
  "USUARIO_SUSPENSO" |
  "USUARIO_ENCERRADO" |
  "USUARIO_EMAIL_JA_EXISTE" |
  "SENHA_INVALIDA";

/**
 * Cria erro para entradas inválidas do domínio de usuários.
 *
 * Use este helper para validar payloads, filtros e comandos relacionados a
 * cadastro, atualização, ativação ou consulta de usuários.
 *
 * @param detalhes Metadados estruturados sobre a invalidez encontrada.
 * @returns `Err(ErroApp)` com código específico do módulo.
 */
export function usuarioInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({ codigo: "USUARIO_INVALIDO", mensagem: "Dados do usuário inválidos.", detalhes });
}

/**
 * Cria erro quando o usuário solicitado não existe.
 *
 * @param usuarioId Identificador do usuário não encontrado.
 * @returns `Err(ErroApp)` tipado para ausência de usuário.
 */
export function usuarioNaoEncontrado(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_NAO_ENCONTRADO", mensagem: "Usuário não encontrado.", detalhes: { usuarioId } });
}

/**
 * Cria erro para usuário inativo.
 *
 * @param usuarioId Identificador do usuário inativo.
 * @returns `Err(ErroApp)` com o estado incompatível da conta.
 */
export function usuarioInativo(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_INATIVO", mensagem: "Usuário inativo.", detalhes: { usuarioId } });
}

/**
 * Cria erro para usuário suspenso.
 *
 * @param usuarioId Identificador do usuário suspenso.
 * @returns `Err(ErroApp)` com contexto sobre o usuário bloqueado.
 */
export function usuarioSuspenso(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_SUSPENSO", mensagem: "Usuário suspenso.", detalhes: { usuarioId } });
}

/**
 * Cria erro para usuário encerrado.
 *
 * @param usuarioId Identificador do usuário encerrado.
 * @returns `Err(ErroApp)` com contexto sobre o usuário encerrado.
 */
export function usuarioEncerrado(usuarioId: UsuarioId) {
  return createErroApp({ codigo: "USUARIO_ENCERRADO", mensagem: "Usuário encerrado.", detalhes: { usuarioId } });
}

/**
 * Cria erro de conflito para e-mail já existente no escopo informado.
 *
 * O escopo pode ser um locatário específico ou outro domínio previsto pela
 * regra de unicidade adotada pela aplicação.
 *
 * @param email E-mail cuja unicidade foi violada.
 * @param locatarioId Locatário no qual o conflito foi detectado, quando aplicável.
 * @returns `Err(ErroApp)` de conflito de cadastro.
 */
export function emailUsuarioJaExiste(email: string, locatarioId: LocatarioId | null) {
  return createErroApp({ codigo: "USUARIO_EMAIL_JA_EXISTE", mensagem: "Já existe usuário com este e-mail no escopo informado.", detalhes: { email, locatarioId } });
}

/**
 * 
 * @param usuarioId 
 * @returns 
 */
export function senhaAtualInvalida(usuarioId: UsuarioId) {
  return createErroApp({
    codigo: "SENHA_INVALIDA",
    mensagem: "Senha atual inválida.",
    detalhes: { usuarioId },
  });
}
