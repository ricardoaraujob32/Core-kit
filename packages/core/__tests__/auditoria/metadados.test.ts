// packages/core/__tests__/auditoria/metadados.test.ts

import { describe, expect, it } from "vitest";
import { metaAcao, metaAtualizacao, metaCriacao, metaImpersonacao } from "../../src/auditoria/metadados";

describe("#1 - metadados de auditoria", () => {
  it("#1.1 - deve criar metadados de criação", () => {
    expect(metaCriacao({ id: "1" })).toEqual({
      antes: null,
      depois: { id: "1" },
      contexto: {},
    });
  });

  it("#1.2 - deve criar metadados de atualização", () => {
    expect(metaAtualizacao({ nome: "A" }, { nome: "B" }, ["nome"])).toEqual({
      antes: { nome: "A" },
      depois: { nome: "B" },
      contexto: { camposAlterados: ["nome"] },
    });
  });

  it("#1.3 - deve criar metadados de ação", () => {
    expect(metaAcao({ origem: "teste" })).toEqual({
      contexto: { origem: "teste" },
    });
  });

  it("#1.4 - deve criar metadados de impersonação", () => {
    expect(
      metaImpersonacao({
        superadminUsuarioId: "super-1",
        locatarioAlvoId: "loc-1",
        motivo: "suporte",
      }),
    ).toEqual({
      contexto: {
        modoImpersonacao: true,
        superadminUsuarioId: "super-1",
        locatarioAlvoId: "loc-1",
        motivo: "suporte",
      },
    });
  });
});
