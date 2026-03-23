// packages/core/src/usuarios/validadores.ts

import { validarEmail, validarIdGenerico, validarTextoObrigatorio, type ErroApp, type Result } from "../kernel";
import { usuarioInvalido } from "./erros";
import { UsuarioId } from "./tipos";

/**
 * Converte erro genérico de validação transversal em erro específico do
 * domínio de usuários.
 *
 * @param resultado Resultado bruto vindo do kernel.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor original rejeitado.
 * @returns Resultado validado ou erro específico do pacote `usuarios`.
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return usuarioInvalido({ campo, valor });
}

/**
 * Valida o identificador lógico de usuário.
 *
 * @param usuarioId Identificador textual do usuário.
 * @returns `Ok(string)` com ID validado ou erro específico do módulo.
 */
export function validarUsuarioId(usuarioId: UsuarioId): Result<string, ErroApp> {
  return mapearErro( validarIdGenerico(usuarioId, "usuarioId"), "usuarioId", usuarioId );
}

/**
 * Valida o nome de exibição do usuário.
 *
 * Regras atuais:
 * - deve ser texto;
 * - deve possuir ao menos 2 caracteres úteis após `trim`.
 *
 * @param nome Nome informado para o usuário.
 * @returns `Ok(string)` com nome normalizado ou erro específico do módulo.
 */
export function validarNomeUsuario(nome: string): Result<string, ErroApp> {
  return mapearErro( validarTextoObrigatorio(nome, "nome", 2), "nome", nome );
}

/**
 * Valida e normaliza o e-mail do usuário.
 *
 * @param email E-mail informado para cadastro ou atualização.
 * @returns `Ok(string)` com e-mail normalizado ou erro específico do módulo.
 */
export function validarEmailUsuario(email: string): Result<string, ErroApp> {
  return mapearErro( validarEmail(email, "email"), "email", email );
}

/**
 * Valida o hash de senha persistido.
 *
 * Esta validação não avalia a força da senha em texto puro; ela apenas garante
 * que o hash já produzido tenha comprimento mínimo esperado pelo domínio.
 *
 * @param senhaHash Hash de senha a validar.
 * @returns `Ok(string)` com hash aceito ou erro específico do módulo.
 */
export function validarSenhaHash(senhaHash: string): Result<string, ErroApp> {
  return mapearErro( validarTextoObrigatorio(senhaHash, "senhaHash", 20), "senhaHash", senhaHash );
}
