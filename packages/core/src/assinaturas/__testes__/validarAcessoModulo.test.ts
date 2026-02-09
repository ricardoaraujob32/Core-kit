// packages/core/src/assinaturas/usecases/__tests__/validarAcessoModulo.test.ts
// Finalidade: validar regras de acesso a módulos por plano + pagamento (assinatura).

import { describe, expect, it } from "vitest";
import { validarAcessoModulo } from "../../planos/usecases/validarAcessoModulo";

import type { Assinatura } from "../tipos";
import type { RepositorioAssinaturas } from "../portasRepositorio";

import type { Plano } from "../../planos/tipos";
import type { RepositorioModulosPlano, RepositorioPlanos } from "../../planos/portasRepositorio";
import type { CodigoModulo } from "../../planos/tipos";

type Dependencias = Parameters<typeof validarAcessoModulo>[0];

function criarAssinatura(parcial: Partial<Assinatura>): Assinatura {
  const agora = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: "a1",
    locatarioId: "l1",
    planoId: "p1",
    status: "EM_TESTE",
    inicioEm: agora,
    fimEm: null,
    moeda: "BRL",
    valorCentavos: 0,
    ciclo: "MENSAL",
    proximoVencimentoEm: null,
    ultimoPagamentoEm: null,
    provedorPagamento: null,
    refExterna: null,
    falhaPagamentoEm: null,
    motivo: null,
    criadoEm: agora,
    atualizadoEm: agora,
    excluidoEm: null,
    ...parcial,
  };
}

function criarPlano(parcial: Partial<Plano>): Plano {
  return {
    id: "p1",
    nome: "Básico",
    ativo: true,
    limites: {
      limiteUsuarios: 3,
      limiteIdentidadesVisuais: 1,
    },
    ...parcial,
  };
}

function depsFakes(input: {
  assinatura?: Assinatura | null;
  plano?: Plano | null;
  modulos?: CodigoModulo[];
}): Dependencias {
  const assinaturasRepo: RepositorioAssinaturas = {
    async obterVivaPorLocatario(_locatarioId) {
      return input.assinatura ?? null;
    },
    async listarPorLocatario(_locatarioId) {
      return input.assinatura ? [input.assinatura] : [];
    },
    async criar() {
      throw new Error("Não usado neste teste");
    },
    async atualizarStatus() {
      throw new Error("Não usado neste teste");
    },
  };

  const planosRepo: RepositorioPlanos = {
    async obterPorId(planoId: string) {
      if (!input.plano) return null;
      if (input.plano.id !== planoId) return null;
      return input.plano;
    },
  };

  const modulosPlanoRepo: RepositorioModulosPlano = {
    async listarModulosDoPlano(planoId: string) {
      if (!input.plano) return [];
      if (input.plano.id !== planoId) return [];
      return input.modulos ?? [];
    },
  };

  return {
    assinaturasRepo,
    planosRepo,
    modulosPlanoRepo,
    agora: () => new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("assinaturas/usecases/validarAcessoModulo", () => {
  it("permite módulos sempre habilitados sem consultar assinatura", async () => {
    const deps = depsFakes({ assinatura: null, plano: null, modulos: [] });

    const locatarioId = "l1";

    const r1 = await validarAcessoModulo(deps, locatarioId, "LOCATARIO");
    const r2 = await validarAcessoModulo(deps, locatarioId, "AUTENTICACAO");
    const r3 = await validarAcessoModulo(deps, locatarioId, "BACKUP");

    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);
  });

  it("nega quando não existe assinatura viva e o módulo não é sempre habilitado", async () => {
    const deps = depsFakes({ assinatura: null, plano: null, modulos: [] });

    const r = await validarAcessoModulo(deps, "l1", "USUARIOS");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_ENCONTRADO");
    }
  });

  it("nega quando assinatura está INADIMPLENTE (bloqueia tudo exceto sempre habilitados)", async () => {
    const deps = depsFakes({
      assinatura: criarAssinatura({ status: "INADIMPLENTE", planoId: "p1" }),
      plano: criarPlano({ id: "p1" }),
      modulos: ["USUARIOS", "ESTOQUE"],
    });

    const r = await validarAcessoModulo(deps, "l1", "USUARIOS");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.mensagem).toContain("Assinatura não está ativa");
    }
  });

  it("nega quando plano não existe", async () => {
    const deps = depsFakes({
      assinatura: criarAssinatura({ status: "ATIVA", planoId: "p1" }),
      plano: null,
      modulos: ["USUARIOS"],
    });

    const r = await validarAcessoModulo(deps, "l1", "USUARIOS");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.mensagem).toContain("Plano inválido");
    }
  });

  it("nega quando plano existe mas está inativo", async () => {
    const deps = depsFakes({
      assinatura: criarAssinatura({ status: "ATIVA", planoId: "p1" }),
      plano: criarPlano({ id: "p1", ativo: false }),
      modulos: ["USUARIOS"],
    });

    const r = await validarAcessoModulo(deps, "l1", "USUARIOS");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.mensagem).toContain("Plano inválido");
    }
  });

  it("nega quando módulo não está habilitado no plano", async () => {
    const deps = depsFakes({
      assinatura: criarAssinatura({ status: "ATIVA", planoId: "p1" }),
      plano: criarPlano({ id: "p1", ativo: true }),
      modulos: ["EXPORTACAO_SIMPLES"], // não inclui USUARIOS
    });

    const r = await validarAcessoModulo(deps, "l1", "USUARIOS");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.codigo).toBe("NAO_AUTORIZADO");
      expect(r.error.mensagem).toContain("Módulo não habilitado");
    }
  });

  it("permite quando assinatura ATIVA e módulo está habilitado no plano", async () => {
    const deps = depsFakes({
      assinatura: criarAssinatura({ status: "ATIVA", planoId: "p1" }),
      plano: criarPlano({ id: "p1", ativo: true }),
      modulos: ["USUARIOS", "EXPORTACAO_SIMPLES"],
    });

    const r = await validarAcessoModulo(deps, "l1", "USUARIOS");

    expect(r.ok).toBe(true);
  });

  it("permite quando assinatura EM_TESTE e módulo está habilitado no plano", async () => {
    const deps = depsFakes({
      assinatura: criarAssinatura({ status: "EM_TESTE", planoId: "p1" }),
      plano: criarPlano({ id: "p1", ativo: true }),
      modulos: ["USUARIOS"],
    });

    const r = await validarAcessoModulo(deps, "l1", "USUARIOS");

    expect(r.ok).toBe(true);
  });
});
