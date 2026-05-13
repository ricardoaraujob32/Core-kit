// packages/core/__tests__/assinaturas/simulacros/assinaturasSimulacros.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type {
  AssinaturasModulosRepositorio,
  AssinaturasRepositorio,
  ModulosConsultaRepositorio,
  PlanosConsultaRepositorio,
} from "../../../src/assinaturas/portasRepositorio";
import type {
  Assinatura,
  AssinaturaId,
  ListarModulosGratisResult,
  ModuloHabilitadoAssinatura,
  PlanoId,
  RegistrarAssinaturaParams,
  RegistrarModuloAssinaturaParams,
  ValidarModuloExistenteResult,
  ValidarPlanoAtivoResult,
} from "../../../src/assinaturas/tipos";
import type { ModuloId } from "../../../src/modulos";
import {
  criarControleFalhasRepositorio,
  type FalhaSimuladaRepositorio,
} from "../../simulacroRepositorioFactory";

type OperacaoAssinaturas =
  | "criarAssinatura"
  | "atualizarAssinatura"
  | "buscarPorId"
  | "buscarAssinaturaAtivaPorLocatario";

type OperacaoAssinaturasModulos =
  | "vincularModulo"
  | "desvincularModulo"
  | "buscarModuloVinculado"
  | "listarModulosAtivosDaAssinatura";

type OperacaoPlanos = "validarPlanoAtivo";
type OperacaoModulos = "validarModuloAtivo" | "listarModulosGratis";

export type AssinaturasSimulacroRepositorio = AssinaturasRepositorio & {
  carregar(assinatura: Assinatura): void;
  carregarMuitas(assinaturas: Assinatura[]): void;
  dump(): Assinatura[];
  limpar(): void;
  simularFalha(
    operacao: OperacaoAssinaturas,
    falha?: FalhaSimuladaRepositorio,
  ): void;
  limparFalhas(): void;
};

function clonarAssinatura(assinatura: Assinatura): Assinatura {
  return {
    ...assinatura,
    iniciadaEm: new Date(assinatura.iniciadaEm),
    encerradaEm: assinatura.encerradaEm
      ? new Date(assinatura.encerradaEm)
      : null,
    criadaEm: new Date(assinatura.criadaEm),
    atualizadaEm: new Date(assinatura.atualizadaEm),
  };
}

