import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { createErroApp } from "../../ROPHelpers";
import type { Locatario, LocatarioId } from "../tipos";
import type { PortasRepositorioLocatarios } from "../portasRepositorio";

export async function obterLocatario(
  deps: { repo: PortasRepositorioLocatarios },
  query: { id?: LocatarioId; slug?: string },
): Promise<Result<Locatario, ErroApp>> {
  if (!query.id && !query.slug) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Informe id ou slug.",
      detalhes: { campo: "id|slug" },
    });
  }

  const r = query.id
    ? await deps.repo.obterPorId(query.id)
    : await deps.repo.obterPorSlug(query.slug as string);

  if (!r.ok) return r as Result<any, ErroApp>;
  if (!r.value) {
    return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Locatário não encontrado." });
  }
  return { ok: true, value: r.value };
}