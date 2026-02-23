// FASTIFY_HANDLER_TEMPLATE.ts

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ContextoExecucao } from "../context/ContextoExecucao";
import type { AppError } from "../errors/AppError";
import type { Result } from "../result/Result";

// Helper: extrair ctx do request (adapte ao seu padrão)
function getCtx(req: FastifyRequest): ContextoExecucao {
  const anyReq = req as unknown as { ctx?: ContextoExecucao };
  if (!anyReq.ctx) throw new Error("ContextoExecucao ausente no request");
  return anyReq.ctx;
}

// Helper: mapear AppError -> HTTP
function mapErrorToHttp(error: AppError, reply: FastifyReply) {
  switch (error.code) {
    case "SEM_PERMISSAO":
      return reply.status(403).send({ error: error.code, message: error.message, details: error.details });
    case "TOKEN_INVALIDO":
    case "TOKEN_EXPIRADO":
    case "USUARIO_NAO_AUTENTICADO":
      return reply.status(401).send({ error: error.code, message: error.message, details: error.details });
    case "VALIDACAO_INVALIDA":
    case "CAMPO_OBRIGATORIO_AUSENTE":
    case "FORMATO_INVALIDO":
    case "VALOR_FORA_DO_LIMITE":
      return reply.status(400).send({ error: error.code, message: error.message, details: error.details });
    case "CLIENTE_NAO_ENCONTRADO":
      return reply.status(404).send({ error: error.code, message: error.message, details: error.details });
    default:
      // fallback conservador
      return reply.status(500).send({ error: error.code, message: error.message, details: error.details });
  }
}

// Template genérico para handlers que usam Result<AppError>
export async function handlerTemplate<TInput, TOutput>(
  req: FastifyRequest,
  reply: FastifyReply,
  parseInput: (req: FastifyRequest) => TInput,
  execute: (ctx: ContextoExecucao, input: TInput) => Promise<Result<TOutput, AppError>>
) {
  const ctx = getCtx(req);

  let input: TInput;
  try {
    input = parseInput(req);
  } catch (e) {
    return reply.status(400).send({ error: "VALIDACAO_INVALIDA", message: "Entrada inválida", details: { cause: String(e) } });
  }

  const res = await execute(ctx, input);

  if (res.isErr) return mapErrorToHttp(res.error, reply);

  return reply.status(200).send(res.value);
}

// Exemplo de registro de rotas
export async function registerExampleRoutes(app: FastifyInstance) {
  app.post("/example", async (req, reply) => {
    return handlerTemplate(
      req,
      reply,
      (r) => (r.body ?? {}) as any,
      async (_ctx, _input) => {
        // chamar seu usecase real aqui
        return { isOk: true, isErr: false, value: { ok: true } } as any;
      }
    );
  });
}