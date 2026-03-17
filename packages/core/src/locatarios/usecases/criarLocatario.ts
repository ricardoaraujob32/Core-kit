// packages/core/src/locatarios/usecases/criarLocatario.ts

import type { CriarLocatarioInput, CriarLocatarioOutput, ResultadoCriarLocatario } from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarNomeLocatario } from "../validadores";
import { wrapOk } from "../../result";
import { IdPorta, RelogioPorta } from "../../utils";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createCriarLocatario(deps: {
  locRepo: LocatariosRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
}) {
  return async function criarLocatario(input: CriarLocatarioInput): ResultadoCriarLocatario {
    const nome = validarNomeLocatario(input.nome);
    if (!nome.ok) return nome;

    const locatarioId = deps.idPorta.gerarId();
    const criadoEm = deps.relogio.agora();

    const res = await deps.locRepo.criar({
      locatarioId,
      nome: nome.value,
      status: "ATIVO",
      criadoEm,
    });
    if (!res.ok) return res;

    return wrapOk<CriarLocatarioOutput>({
      locatarioId: res.value.locatarioId,
    });
  };
}