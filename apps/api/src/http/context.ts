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
 * Tipo da função oficial de listagem de módulos habilitados.
 */
type ListarModulosHabilitadosFn = ReturnType<typeof getAuthorizationBootstrap>["runtime"]["listarModulosHabilitados"];

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

  /**
   * Função responsável por listar os módulos habilitados do locatário.
   */
  listarModulosHabilitados: ListarModulosHabilitadosFn;
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
  get listarModulosHabilitados() {
    return getAuthorizationBootstrap().runtime.listarModulosHabilitados;
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
  const usuario = req.usuario ?? null;

  console.log("[http.contexto.extrairUsuario]", {
    url: req.url,
    method: req.method,
    possuiUsuario: !!usuario,
    usuarioId: usuario?.usuarioId ?? null,
    locatarioId: usuario?.locatarioId ?? null,
    papeis: usuario?.papeis ?? [],
    permissoes: usuario?.permissoes ?? [],
    sessionId: usuario?.sessionId ?? null,
    expiraEm: usuario?.expiraEm ?? null,
  });

  return usuario;
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
    const erro = createErroApp({
      codigo: "LOCATARIO_OBRIGATORIO",
      mensagem: "Locatário ausente no contexto autenticado.",
      detalhes: {
        operacao: "http.contexto.criarBase",
      },
    });

    console.error("[http.contexto.criarBase.err]", {
      usuarioId: usuario.usuarioId,
      locatarioId: usuario.locatarioId ?? null,
      erro,
    });

    return erro;
  }

  try {
    const ctx = createContextoExecucao({
      locatarioId: usuario.locatarioId,
      usuarioId: usuario.usuarioId,
      papeis: usuario.papeis ? [...usuario.papeis] : undefined,
      permissoes: usuario.permissoes ? [...usuario.permissoes] : undefined,
    });

    console.log("[http.contexto.criarBase.ok]", {
      usuarioId: usuario.usuarioId,
      locatarioId: usuario.locatarioId,
      papeis: ctx.papeis ?? [],
      permissoes: ctx.permissoes ?? [],
      modulosHabilitados: ctx.modulosHabilitados ?? [],
    });

    return wrapOk(ctx);
  } catch (causa) {
    const erro = createErroApp({
      codigo: "ERRO_INTERNO",
      mensagem: "Falha ao criar contexto base.",
      detalhes: {
        operacao: "http.contexto.criarBase",
        usuarioId: usuario.usuarioId,
        locatarioId: usuario.locatarioId,
      },
      causa,
    });

    console.error("[http.contexto.criarBase.err]", {
      usuarioId: usuario.usuarioId,
      locatarioId: usuario.locatarioId,
      erro,
      causa,
    });

    return erro;
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
    console.log("[http.contexto.build.start]", {
      url: req.url,
      method: req.method,
    });

    const usuario = extrairUsuarioAutenticado(req);

    if (!usuario) {
      const erro = createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário autenticado ausente na requisição.",
        detalhes: {
          operacao: "http.contexto.build",
        },
      });

      console.error("[http.contexto.build.err][usuario-ausente]", {
        url: req.url,
        method: req.method,
        erro,
      });

      return erro;
    }

    const ctxBase = criarCtxBase(usuario);
    if (!ctxBase.ok) {
      console.error("[http.contexto.build.err][ctx-base]", {
        url: req.url,
        method: req.method,
        usuarioId: usuario.usuarioId,
        locatarioId: usuario.locatarioId ?? null,
        erro: ctxBase.error,
      });

      return ctxBase;
    }

    if (!usuario.sessionId || !usuario.expiraEm) {
      const erro = createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Metadados da sessão ausentes no request autenticado.",
        detalhes: {
          operacao: "http.contexto.build",
        },
      });

      console.error("[http.contexto.build.err][sessao-ausente]", {
        url: req.url,
        method: req.method,
        usuarioId: usuario.usuarioId,
        locatarioId: usuario.locatarioId,
        sessionId: usuario.sessionId ?? null,
        expiraEm: usuario.expiraEm ?? null,
        erro,
      });

      return erro;
    }

    console.log("[http.contexto.build.beforeResolver]", {
      url: req.url,
      method: req.method,
      usuarioId: ctxBase.value.usuarioId ?? null,
      locatarioId: ctxBase.value.locatarioId,
      papeis: ctxBase.value.papeis ?? [],
      permissoes: ctxBase.value.permissoes ?? [],
      modulosHabilitados: ctxBase.value.modulosHabilitados ?? [],
      sessionId: usuario.sessionId,
      expiraEm: usuario.expiraEm,
    });

    const contextoAutorizado = await deps.resolverContextoAutorizado({
      sessao: {
        locatarioId: ctxBase.value.locatarioId,
        usuarioId: ctxBase.value.usuarioId,
        sessionId: usuario.sessionId,
        expiraEm: usuario.expiraEm,
      },
    });

    if (!contextoAutorizado.ok) {
      console.error("[http.contexto.build.err][resolverContextoAutorizado]", {
        url: req.url,
        method: req.method,
        usuarioId: ctxBase.value.usuarioId ?? null,
        locatarioId: ctxBase.value.locatarioId,
        erro: contextoAutorizado.error,
      });

      return contextoAutorizado;
    }

    const modulosHabilitados = await deps.listarModulosHabilitados({
      locatarioId: ctxBase.value.locatarioId,
    });

    if (!modulosHabilitados.ok) {
      console.error("[http.contexto.build.err][listarModulosHabilitados]", {
        url: req.url,
        method: req.method,
        usuarioId: ctxBase.value.usuarioId ?? null,
        locatarioId: ctxBase.value.locatarioId,
        erro: modulosHabilitados.error,
      });

      return modulosHabilitados;
    }

    console.log("[http.contexto.build.modulos]", {
      url: req.url,
      method: req.method,
      usuarioId: ctxBase.value.usuarioId ?? null,
      locatarioId: ctxBase.value.locatarioId,
      modulosHabilitados: modulosHabilitados.value.modulos ?? [],
    });

    const ctxFinal = createContextoExecucao({
      locatarioId: contextoAutorizado.value.ctx.locatarioId,
      usuarioId: contextoAutorizado.value.ctx.usuarioId,
      papeis: contextoAutorizado.value.ctx.papeis,
      permissoes: contextoAutorizado.value.ctx.permissoes,
      modulosHabilitados: modulosHabilitados.value.modulos.map((modulo) => modulo.codigo.trim().toUpperCase()),
      agora: contextoAutorizado.value.ctx.agora,
    });

    console.log("[http.contexto.build.afterResolver]", {
      url: req.url,
      method: req.method,
      usuarioId: ctxFinal.usuarioId ?? null,
      locatarioId: ctxFinal.locatarioId,
      papeis: ctxFinal.papeis ?? [],
      permissoes: ctxFinal.permissoes ?? [],
      modulosHabilitados: ctxFinal.modulosHabilitados ?? [],
    });

    return wrapOk(ctxFinal);
  };
}
