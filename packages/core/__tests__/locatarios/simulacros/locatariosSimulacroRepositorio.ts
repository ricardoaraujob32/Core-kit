// packages/core/__tests__/locatarios/simulacros/locatariosSimulacroRepositorio.ts

import { createErroApp, wrapOk } from "../../../src/kernel";
import type { ErroApp } from "../../../src/kernel";
import type { LocatariosRepositorio } from "../../../src/locatarios/portasRepositorio";
import type { ConfiguracaoLocatario, Locatario, LocatarioId, LocatarioStatus, ModoTemaLocatario } from "../../../src/locatarios/tipos";

type OperacaoLocatarios =
  | "criar"
  | "buscarPorId"
  | "buscarPorSlug"
  | "buscarPorEmail"
  | "listar"
  | "atualizar"
  | "listarConfiguracoes"
  | "obterConfiguracaoAtiva"
  | "buscarConfiguracaoPorId"
  | "criarConfiguracao"
  | "atualizarConfiguracao"
  | "desativarConfiguracoesAtivas";

type FalhaSimulada = {
  codigo?: ErroApp["codigo"];
  mensagem?: string;
  detalhes?: Record<string, unknown>;
};

export type LocatariosSimulacroRepositorio = LocatariosRepositorio & {
  carregar(locatario: Locatario): void;
  carregarMuitos(locatarios: Locatario[]): void;
  carregarConfiguracao(configuracao: ConfiguracaoLocatario): void;
  carregarConfiguracoes(configuracoes: ConfiguracaoLocatario[]): void;
  dump(): Locatario[];
  dumpConfiguracoes(): ConfiguracaoLocatario[];
  limpar(): void;
  simularFalha(operacao: OperacaoLocatarios, falha?: FalhaSimulada): void;
  limparFalhas(): void;
};

function erroSimulado(operacao: OperacaoLocatarios, falha?: FalhaSimulada) {
  return createErroApp({
    codigo: falha?.codigo ?? "ERRO_INTERNO",
    mensagem: falha?.mensagem ?? "Falha simulada no repositório de locatários.",
    detalhes: {
      operacao: `teste.locatarios.${operacao}`,
      simulada: true,
      ...falha?.detalhes,
    },
  });
}

function chaveConfiguracao(locatarioId: LocatarioId, configuracaoId: string): string {
  return `${locatarioId}::${configuracaoId}`;
}

function clonarConfiguracao(configuracao: ConfiguracaoLocatario): ConfiguracaoLocatario {
  return {
    ...configuracao,
    criadoEm: new Date(configuracao.criadoEm),
    atualizadoEm: new Date(configuracao.atualizadoEm),
  };
}

function clonarLocatario(locatario: Locatario): Locatario {
  return {
    ...locatario,
    criadoEm: new Date(locatario.criadoEm),
    atualizadoEm: new Date(locatario.atualizadoEm),

    excluidoEm: locatario.excluidoEm ? new Date(locatario.excluidoEm) : null,
    suspensoEm: locatario.suspensoEm ? new Date(locatario.suspensoEm) : null,
    reativadoEm: locatario.reativadoEm ? new Date(locatario.reativadoEm) : null,

    motivoExclusao: locatario.motivoExclusao ?? null,
    motivoSuspensao: locatario.motivoSuspensao ?? null,
    motivoReativacao: locatario.motivoReativacao ?? null,

    configuracoes: (locatario.configuracoes ?? []).map(clonarConfiguracao),
  };
}

function ordenarLocatarios(a: Locatario, b: Locatario): number {
  return a.nome.localeCompare(b.nome);
}

function ordenarConfiguracoes(a: ConfiguracaoLocatario, b: ConfiguracaoLocatario): number {
  return a.criadoEm.getTime() - b.criadoEm.getTime();
}

