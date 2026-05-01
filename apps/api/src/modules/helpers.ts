// apps/api/src/modules/helpers.ts

import { ContextoExecucao, createContextoExecucao, ModuloCodigo, Permissao } from "@core-kit/core";
import { FastifyReply, FastifyRequest } from "fastify";
import { autorizarHttp } from "../http/autorizarHttp";
import { sendHttpError } from "../http/serializarErroApp";

/**
 * Contexto parcial aceito pelo helper de auditoria.
 */
type ContextoAuditoriaInput =
  | ContextoExecucao
  | {
      usuarioId?: string | null;
      locatarioId?: string | null;
      isSuperadmin?: boolean;
      isImpersonando?: boolean;
      locatarioAlvoId?: string | null;
      agenteTipo?: string | null;
      origem?: string | null;
    };

// /**
//  * Obtém apenas o contexto autenticado/autorizado base.
//  *
//  * @param request Requisição atual.
//  * @param reply Resposta atual.
//  * @returns Contexto ou `null` quando erro já foi respondido.
//  */
// export async function obterCtxOuResponderErro(request: FastifyRequest, reply: FastifyReply): Promise<ContextoExecucao | null> {
//   return autorizarHttp(request, reply);
// }

// /**
//  * Obtém o contexto aplicando uma política declarativa completa.
//  *
//  * @param request Requisição atual.
//  * @param reply Resposta atual.
//  * @param politica Política de autorização.
//  * @returns Contexto ou `null` quando erro já foi respondido.
//  */
// export async function obterCtxAutorizadoOuResponderErro(request: FastifyRequest, reply: FastifyReply,
//   politica: {
//     permissao?: Permissao;
//     modulo?: ModuloCodigo;
//     exigeSuperadmin?: boolean;
//     locatarioIdAlvo?: string;
//   },
// ): Promise<ContextoExecucao | null> {
//   return autorizarHttp(request, reply, politica);
// }

// /**
//  * Obtém um contexto mínimo autenticado, sem aplicar autorização RBAC.
//  *
//  * Uso temporário:
//  * - estabilizar E2E de módulos operacionais;
//  * - manter autenticação obrigatória;
//  * - desligar permissões e módulos até o backend ficar pronto.
//  */
// export async function tempCtxAutenticadoSemAutorizacaoRemoverDepois(request: FastifyRequest, reply: FastifyReply): Promise<ContextoExecucao | null> {
//   const usuario = request.usuario;

//   if (!usuario) {
//     sendHttpError(reply, {
//       codigo: "NAO_AUTENTICADO",
//       mensagem: "Usuário autenticado ausente na requisição.",
//       detalhes: {
//         operacao: "http.contexto.minimo",
//       },
//     });
//     return null;
//   }

//   if (!usuario.locatarioId) {
//     sendHttpError(reply, {
//       codigo: "LOCATARIO_OBRIGATORIO",
//       mensagem: "Locatário ausente no contexto autenticado.",
//       detalhes: {
//         operacao: "http.contexto.minimo",
//       },
//     });
//     return null;
//   }

//   try {
//     return createContextoExecucao({
//       locatarioId: usuario.locatarioId,
//       usuarioId: usuario.usuarioId,
//       papeis: usuario.papeis ? [...usuario.papeis] : [],
//       permissoes: [],
//       modulosHabilitados: [],
//     });
//   } catch {
//     sendHttpError(reply, {
//       codigo: "ERRO_INTERNO",
//       mensagem: "Falha ao criar contexto mínimo autenticado.",
//       detalhes: {
//         operacao: "http.contexto.minimo",
//       },
//     });
//     return null;
//   }
// }
