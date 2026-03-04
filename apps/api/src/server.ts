// apps/api/src/server.ts

import Fastify, { type FastifyInstance } from "fastify";
import { buildContextFromRequest } from "./http/context";
import { registerHealthRoutes } from "./routes/health";
import { registerExemploProtegidoRoutes } from "./routes/exemplo-protegido";
import { registrarRotasUsuarios } from "./routes/usuarios";
import { criarDependenciasAplicacao } from "./dependencyInjection";

export async function buildServer(): Promise<FastifyInstance> {
  const aplicacao: FastifyInstance = Fastify({ logger: true });
  const dependenciasAplicacao = criarDependenciasAplicacao();

  aplicacao.addHook("preHandler", async (requisicao) => {
    requisicao.ctx = buildContextFromRequest(requisicao);
  });

  await registerHealthRoutes(aplicacao);
  await registerExemploProtegidoRoutes(aplicacao);
  await registrarRotasUsuarios(aplicacao, dependenciasAplicacao);
  await registrarRotasUsuarios(aplicacao);
  await registrarRotasAdminLocatarios(aplicacao, dependenciasAplicacao.adminLocatarios);
  await registrarRotasSuperAdminLocatarios(aplicacao);

  return aplicacao;
}
