// apps/web/src/shared/pwa/__tests__/pwaScope.test.ts

import { describe, expect, it } from "vitest";
import {
  buildPwaCacheKey,
  serializePwaScope,
  type PwaScope,
} from "../pwaScope";

describe("pwaScope", () => {
  it("serializa escopo tenant com locatario e usuario", () => {
    const scope: PwaScope = {
      perfil: "tenant",
      locatarioId: "loc-1",
      usuarioId: "user-1",
    };

    expect(serializePwaScope(scope)).toBe("tenant:loc-1:user-1");
  });

  it("serializa valores ausentes de forma explícita", () => {
    const scope: PwaScope = {
      perfil: "anonimo",
      locatarioId: null,
      usuarioId: null,
    };

    expect(serializePwaScope(scope)).toBe(
      "anonimo:sem-locatario:sem-usuario",
    );
  });

  it("gera chave de cache escopada", () => {
    const scope: PwaScope = {
      perfil: "tenant",
      locatarioId: "loc-1",
      usuarioId: "user-1",
    };

    expect(buildPwaCacheKey(scope, "clientes:list")).toBe(
      "tenant:loc-1:user-1:clientes:list",
    );
  });
});
