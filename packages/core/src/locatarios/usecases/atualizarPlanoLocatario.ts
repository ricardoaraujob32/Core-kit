import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { createErroApp } from "../../ROPHelpers";
import type { LocatarioId, PlanoId } from "../tipos";
import type { PortasRepositorioLocatarios } from "../portasRepositorio";

function isBlank(s: unknown): boolean {
  return typeof s !== "string" || s.trim().length === 0;
}

export async function atualizarPlanoLocatario(
  deps: { repo: PortasRepositorioLocatarios; agora: () => Date },
  input: { locatarioId: LocatarioId; novoPlanoId: PlanoId },
): Promise<Result<void, ErroApp>> {
  if (isBlank(input.novoPlanoId)) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "novoPlanoId é obrigatório.",
      detalhes: { campo: "novoPlanoId" },
    });
  }

  const got = await deps.repo.obterPorId(input.locatarioId);
  if (!got.ok) return got as Result<any, ErroApp>;
  if (!got.value) return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Locatário não encontrado." });

  const loc = got.value;
  const atualizado = {
    ...loc,
    planoId: input.novoPlanoId.trim(),
    atualizadoEm: deps.agora(),
  };

  const saved = await deps.repo.atualizar(atualizado);
  if (!saved.ok) return saved as Result<any, ErroApp>;
  return { ok: true, value: undefined };
}