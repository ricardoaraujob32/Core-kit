import type {
  CriarLocatarioInput,
  CriarLocatarioOutput,
  ResultadoCriarLocatario,
} from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarNomeLocatario } from "../validadores";
import { wrapOk } from "../../result";

export function criarCriarLocatario(deps: {
  locRepo: LocatariosRepositorio;
}) {
  return async function criarLocatario(
    input: CriarLocatarioInput
  ): ResultadoCriarLocatario {
    const nome = validarNomeLocatario(input.nome);
    if (!nome.ok) return nome;

    const res = await deps.locRepo.criar({
      nome: nome.value,
    });
    if (!res.ok) return res;

    return wrapOk<CriarLocatarioOutput>({
      locatarioId: res.value.locatarioId,
    });
  };
}