export function criarAssinaturasSimulacroRepositorio(
  inicial: Assinatura[] = [],
): AssinaturasSimulacroRepositorio {
  const itens = new Map<AssinaturaId, Assinatura>();

  const falhas = criarControleFalhasRepositorio<OperacaoAssinaturas>({
    namespace: "teste.assinaturas",
    mensagemPadrao: "Falha simulada no repositório de assinaturas.",
  });

  const api: AssinaturasSimulacroRepositorio = {
    carregar(assinatura) {
      itens.set(assinatura.assinaturaId, clonarAssinatura(assinatura));
    },

    carregarMuitas(assinaturas) {
      for (const assinatura of assinaturas) api.carregar(assinatura);
    },

    dump() {
      return [...itens.values()].map(clonarAssinatura);
    },

    limpar() {
      itens.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async criarAssinatura(params: RegistrarAssinaturaParams) {
      if (falhas.possuiFalha("criarAssinatura")) {
        return wrapErr(falhas.erroFalha("criarAssinatura"));
      }

      const assinatura: Assinatura = {
        assinaturaId: params.assinaturaId ?? "ass-teste-1",
        locatarioId: params.locatarioId,
        planoId: params.planoId,
        status: params.status,
        iniciadaEm: params.iniciadaEm,
        encerradaEm: params.encerradaEm ?? null,
        criadaEm: params.criadaEm,
        atualizadaEm: params.atualizadaEm,
      };

      api.carregar(assinatura);

      return wrapOk(clonarAssinatura(assinatura));
    },

    async atualizarAssinatura(assinatura: Assinatura) {
      if (falhas.possuiFalha("atualizarAssinatura")) {
        return wrapErr(falhas.erroFalha("atualizarAssinatura"));
      }

      api.carregar(assinatura);

      return wrapOk(clonarAssinatura(assinatura));
    },

    async buscarPorId(assinaturaId: AssinaturaId) {
      if (falhas.possuiFalha("buscarPorId")) {
        return wrapErr(falhas.erroFalha("buscarPorId"));
      }

      const assinatura = itens.get(assinaturaId) ?? null;

      return wrapOk(assinatura ? clonarAssinatura(assinatura) : null);
    },

    async buscarAssinaturaAtivaPorLocatario(locatarioId: string) {
      if (falhas.possuiFalha("buscarAssinaturaAtivaPorLocatario")) {
        return wrapErr(
          falhas.erroFalha("buscarAssinaturaAtivaPorLocatario"),
        );
      }

      const assinatura =
        [...itens.values()].find(
          (item) =>
            item.locatarioId === locatarioId &&
            (item.status === "ATIVA" ||
              item.status === "SUSPENSA" ||
              item.status === "RASCUNHO"),
        ) ?? null;

      return wrapOk(assinatura ? clonarAssinatura(assinatura) : null);
    },
  };

  api.carregarMuitas(inicial);

  return api;
}

export type AssinaturasModulosSimulacroRepositorio =
  AssinaturasModulosRepositorio & {
    carregar(vinculo: ModuloHabilitadoAssinatura): void;
    carregarMuitos(vinculos: ModuloHabilitadoAssinatura[]): void;
    dump(): ModuloHabilitadoAssinatura[];
    limpar(): void;
    simularFalha(
      operacao: OperacaoAssinaturasModulos,
      falha?: FalhaSimuladaRepositorio,
    ): void;
    limparFalhas(): void;
  };

function chaveModulo(assinaturaId: AssinaturaId, moduloId: ModuloId) {
  return `${assinaturaId}::${moduloId}`;
}

function clonarVinculo(
  vinculo: ModuloHabilitadoAssinatura,
): ModuloHabilitadoAssinatura {
  return {
    ...vinculo,
    habilitadoEm: new Date(vinculo.habilitadoEm),
    desabilitadoEm: vinculo.desabilitadoEm
      ? new Date(vinculo.desabilitadoEm)
      : null,
  };
}

export function criarAssinaturasModulosSimulacroRepositorio(
  inicial: ModuloHabilitadoAssinatura[] = [],
): AssinaturasModulosSimulacroRepositorio {
  const itens = new Map<string, ModuloHabilitadoAssinatura>();

  const falhas =
    criarControleFalhasRepositorio<OperacaoAssinaturasModulos>({
      namespace: "teste.assinaturas.modulos",
      mensagemPadrao:
        "Falha simulada no repositório de módulos da assinatura.",
    });

  const api: AssinaturasModulosSimulacroRepositorio = {
    carregar(vinculo) {
      itens.set(
        chaveModulo(vinculo.assinaturaId, vinculo.moduloId),
        clonarVinculo(vinculo),
      );
    },

    carregarMuitos(vinculos) {
      for (const vinculo of vinculos) api.carregar(vinculo);
    },

    dump() {
      return [...itens.values()].map(clonarVinculo);
    },

    limpar() {
      itens.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async vincularModulo(params: RegistrarModuloAssinaturaParams) {
      if (falhas.possuiFalha("vincularModulo")) {
        return wrapErr(falhas.erroFalha("vincularModulo"));
      }

      const vinculo: ModuloHabilitadoAssinatura = {
        assinaturaId: params.assinaturaId,
        moduloId: params.moduloId,
        gratuito: params.gratuito,
        origem: params.origem,
        habilitadoEm: params.habilitadoEm,
        desabilitadoEm: params.desabilitadoEm ?? null,
      };

      api.carregar(vinculo);

      return wrapOk(clonarVinculo(vinculo));
    },

    async desvincularModulo(
      assinaturaId: AssinaturaId,
      moduloId: ModuloId,
      desabilitadoEm: Date,
    ) {
      if (falhas.possuiFalha("desvincularModulo")) {
        return wrapErr(falhas.erroFalha("desvincularModulo"));
      }

      const key = chaveModulo(assinaturaId, moduloId);
      const atual = itens.get(key);

      if (atual) {
        itens.set(key, clonarVinculo({ ...atual, desabilitadoEm }));
      }

      return wrapOk(undefined);
    },

    async buscarModuloVinculado(
      assinaturaId: AssinaturaId,
      moduloId: ModuloId,
    ) {
      if (falhas.possuiFalha("buscarModuloVinculado")) {
        return wrapErr(falhas.erroFalha("buscarModuloVinculado"));
      }

      const vinculo = itens.get(chaveModulo(assinaturaId, moduloId)) ?? null;

      return wrapOk(vinculo ? clonarVinculo(vinculo) : null);
    },

    async listarModulosAtivosDaAssinatura(assinaturaId: AssinaturaId) {
      if (falhas.possuiFalha("listarModulosAtivosDaAssinatura")) {
        return wrapErr(
          falhas.erroFalha("listarModulosAtivosDaAssinatura"),
        );
      }

      return wrapOk(
        [...itens.values()]
          .filter(
            (item) =>
              item.assinaturaId === assinaturaId &&
              item.desabilitadoEm === null,
          )
          .map(clonarVinculo),
      );
    },
  };

  api.carregarMuitos(inicial);

  return api;
}

export type PlanosConsultaSimulacroRepositorio =
  PlanosConsultaRepositorio & {
    carregarPlano(planoId: PlanoId, ativo?: boolean): void;
    limpar(): void;
    simularFalha(
      operacao: OperacaoPlanos,
      falha?: FalhaSimuladaRepositorio,
    ): void;
    limparFalhas(): void;
  };

export function criarPlanosConsultaSimulacroRepositorio(
  inicial: ValidarPlanoAtivoResult[] = [],
): PlanosConsultaSimulacroRepositorio {
  const planos = new Map<PlanoId, ValidarPlanoAtivoResult>();

  const falhas = criarControleFalhasRepositorio<OperacaoPlanos>({
    namespace: "teste.planos",
    mensagemPadrao: "Falha simulada no repositório de planos.",
  });

  const api: PlanosConsultaSimulacroRepositorio = {
    carregarPlano(planoId, ativo = true) {
      planos.set(planoId, { planoId, ativo });
    },

    limpar() {
      planos.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async validarPlanoAtivo(planoId: PlanoId) {
      if (falhas.possuiFalha("validarPlanoAtivo")) {
        return wrapErr(falhas.erroFalha("validarPlanoAtivo"));
      }

      return wrapOk(planos.get(planoId) ?? null);
    },
  };

  for (const plano of inicial) api.carregarPlano(plano.planoId, plano.ativo);

  return api;
}

export type ModulosConsultaSimulacroRepositorio =
  ModulosConsultaRepositorio & {
    carregarModulo(moduloId: ModuloId, ativo?: boolean): void;
    carregarModuloGratis(moduloId: ModuloId): void;
    limpar(): void;
    simularFalha(
      operacao: OperacaoModulos,
      falha?: FalhaSimuladaRepositorio,
    ): void;
    limparFalhas(): void;
  };

export function criarModulosConsultaSimulacroRepositorio(
  params: {
    modulos?: ValidarModuloExistenteResult[];
    gratis?: ListarModulosGratisResult[];
  } = {},
): ModulosConsultaSimulacroRepositorio {
  const modulos = new Map<ModuloId, ValidarModuloExistenteResult>();
  const gratis = new Set<ModuloId>();

  const falhas = criarControleFalhasRepositorio<OperacaoModulos>({
    namespace: "teste.modulos.consulta",
    mensagemPadrao:
      "Falha simulada no repositório de consulta de módulos.",
  });

  const api: ModulosConsultaSimulacroRepositorio = {
    carregarModulo(moduloId, ativo = true) {
      modulos.set(moduloId, { moduloId, ativo });
    },

    carregarModuloGratis(moduloId) {
      gratis.add(moduloId);

      if (!modulos.has(moduloId)) {
        modulos.set(moduloId, { moduloId, ativo: true });
      }
    },

    limpar() {
      modulos.clear();
      gratis.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async validarModuloAtivo(moduloId: ModuloId) {
      if (falhas.possuiFalha("validarModuloAtivo")) {
        return wrapErr(falhas.erroFalha("validarModuloAtivo"));
      }

      return wrapOk(modulos.get(moduloId) ?? null);
    },

    async listarModulosGratis() {
      if (falhas.possuiFalha("listarModulosGratis")) {
        return wrapErr(falhas.erroFalha("listarModulosGratis"));
      }

      return wrapOk([...gratis].map((moduloId) => ({ moduloId })));
    },
  };

  for (const modulo of params.modulos ?? []) {
    api.carregarModulo(modulo.moduloId, modulo.ativo);
  }

  for (const modulo of params.gratis ?? []) {
    api.carregarModuloGratis(modulo.moduloId);
  }

  return api;
}

export function criarAssinaturaTeste(
  params: Partial<Assinatura> = {},
): Assinatura {
  const criadaEm = params.criadaEm ?? new Date("2026-01-01T00:00:00.000Z");

  return {
    assinaturaId: params.assinaturaId ?? "ass-teste-1",
    locatarioId: params.locatarioId ?? "loc-teste-1",
    planoId: params.planoId ?? "plano-teste-1",
    status: params.status ?? "RASCUNHO",
    iniciadaEm: params.iniciadaEm ?? criadaEm,
    encerradaEm: params.encerradaEm ?? null,
    criadaEm,
    atualizadaEm: params.atualizadaEm ?? criadaEm,
  };
}

export function criarModuloAssinaturaTeste(
  params: Partial<ModuloHabilitadoAssinatura> = {},
): ModuloHabilitadoAssinatura {
  return {
    assinaturaId: params.assinaturaId ?? "ass-teste-1",
    moduloId: params.moduloId ?? "mod-teste-1",
    gratuito: params.gratuito ?? false,
    origem: params.origem ?? "ASSINATURA",
    habilitadoEm:
      params.habilitadoEm ?? new Date("2026-01-01T00:00:00.000Z"),
    desabilitadoEm: params.desabilitadoEm ?? null,
  };
}