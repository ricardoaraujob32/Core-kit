// packages/core/__tests__/modulos/helpers/modulosUsecaseTestUtils.ts

import { createContextoExecucao } from "../../../src/kernel";

export function criarContextoLocatario(locatarioId = "loc-1") {
  return createContextoExecucao({
    locatarioId,
    usuarioId: "usr-1",
  });
}
