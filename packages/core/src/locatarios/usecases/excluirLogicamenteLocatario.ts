import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { createErroApp } from "../../ROPHelpers";
import type { LocatarioId, UsuarioId } from "../tipos";
import type { PortasRepositorioLocatarios } from "../portasRepositorio";

function isBlank(s: unknown): boolean {
  return typeof s !== "string" || s.trim().length === 0;
}

export async function excluirLogicamenteLocatario(
  deps: { repo: PortasRepositorioLocatarios; agora: () => Date },
  input: {
    locatarioId: LocatarioId;
    excluidoPorUsuarioId: UsuarioId;
    motivoExclusao?: string | null;
  },
): Promise<Result<void, ErroApp>> {
  if (isBlank(input.excluidoPorUsuarioId)) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "excluidoPorUsuarioId é obrigatório.",
      detalhes: { campo: "excluidoPorUsuarioId" },
    });
  }

  const got = await deps.repo.obterPorId(input.locatarioId);
  if (!got.ok) return got as Result<any, ErroApp>;
  if (!got.value) return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Locatário não encontrado." });

  const loc = got.value;
  const now = deps.agora();

  const atualizado = {
    ...loc,
    excluidoEm: now,
    excluidoPorUsuarioId: input.excluidoPorUsuarioId,
    motivoExclusao: input.motivoExclusao?.trim?.() ? input.motivoExclusao.trim() : null,
    atualizadoEm: now,
  };

  const saved = await deps.repo.atualizar(atualizado);
  if (!saved.ok) return saved as Result<any, ErroApp>;
  return { ok: true, value: undefined };
}