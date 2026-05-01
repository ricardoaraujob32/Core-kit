// apps/api/src/modules/helpersValidacao.ts

import type { FastifyReply } from "fastify";
import { sendHttpError } from "../http/serializarErroApp";

export function responderErroValidacaoZod(
  reply: FastifyReply,
  parseResult: {
    error: {
      flatten: () => {
        fieldErrors: Record<string, string[] | undefined>;
        formErrors: string[];
      };
    };
  },
  operacao: string,
) {
  const { fieldErrors, formErrors } = parseResult.error.flatten();

  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: formErrors[0] ?? "Dados inválidos na requisição.",
    detalhes: {
      operacao,
      campos: fieldErrors,
      formulario: formErrors,
    },
  });
}