// packages/core/__tests__/rbac/helpers/rbacUsecaseTestUtils.ts

import { createContextoExecucao } from "../../../src/kernel";
import { Permissoes } from "../../../src/rbac";


export function criarContextoAutenticado(params: {
  permissoes?: string[];
  papeis?: string[];
} = {}) {
  return createContextoExecucao({
    locatarioId: "loc-1",
    usuarioId: "usr-1",
    permissoes: params.permissoes as never,
    papeis: params.papeis as never,
  });
}

export const permissaoTeste =
  Permissoes.TENANT_USUARIO_LISTAR;