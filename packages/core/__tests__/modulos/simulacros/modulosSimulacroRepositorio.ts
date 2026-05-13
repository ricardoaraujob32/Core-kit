//

import { wrapOk, createErroApp } from "../../../src/kernel";
import type { ModulosHabilitadosRepositorio } from "../../../src/modulos/portasRepositorio";
import type { ModuloHabilitado } from "../../../src/modulos";

type Operacao = "listarPorLocatario";

export function criarModulosSimulacroRepositorio(
  inicial: ModuloHabilitado[] = [],
) {
  let chamadas = 0;
  const falhas = new Set<Operacao>();

  const repositorio: ModulosHabilitadosRepositorio = {
    async listarPorLocatario() {
      chamadas++;

      if (falhas.has("listarPorLocatario")) {
        return createErroApp({
          codigo: "MODULOS_REPOSITORIO_FALHA",
          mensagem: "",
          detalhes: { simulada: true },
        });
      }

      return wrapOk([...inicial]);
    },
  };

  return {
    repositorio,
    simularFalha(operacao: Operacao) {
      falhas.add(operacao);
    },
    chamadas: () => chamadas,
  };
}