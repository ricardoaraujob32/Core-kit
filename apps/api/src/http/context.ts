// apps/api/src/http/context.ts

import type { FastifyRequest } from "fastify";
import { createContextoExecucao, createErroApp, wrapOk } from "@core-kit/core";
import type { ContextoExecucao, ErroApp, Result } from "@core-kit/core";
import { getAuthorizationBootstrap } from "../bootstrap/authorizationBootstrap";

/**
 * Tipo da função oficial de resolução de contexto autorizado.
 *
 * Observação:
 * - o runtime concreto é fornecido pelo bootstrap da aplicação;
 * - esta tipagem existe apenas para manter a factory testável.
 */
type ResolverContextoAutorizadoFn = ReturnType<typeof getAuthorizationBootstrap>["runtime"]["resolverContextoAutorizado"];

/**
 * Dependências opcionais do builder de contexto HTTP.
 *
 * Uso atual:
 * - resolver RBAC/contexto autorizado a partir da sessão já validada;
 * - opcionalmente enriquecer o contexto com módulos habilitados.
 */
type BuildContextDeps = {
  /**
   * Função responsável por transformar contexto base em contexto autorizado.
   */
  resolverContextoAutorizado: ResolverContextoAutorizadoFn;
}

/**
 * Builder oficial de contexto HTTP da aplicação.
 *
 * Observação:
 * - a composição oficial vem do bootstrap já inicializado no startup;
 * - este arquivo não recompõe runtime localmente.
 */
export const buildContextFromRequest = createFnBuildContextFromRequest({
  get resolverContextoAutorizado() {
    return getAuthorizationBootstrap().runtime.resolverContextoAutorizado;
  },
});

/**
 * Extrai o usuário autenticado previamente anexado ao request.
 *
 * Observação:
 * - este arquivo assume que `authGuard` já foi executado;
 * - se `request.usuario` não existir, a requisição ainda não foi autenticada.
 *
 * @param req Requisição Fastify.
 * @returns Usuário autenticado ou `null`.
 */
function extrairUsuarioAutenticado(req: FastifyRequest) {
  return req.usuario ?? null;
}

/**
 * Cria o `ContextoExecucao` base a partir do usuário autenticado.
 *
 * Responsabilidades:
 * - validar que existe `locatarioId`;
 * - copiar papeis/permissões já presentes no request;
 * - construir o contexto imutável do Core.
 *
 * @param usuario Usuário autenticado anexado ao request.
 * @returns `Ok(ContextoExecucao)` ou `Err(ErroApp)` em caso de falha.
 */
function criarCtxBase(usuario: NonNullable<FastifyRequest["usuario"]>): Result<ContextoExecucao, ErroApp> {
  if (!usuario.locatarioId) {
    return createErroApp({
      codigo: "LOCATARIO_OBRIGATORIO",
      mensagem: "Locatário ausente no contexto autenticado.",
      detalhes: {
        operacao: "http.contexto.criarBase",
      },
    });
  }

  try {
    return wrapOk(
      createContextoExecucao({
        locatarioId: usuario.locatarioId,
        usuarioId: usuario.usuarioId,
        papeis: usuario.papeis ? [...usuario.papeis] : undefined,
        permissoes: usuario.permissoes ? [...usuario.permissoes] : undefined,
      }),
    );
  } catch (causa) {
    return createErroApp({
      codigo: "ERRO_INTERNO",
      mensagem: "Falha ao criar contexto base.",
      detalhes: {
        operacao: "http.contexto.criarBase",
        usuarioId: usuario.usuarioId,
        locatarioId: usuario.locatarioId,
      },
      causa,
    });
  }
}

/**
 * Cria a função responsável por montar o `ContextoExecucao`
 * a partir de uma requisição HTTP autenticada.
 *
 * Fluxo:
 * 1. extrai `request.usuario`;
 * 2. cria contexto base;
 * 3. resolve autorização via Core (`resolverContextoAutorizado`);
 * 4. opcionalmente anexa módulos habilitados;
 * 5. devolve `Result<ContextoExecucao, ErroApp>`.
 *
 * @param deps Dependências opcionais de enriquecimento do contexto.
 * @returns Função `buildContextFromRequest`.
 */
export function createFnBuildContextFromRequest(deps: BuildContextDeps) {
  /**
   * Constrói o contexto final do Core a partir do request autenticado.
   *
   * @param req Requisição Fastify já autenticada.
   * @returns `Ok(ContextoExecucao)` ou `Err(ErroApp)`.
   */
  return async function buildContextFromRequest(req: FastifyRequest): Promise<Result<ContextoExecucao, ErroApp>> {
    const usuario = extrairUsuarioAutenticado(req);

    if (!usuario) {
      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário autenticado ausente na requisição.",
        detalhes: {
          operacao: "http.contexto.build",
        },
      });
    }

    const ctxBase = criarCtxBase(usuario);
    if (!ctxBase.ok) return ctxBase;

    if (!usuario.sessionId || !usuario.expiraEm) {
      return createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Metadados da sessão ausentes no request autenticado.",
        detalhes: {
          operacao: "http.contexto.build",
        },
      });
    }

    const contextoAutorizado = await deps.resolverContextoAutorizado({
      sessao: {
        locatarioId: ctxBase.value.locatarioId,
        usuarioId: ctxBase.value.usuarioId,
        sessionId: usuario.sessionId,
        expiraEm: usuario.expiraEm,
      },
    });

    if (!contextoAutorizado.ok) {
      return contextoAutorizado;
    }

    return wrapOk(contextoAutorizado.value.ctx);
  }
}
