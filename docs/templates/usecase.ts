// templates/usecase.ts

import type { ContextoExecucao } from "../src/context/ContextoExecucao";
import type { AppError } from "../src/errors/AppError";
import type { Result } from "../src/result/Result";
import { ok, err } from "../src/result/helpers";
import { assertPermissao } from "../src/auth/assertPermissao";

export type InputDTO = {
  // preencher
};

export type OutputDTO = {
  // preencher
};

export type Deps = {
  // ports aqui
  // clienteRepo: ClienteRepo;
  // clock: Clock;
  // idGen: IdGenerator;
};

export async function executar(
  ctx: ContextoExecucao,
  input: InputDTO,
  deps: Deps
): Promise<Result<OutputDTO, AppError>> {
  // --- Permissões necessárias (se aplicável)
  // assertPermissao deve retornar Result/Err (ou lançar AppError), conforme seu padrão.
  const permCheck = assertPermissao(ctx, "clientes.criar");
  if (permCheck.isErr) return permCheck;

  // --- Validação básica de entrada (formato)
  // Exemplo:
  // if (!input.nome?.trim()) return err({ code:"VALIDACAO_INVALIDA", message:"nome é obrigatório" });

  // --- Regras de negócio / Orquestração
  // const entity = ...
  // await deps.clienteRepo.save(ctx.locatarioId, entity);

  // --- Saída
  return ok({
    // ...
  });
}