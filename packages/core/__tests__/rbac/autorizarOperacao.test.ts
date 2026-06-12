// packages/core/__tests__/rbac/autorizarOperacao.test.ts

import { describe, expect, it } from "vitest";
import { autorizarOperacao } from "../../src/rbac/usecases/autorizarOperacao";
import { Permissoes } from "../../src/rbac";
import { criarContextoAutenticado, permissaoTeste } from "./helpers/rbacUsecaseTestUtils";

describe("#1 - autorizarOperacao", () => {
  it("#1.1 - deve autorizar quando contexto possui permissão", () => {
    const ctx = criarContextoAutenticado({
      permissoes: [permissaoTeste],
    });

    const resultado = autorizarOperacao({
      ctx,
      permissao: permissaoTeste,
    });

    expect(resultado.ok).toBe(true);
  });

  it("#1.2 - deve negar quando contexto não possui permissão", () => {
    const ctx = criarContextoAutenticado({
      permissoes: [],
    });

    const resultado = autorizarOperacao({
      ctx,
      permissao: permissaoTeste,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("RBAC_NAO_AUTORIZADO");
  });

  it("#1.3 - deve falhar quando permissão é inválida", () => {
    const ctx = criarContextoAutenticado();

    const resultado = autorizarOperacao({
      ctx,
      permissao: "" as never,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error.codigo).toBe("RBAC_PERMISSAO_INVALIDA");
  });

  it("#1.4 - deve aceitar permissão diferente quando presente", () => {
    const ctx = criarContextoAutenticado({
      permissoes: [Permissoes.TENANT_USUARIO_CRIAR],
    });

    const resultado = autorizarOperacao({
      ctx,
      permissao: Permissoes.TENANT_USUARIO_CRIAR,
    });

    expect(resultado.ok).toBe(true);
  });
});