export function criarLocatariosSimulacroRepositorio(
  carregamentoInicial: Locatario[] = [],
): LocatariosSimulacroRepositorio {
  const porId = new Map<string, Locatario>();
  const configuracoes = new Map<string, ConfiguracaoLocatario>();
  const falhas = new Map<OperacaoLocatarios, FalhaSimulada | undefined>();

  function sincronizarConfiguracoesDoLocatario(locatario: Locatario): void {
    for (const configuracao of locatario.configuracoes ?? []) {
      configuracoes.set(
        chaveConfiguracao(configuracao.locatarioId, configuracao.configuracaoId),
        clonarConfiguracao(configuracao),
      );
    }
  }

  function reconstruirLocatarioComConfiguracoes(locatario: Locatario): Locatario {
    const configs = [...configuracoes.values()]
      .filter((config) => config.locatarioId === locatario.locatarioId)
      .sort(ordenarConfiguracoes)
      .map(clonarConfiguracao);

    return clonarLocatario({
      ...locatario,
      configuracoes: configs,
    });
  }

  function atualizarSnapshotConfiguracoesDoLocatario(locatarioId: LocatarioId): void {
    const locatario = porId.get(locatarioId);
    if (!locatario) return;

    porId.set(
      locatarioId,
      clonarLocatario({
        ...locatario,
        configuracoes: [...configuracoes.values()]
          .filter((config) => config.locatarioId === locatarioId)
          .sort(ordenarConfiguracoes)
          .map(clonarConfiguracao),
      }),
    );
  }

  const api: LocatariosSimulacroRepositorio = {
    carregar(locatario) {
      const clone = clonarLocatario(locatario);
      porId.set(clone.locatarioId, clone);
      sincronizarConfiguracoesDoLocatario(clone);
      atualizarSnapshotConfiguracoesDoLocatario(clone.locatarioId);
    },

    carregarMuitos(locatarios) {
      for (const locatario of locatarios) {
        api.carregar(locatario);
      }
    },

    carregarConfiguracao(configuracao) {
      const clone = clonarConfiguracao(configuracao);
      configuracoes.set(chaveConfiguracao(clone.locatarioId, clone.configuracaoId), clone);
      atualizarSnapshotConfiguracoesDoLocatario(clone.locatarioId);
    },

    carregarConfiguracoes(lista) {
      for (const configuracao of lista) {
        api.carregarConfiguracao(configuracao);
      }
    },

    dump() {
      return [...porId.values()]
        .map(reconstruirLocatarioComConfiguracoes)
        .sort(ordenarLocatarios);
    },

    dumpConfiguracoes() {
      return [...configuracoes.values()]
        .map(clonarConfiguracao)
        .sort(ordenarConfiguracoes);
    },

    limpar() {
      porId.clear();
      configuracoes.clear();
      falhas.clear();
    },

    simularFalha(operacao, falha) {
      falhas.set(operacao, falha);
    },

    limparFalhas() {
      falhas.clear();
    },

    async criar(params: Parameters<LocatariosRepositorio["criar"]>[0]) {
      if (falhas.has("criar")) {
        return erroSimulado("criar", falhas.get("criar"));
      }

      const novo: Locatario = {
        locatarioId: params.locatarioId,
        nome: params.nome,
        slug: params.slug,
        documento: params.documento,
        email: params.email,
        fusoHorario: params.fusoHorario,
        status: params.status,
        criadoEm: params.criadoEm,
        atualizadoEm: params.atualizadoEm,
        excluidoEm: null,
        motivoExclusao: null,
        suspensoEm: null,
        motivoSuspensao: null,
        reativadoEm: null,
        motivoReativacao: null,
        configuracoes: [clonarConfiguracao({ ...params.configuracaoInicial, locatarioId: params.locatarioId, }),
    ],}

      api.carregar(novo);

      return wrapOk({
        locatarioId: params.locatarioId,
      });
    },

    async buscarPorId(params: Parameters<LocatariosRepositorio["buscarPorId"]>[0]) {
      if (falhas.has("buscarPorId")) {
        return erroSimulado("buscarPorId", falhas.get("buscarPorId"));
      }

      const locatario = porId.get(params.locatarioId) ?? null;

      return wrapOk(locatario ? reconstruirLocatarioComConfiguracoes(locatario) : null);
    },

    async buscarPorSlug(params: Parameters<LocatariosRepositorio["buscarPorSlug"]>[0]) {
      if (falhas.has("buscarPorSlug")) {
        return erroSimulado("buscarPorSlug", falhas.get("buscarPorSlug"));
      }

      const locatario =
        [...porId.values()].find((item) => item.slug === params.slug) ?? null;

      return wrapOk(locatario ? reconstruirLocatarioComConfiguracoes(locatario) : null);
    },

    async buscarPorEmail(params: Parameters<LocatariosRepositorio["buscarPorEmail"]>[0]) {
      if (falhas.has("buscarPorEmail")) {
        return erroSimulado("buscarPorEmail", falhas.get("buscarPorEmail"));
      }

      const emailNormalizado = params.emailNormalizado.toLowerCase();

      const locatario =
        [...porId.values()].find((item) => item.email.toLowerCase() === emailNormalizado) ?? null;

      return wrapOk(locatario ? reconstruirLocatarioComConfiguracoes(locatario) : null);
    },

    async listar() {
      if (falhas.has("listar")) {
        return erroSimulado("listar", falhas.get("listar"));
      }

      return wrapOk(
        [...porId.values()]
          .map(reconstruirLocatarioComConfiguracoes)
          .sort(ordenarLocatarios),
      );
    },

    async atualizar(locatario: Parameters<LocatariosRepositorio["atualizar"]>[0]) {
      if (falhas.has("atualizar")) {
        return erroSimulado("atualizar", falhas.get("atualizar"));
      }

      api.carregar(locatario);

      return wrapOk(reconstruirLocatarioComConfiguracoes(locatario));
    },

    async listarConfiguracoes(params: Parameters<LocatariosRepositorio["listarConfiguracoes"]>[0]) {
      if (falhas.has("listarConfiguracoes")) {
        return erroSimulado("listarConfiguracoes", falhas.get("listarConfiguracoes"));
      }

      return wrapOk(
        [...configuracoes.values()]
          .filter((config) => config.locatarioId === params.locatarioId)
          .map(clonarConfiguracao)
          .sort(ordenarConfiguracoes),
      );
    },

    async obterConfiguracaoAtiva(params: Parameters<LocatariosRepositorio["obterConfiguracaoAtiva"]>[0]) {
      if (falhas.has("obterConfiguracaoAtiva")) {
        return erroSimulado("obterConfiguracaoAtiva", falhas.get("obterConfiguracaoAtiva"));
      }

      const encontrada =
        [...configuracoes.values()].find(
          (config) => config.locatarioId === params.locatarioId && config.ativa,
        ) ?? null;

      return wrapOk(encontrada ? clonarConfiguracao(encontrada) : null);
    },

    async buscarConfiguracaoPorId(params: Parameters<LocatariosRepositorio["buscarConfiguracaoPorId"]>[0]) {
      if (falhas.has("buscarConfiguracaoPorId")) {
        return erroSimulado("buscarConfiguracaoPorId", falhas.get("buscarConfiguracaoPorId"));
      }

      const encontrada =
        configuracoes.get(chaveConfiguracao(params.locatarioId, params.configuracaoId)) ?? null;

      return wrapOk(encontrada ? clonarConfiguracao(encontrada) : null);
    },

    async criarConfiguracao(params: Parameters<LocatariosRepositorio["criarConfiguracao"]>[0]) {
      if (falhas.has("criarConfiguracao")) {
        return erroSimulado("criarConfiguracao", falhas.get("criarConfiguracao"));
      }

      const configuracao: ConfiguracaoLocatario = {
        locatarioId: params.locatarioId,
        configuracaoId: params.configuracaoId,
        modoTema: params.modoTema,
        identidadeVisual: params.identidadeVisual,
        corPrimaria: params.corPrimaria,
        corSecundaria: params.corSecundaria,
        corTerciaria: params.corTerciaria,
        urlLogo: params.urlLogo,
        ativa: params.ativa,
        criadoEm: params.criadoEm,
        atualizadoEm: params.atualizadoEm,
      };

      api.carregarConfiguracao(configuracao);

      return wrapOk({
        configuracaoId: params.configuracaoId,
      });
    },

    async atualizarConfiguracao(config: Parameters<LocatariosRepositorio["atualizarConfiguracao"]>[0]) {
      if (falhas.has("atualizarConfiguracao")) {
        return erroSimulado("atualizarConfiguracao", falhas.get("atualizarConfiguracao"));
      }

      const clone = clonarConfiguracao(config);

      configuracoes.set(chaveConfiguracao(clone.locatarioId, clone.configuracaoId), clone);
      atualizarSnapshotConfiguracoesDoLocatario(clone.locatarioId);

      return wrapOk(clonarConfiguracao(clone));
    },

    async desativarConfiguracoesAtivas(params: Parameters<LocatariosRepositorio["desativarConfiguracoesAtivas"]>[0]) {
      if (falhas.has("desativarConfiguracoesAtivas")) {
        return erroSimulado("desativarConfiguracoesAtivas", falhas.get("desativarConfiguracoesAtivas"));
      }

      for (const [key, config] of configuracoes.entries()) {
        if (config.locatarioId === params.locatarioId && config.ativa) {
          configuracoes.set(
            key,
            clonarConfiguracao({
              ...config,
              ativa: false,
              atualizadoEm: params.atualizadoEm,
            }),
          );
        }
      }

      atualizarSnapshotConfiguracoesDoLocatario(params.locatarioId);

      return wrapOk(undefined);
    },
  };

  api.carregarMuitos(carregamentoInicial);

  return api;
}

