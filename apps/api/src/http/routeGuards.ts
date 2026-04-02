// apps/api/src/http/routeGuards.ts

import type { ContextoExecucao, ErroApp } from "@core-kit/core";
import { exigirUsuario } from "@core-kit/core";

/**
 * Exige que o contexto atual represente uma requisição autenticada.
 *
 * Responsabilidades:
 * - delegar ao Core a validação de autenticação;
 * - devolver o erro padronizado do próprio Core quando não houver usuário.
 *
 * Observação:
 * - esta função não cria tipos próprios de resultado;
 * - ela reutiliza diretamente o contrato `Result/ErroApp` já existente no Core.
 *
 * @param ctx Contexto atual da requisição.
 * @returns Resultado do Core indicando se há usuário autenticado.
 */
export function exigirAutenticacaoHttp(ctx: ContextoExecucao) {
  return exigirUsuario(ctx);
}

/**
 * Verifica se o contexto atual representa o fluxo superadmin provisório
 * adotado pela borda HTTP.
 *
 * Regra atual centralizada:
 * - `locatarioId === "plataforma"`
 * - ou presença do papel `SUPERADMIN`
 *
 * Observação:
 * - esta regra ainda é transitória;
 * - a meta futura continua sendo substituir essa heurística por autorização
 *   explícita baseada no contrato canônico do Core;
 * - enquanto isso, a regra deve existir em um único ponto.
 *
 * @param ctx Contexto atual da requisição.
 * @returns `true` quando o contexto representa o fluxo superadmin provisório.
 */
export function isFluxoSuperAdminProvisorio(ctx: Pick<ContextoExecucao, "locatarioId" | "papeis">): boolean {
  if (ctx.locatarioId === "plataforma") {
    return true;
  }

  if (Array.isArray(ctx.papeis) && ctx.papeis.includes("SUPERADMIN" as never)) {
    return true;
  }

  return false;
}

/**
 * Exige autorização de superadmin na borda HTTP.
 *
 * Responsabilidades:
 * - centralizar a regra provisória atual de superadmin;
 * - devolver `null` quando autorizado;
 * - devolver `ErroApp` padronizado quando não autorizado.
 *
 * Observação:
 * - este helper não recria tipos semelhantes a `Result`;
 * - ele devolve diretamente `ErroApp | null`, simplificando a borda;
 * - quando a permissão canônica de superadmin estiver consolidada no Core,
 *   a troca deve acontecer aqui, preservando controllers e middlewares.
 *
 * @param ctx Contexto atual da requisição.
 * @returns `null` quando autorizado; `ErroApp` quando não autorizado.
 */
export function exigirSuperAdminHttp(ctx: Pick<ContextoExecucao, "locatarioId" | "papeis">): ErroApp | null {
  if (isFluxoSuperAdminProvisorio(ctx)) {
    return null;
  }

  return {
    codigo: "NAO_AUTORIZADO",
    mensagem: "A operação é restrita ao fluxo superadmin.",
    detalhes: {
      operacao: "http.autorizacao.superadmin",
    },
  };
}

/**
 * Exige que o locatário solicitado seja o mesmo do contexto autenticado.
 *
 * Responsabilidades:
 * - proteger fluxos em que o usuário só pode operar no próprio locatário;
 * - devolver `null` quando a regra for satisfeita;
 * - devolver `ErroApp` padronizado quando houver violação.
 *
 * @param ctx Contexto atual da requisição.
 * @param locatarioIdSolicitado Locatário alvo da operação.
 * @returns `null` quando autorizado; `ErroApp` quando houver violação.
 */
export function exigirMesmoLocatarioHttp(ctx: Pick<ContextoExecucao, "locatarioId">, locatarioIdSolicitado: string): ErroApp | null {
  if (ctx.locatarioId === locatarioIdSolicitado) {
    return null;
  }

  return {
    codigo: "NAO_AUTORIZADO",
    mensagem: "A operação é permitida apenas no próprio locatário.",
    detalhes: {
      operacao: "http.autorizacao.mesmoLocatario",
      locatarioIdContexto: ctx.locatarioId,
      locatarioIdSolicitado,
    },
  };
}
