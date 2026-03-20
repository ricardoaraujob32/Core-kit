// apps/api/src/middlewares/authGuard.ts

import { LocatarioId, Papel, Permissao } from "@core-kit/core";
import type { FastifyReply, FastifyRequest } from "fastify";

interface JwtPayloadApp {
  sub: string;
  locatarioId?: LocatarioId | null;
  papeis?: Papel[];
  permissoes?: Permissao[];
}

function normalizarLista(values: unknown): string[] {
  if (!Array.isArray(values)) return [];

  return values.filter((value): value is string => typeof value === "string");
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<JwtPayloadApp>();

    request.usuario = {
      usuarioId: payload.sub,
      locatarioId: payload.locatarioId ?? null,
      papeis: normalizarLista(payload.papeis),
      permissoes: normalizarLista(payload.permissoes),
    };
  } catch {
    return reply.status(401).send({
      erro: {
        codigo: "NAO_AUTENTICADO",
        mensagem: "Token inválido ou ausente.",
      },
    });
  }
}


//     return responderErro(
//       reply,
//       {
//         codigo: "NAO_AUTENTICADO",
//         mensagem: "Token inválido, expirado ou ausente.",
//       },
//       request,
//     );
//   }
// }






// apps/api/src/middlewares/authGuard.ts

// import type { FastifyReply, FastifyRequest } from "fastify";
// import { sendHttpError } from "./serializarErroApp";

// interface JwtPayloadApp {
//   sub: string;
//   loc?: string | null;
//   iss?: string;
// }

// declare module "fastify" {
//   interface FastifyRequest {
//     usuario?: {
//       usuarioId: string;
//       locatarioId: string | null;
//     };
//   }
// }

// export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
//   try {
//     const payload = await request.jwtVerify<JwtPayloadApp>();

//     request.usuario = {
//       usuarioId: payload.sub,
//       locatarioId: payload.loc ?? null,
//     };
//   } catch {
//     return sendHttpError(reply, {
//       codigo: "NAO_AUTENTICADO",
//       mensagem: "Token inválido ou ausente.",
//     });
//   }
// }