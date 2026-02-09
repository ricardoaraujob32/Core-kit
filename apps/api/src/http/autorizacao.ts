// apps/api/src/http/autorizacao.ts
//
// Finalidade:
// - Centralizar regras de autorização do adaptador HTTP.
// - Fornecer helpers explícitos para uso em rotas (sem acoplamento ao Fastify).
//
// Convenções:
// - Mensagem padrão de falta de permissão: "Permissões insuficientes".
// - `exigirModulo` usa permissão derivada "modulos:<codigo>:usar" por enquanto.
//   (Depois trocamos para checar entitlements de plano/módulo sem alterar rotas.)

import type { AppError, ContextoExecucao, Permissao, Result } from "@core-kit/core";
import { appError, err, ok } from "@core-kit/core";

const MENSAGEM_SEM_PERMISSAO = "Permissões insuficientes";

/**
 * Garante que exista usuário autenticado no contexto.
 * Retorna UNAUTHORIZED se não houver usuarioId.
 */
export function exigirUsuario(contextoExecucao: ContextoExecucao): Result<void, AppError> {
  if (contextoExecucao.usuarioId) return ok(undefined);
  return err(appError("UNAUTHORIZED", "Usuário não autenticado."));
}

/**
 * Garante que o usuário possua uma permissão específica.
 * - Exige usuário (UNAUTHORIZED se não houver).
 * - Retorna FORBIDDEN com mensagem padrão se não tiver a permissão.
 */
export function exigirPermissao(
  contextoExecucao: ContextoExecucao,
  permissao: Permissao,
): Result<void, AppError> {
  const rUsuario = exigirUsuario(contextoExecucao);
  if (!rUsuario.ok) return rUsuario;

  const permissoes = contextoExecucao.permissoes ?? [];
  const possui = permissoes.includes(permissao);

  if (possui) return ok(undefined);

  return err(appError("FORBIDDEN", MENSAGEM_SEM_PERMISSAO, { permissao }));
}

/**
 * Garante que o locatário/usuário tenha acesso a um módulo.
 * Implementação inicial (sem BD):
 * - trata acesso a módulo como permissão derivada: "modulos:<codigoModulo>:usar"
 *
 * Exemplo:
 * - exigirModulo(ctx, "usuarios") -> exige permissão "modulos:usuarios:usar"
 */
export function exigirModulo(
  contextoExecucao: ContextoExecucao,
  codigoModulo: string,
): Result<void, AppError> {
  const codigoNormalizado = codigoModulo.trim().toLowerCase();
  const permissaoModulo = `modulos:${codigoNormalizado}:usar` as Permissao;

  return exigirPermissao(contextoExecucao, permissaoModulo);
}
