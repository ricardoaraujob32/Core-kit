import type { Result } from "../../result";
import type { ErroApp } from "../../erros";
import { createErroApp } from "../../ROPHelpers";
import type { Locatario } from "../tipos";
import type { PortasRepositorioLocatarios } from "../portasRepositorio";
import { validarCriarLocatarioInput } from "../validadores";

export async function criarLocatario(
  deps: { repo: PortasRepositorioLocatarios; gerarId: () => string; agora: () => Date },
  input: { nome: string; planoId: string; slug: string },
): Promise<Result<Locatario, ErroApp>> {
  const v = validarCriarLocatarioInput(input);
  if (!v.ok) return v;

  const slugJaExiste = await deps.repo.existeSlug(v.value.slug);
  if (!slugJaExiste.ok) return slugJaExiste as Result<any, ErroApp>;
  if (slugJaExiste.value) {
    return createErroApp({
      codigo: "CONFLITO",
      mensagem: "Slug já está em uso.",
      detalhes: { campo: "slug", valor: v.value.slug },
    });
  }

  const now = deps.agora();

  const loc: Locatario = {
    id: deps.gerarId(),
    nome: v.value.nome,
    planoId: v.value.planoId,
    slug: v.value.slug,
    status: "ATIVO",
    criadoEm: now,
    atualizadoEm: now,
    excluidoEm: null,
    excluidoPorUsuarioId: null,
    motivoExclusao: null,
  };

  const r = await deps.repo.inserir(loc);
  if (!r.ok) return r as Result<any, ErroApp>;

  return { ok: true, value: loc };
}