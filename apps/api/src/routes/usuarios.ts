/**
 * Arquivo: apps/api/src/routes/usuarios.ts
 * Finalidade: Registrar rotas HTTP de Usuários no Fastify.
 *
 * Observações:
 * - Adaptador fino: HTTP -> casos de uso do core.
 * - Nesta fase, NÃO exigimos permissões (sem travar). Vamos endurecer depois.
 */

import type { FastifyInstance, FastifyRequest } from "fastify";
import { criarUsuario, listarUsuarios, err, appError, ok } from "@core-kit/core";
import { wrapRoute } from "../http/wrapRoute";
import type { DependenciasAplicacao } from "../dependencyInjection";

type CorpoRequisicaoCriarUsuario = {
  nome?: unknown;
};

export async function registrarRotasUsuarios(
  servidorFastify: FastifyInstance,
  dependenciasAplicacao: DependenciasAplicacao,
): Promise<void> {
  servidorFastify.get(
    "/usuarios",
    wrapRoute(async (contextoExecucao) => {
      return listarUsuarios(contextoExecucao, {
        repositorioUsuarios: dependenciasAplicacao.repositorioUsuarios,
      });
    }),
  );

  servidorFastify.post(
    "/usuarios",
    wrapRoute(async (contextoExecucao, requisicao: FastifyRequest) => {
      const corpoRequisicao = (requisicao.body ?? {}) as CorpoRequisicaoCriarUsuario;

      if (typeof corpoRequisicao.nome !== "string") {
        return err(appError("VALIDATION", 'Campo "nome" deve ser string.'));
      }

      return criarUsuario(
        contextoExecucao,
        {
          repositorioUsuarios: dependenciasAplicacao.repositorioUsuarios,
          gerarIdentificadorUsuario: dependenciasAplicacao.gerarIdentificadorUsuario,
        },
        { nome: corpoRequisicao.nome },
      );
    }),
  );

  servidorFastify.get(
    "/usuarios/_ping",
    wrapRoute(async () => ok({ ok: true })),
  );
}