export function criarConfiguracaoLocatarioTeste(params: Partial<ConfiguracaoLocatario> = {}): ConfiguracaoLocatario {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");

  return {
    locatarioId: params.locatarioId ?? "loc-teste-1",
    configuracaoId: params.configuracaoId ?? "cfg-teste-1",
    modoTema: params.modoTema ?? ("SISTEMA" as ModoTemaLocatario),
    identidadeVisual: params.identidadeVisual ?? "Identidade Visual Teste",
    corPrimaria: params.corPrimaria ?? "#2563eb",
    corSecundaria: params.corSecundaria ?? "#1e40af",
    corTerciaria: params.corTerciaria ?? "#eff6ff",
    urlLogo: params.urlLogo ?? null,
    ativa: params.ativa ?? true,
    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
  };
}

export function criarLocatarioTeste(params: Partial<Locatario> = {}): Locatario {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");
  const locatarioId = params.locatarioId ?? "loc-teste-1";

  const configuracoes =
    params.configuracoes ??
    [
      criarConfiguracaoLocatarioTeste({
        locatarioId,
        configuracaoId: "cfg-teste-1",
        ativa: true,
        criadoEm,
        atualizadoEm: criadoEm,
      }),
    ];

  const configuracoesNormalizadas = configuracoes.map((configuracao) =>
    clonarConfiguracao({
      ...configuracao,
      locatarioId,
    }),
  );

  return {
    locatarioId,
    nome: params.nome ?? "Locatário Teste",
    slug: params.slug ?? "locatario-teste",
    documento: params.documento ?? "00000000000000",
    email: params.email ?? "locatario.teste@example.com",
    fusoHorario: params.fusoHorario ?? "America/Sao_Paulo",
    status: params.status ?? ("ATIVO" as LocatarioStatus),

    excluidoEm: params.excluidoEm ?? null,
    motivoExclusao: params.motivoExclusao ?? null,
    suspensoEm: params.suspensoEm ?? null,
    motivoSuspensao: params.motivoSuspensao ?? null,
    reativadoEm: params.reativadoEm ?? null,
    motivoReativacao: params.motivoReativacao ?? null,

    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
    configuracoes: configuracoesNormalizadas,
  };
}
