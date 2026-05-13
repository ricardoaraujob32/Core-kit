// packages/core/__tests__/auditoria/simulacros/auditoriaSimulacroRepositorio.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type { AuditoriaLocatarioRepositorio, AuditoriaPlataformaRepositorio } from "../../../src/auditoria/portasRepositorio";
import type { EventoAuditoriaLocatario, EventoAuditoriaPlataforma, RegistrarEventoAuditoriaLocatarioInput,
  RegistrarEventoAuditoriaPlataformaInput } from "../../../src/auditoria/tipos";
import { criarControleFalhasRepositorio, type FalhaSimuladaRepositorio } from "../../simulacroRepositorioFactory";

type Operacao = "registrarEvento" | "listarEventos";

function clonarLocatario(evento: EventoAuditoriaLocatario): EventoAuditoriaLocatario {
  return {
    ...evento,
    criadoEm: new Date(evento.criadoEm),
    metadados: { ...evento.metadados },
  };
}

function clonarPlataforma(evento: EventoAuditoriaPlataforma): EventoAuditoriaPlataforma {
  return {
    ...evento,
    criadoEm: new Date(evento.criadoEm),
    metadados: { ...evento.metadados },
  };
}

export type AuditoriaLocatarioSimulacroRepositorio =
  AuditoriaLocatarioRepositorio & {
    carregar(evento: EventoAuditoriaLocatario): void;
    carregarMuitos(eventos: EventoAuditoriaLocatario[]): void;
    dump(): EventoAuditoriaLocatario[];
    limpar(): void;
    simularFalha(operacao: Operacao, falha?: FalhaSimuladaRepositorio): void;
    limparFalhas(): void;
  };

export type AuditoriaPlataformaSimulacroRepositorio =
  AuditoriaPlataformaRepositorio & {
    carregar(evento: EventoAuditoriaPlataforma): void;
    carregarMuitos(eventos: EventoAuditoriaPlataforma[]): void;
    dump(): EventoAuditoriaPlataforma[];
    limpar(): void;
    simularFalha(operacao: Operacao, falha?: FalhaSimuladaRepositorio): void;
    limparFalhas(): void;
  };

export function criarAuditoriaLocatarioSimulacroRepositorio(
  inicial: EventoAuditoriaLocatario[] = [],
): AuditoriaLocatarioSimulacroRepositorio {
  const eventos = new Map<string, EventoAuditoriaLocatario>();
  const falhas = criarControleFalhasRepositorio<Operacao>({
    namespace: "teste.auditoria.locatario",
    mensagemPadrao: "Falha simulada no repositório de auditoria de locatário.",
  });

  const api: AuditoriaLocatarioSimulacroRepositorio = {
    carregar(evento) {
      eventos.set(evento.auditoriaId, clonarLocatario(evento));
    },

    carregarMuitos(lista) {
      for (const evento of lista) api.carregar(evento);
    },

    dump() {
      return [...eventos.values()].map(clonarLocatario);
    },

    limpar() {
      eventos.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async registrarEvento(input: RegistrarEventoAuditoriaLocatarioInput) {
      if (falhas.possuiFalha("registrarEvento")) {
        return wrapErr(falhas.erroFalha("registrarEvento"));
      }

      const evento: EventoAuditoriaLocatario = {
        auditoriaId: `aud-loc-${eventos.size + 1}`,
        locatarioId: input.locatarioId,
        usuarioId: input.usuarioId ?? null,
        evento: input.evento,
        categoria: input.categoria ?? "OPERACAO",
        sucesso: input.sucesso,
        erroCodigo: input.erroCodigo ?? null,
        erroMensagem: input.erroMensagem ?? null,
        entidadeNome: input.entidadeNome ?? null,
        entidadeTipo: input.entidadeTipo ?? null,
        entidadeId: input.entidadeId ?? null,
        origem: input.origem ?? "API",
        requisicaoId: input.requisicaoId ?? null,
        enderecoIp: input.enderecoIp ?? null,
        agenteUsuario: input.agenteUsuario ?? null,
        agenteTipo: input.agenteTipo ?? null,
        metadados: input.metadados ?? {},
        criadoEm: new Date("2026-03-12T10:00:00.000Z"),
      };

      api.carregar(evento);
      return wrapOk(clonarLocatario(evento));
    },

    async listarEventos(input) {
      if (falhas.possuiFalha("listarEventos")) {
        return wrapErr(falhas.erroFalha("listarEventos"));
      }

      const limite = input.limite ?? 100;

      return wrapOk(
        [...eventos.values()]
          .filter((e) => e.locatarioId === input.locatarioId)
          .filter((e) => !input.usuarioId || e.usuarioId === input.usuarioId)
          .filter((e) => !input.evento || e.evento === input.evento)
          .filter((e) => !input.eventoPrefixo || e.evento.startsWith(input.eventoPrefixo))
          .filter((e) => !input.categoria || e.categoria === input.categoria)
          .filter((e) => input.sucesso === undefined || e.sucesso === input.sucesso)
          .filter((e) => !input.entidadeTipo || e.entidadeTipo === input.entidadeTipo)
          .filter((e) => !input.entidadeId || e.entidadeId === input.entidadeId)
          .filter((e) => !input.criadoDe || e.criadoEm >= input.criadoDe)
          .filter((e) => !input.criadoAte || e.criadoEm <= input.criadoAte)
          .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
          .slice(0, limite)
          .map(clonarLocatario),
      );
    },
  };

  api.carregarMuitos(inicial);
  return api;
}

export function criarAuditoriaPlataformaSimulacroRepositorio(
  inicial: EventoAuditoriaPlataforma[] = [],
): AuditoriaPlataformaSimulacroRepositorio {
  const eventos = new Map<string, EventoAuditoriaPlataforma>();
  const falhas = criarControleFalhasRepositorio<Operacao>({
    namespace: "teste.auditoria.plataforma",
    mensagemPadrao: "Falha simulada no repositório de auditoria de plataforma.",
  });

  const api: AuditoriaPlataformaSimulacroRepositorio = {
    carregar(evento) {
      eventos.set(evento.auditoriaId, clonarPlataforma(evento));
    },

    carregarMuitos(lista) {
      for (const evento of lista) api.carregar(evento);
    },

    dump() {
      return [...eventos.values()].map(clonarPlataforma);
    },

    limpar() {
      eventos.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async registrarEvento(input: RegistrarEventoAuditoriaPlataformaInput) {
      if (falhas.possuiFalha("registrarEvento")) {
        return wrapErr(falhas.erroFalha("registrarEvento"));
      }

      const evento: EventoAuditoriaPlataforma = {
        auditoriaId: `aud-plat-${eventos.size + 1}`,
        superadminUsuarioId: input.superadminUsuarioId ?? null,
        locatarioAlvoId: input.locatarioAlvoId ?? null,
        usuarioId: input.superadminUsuarioId ?? null,
        evento: input.evento,
        categoria: input.categoria ?? "OPERACAO",
        sucesso: input.sucesso,
        erroCodigo: input.erroCodigo ?? null,
        erroMensagem: input.erroMensagem ?? null,
        entidadeNome: input.entidadeNome ?? null,
        entidadeTipo: input.entidadeTipo ?? null,
        entidadeId: input.entidadeId ?? null,
        origem: input.origem ?? "API",
        requisicaoId: input.requisicaoId ?? null,
        enderecoIp: input.enderecoIp ?? null,
        agenteUsuario: input.agenteUsuario ?? null,
        agenteTipo: input.agenteTipo ?? null,
        metadados: input.metadados ?? {},
        criadoEm: new Date("2026-03-12T10:00:00.000Z"),
      };

      api.carregar(evento);
      return wrapOk(clonarPlataforma(evento));
    },

    async listarEventos(input) {
      if (falhas.possuiFalha("listarEventos")) {
        return wrapErr(falhas.erroFalha("listarEventos"));
      }

      const limite = input.limite ?? 100;

      return wrapOk(
        [...eventos.values()]
          .filter((e) => !input.superadminUsuarioId || e.superadminUsuarioId === input.superadminUsuarioId)
          .filter((e) => !input.locatarioAlvoId || e.locatarioAlvoId === input.locatarioAlvoId)
          .filter((e) => !input.evento || e.evento === input.evento)
          .filter((e) => !input.eventoPrefixo || e.evento.startsWith(input.eventoPrefixo))
          .filter((e) => !input.categoria || e.categoria === input.categoria)
          .filter((e) => input.sucesso === undefined || e.sucesso === input.sucesso)
          .filter((e) => !input.entidadeTipo || e.entidadeTipo === input.entidadeTipo)
          .filter((e) => !input.entidadeId || e.entidadeId === input.entidadeId)
          .filter((e) => !input.criadoDe || e.criadoEm >= input.criadoDe)
          .filter((e) => !input.criadoAte || e.criadoEm <= input.criadoAte)
          .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
          .slice(0, limite)
          .map(clonarPlataforma),
      );
    },
  };

  api.carregarMuitos(inicial);
  return api;
}

export function criarEventoAuditoriaLocatarioTeste(
  params: Partial<EventoAuditoriaLocatario> = {},
): EventoAuditoriaLocatario {
  return {
    auditoriaId: params.auditoriaId ?? "aud-loc-1",
    locatarioId: params.locatarioId ?? "loc-1",
    usuarioId: params.usuarioId ?? "usr-1",
    evento: params.evento ?? "usuario.criado",
    categoria: params.categoria ?? "OPERACAO",
    sucesso: params.sucesso ?? true,
    erroCodigo: params.erroCodigo ?? null,
    erroMensagem: params.erroMensagem ?? null,
    entidadeNome: params.entidadeNome ?? null,
    entidadeTipo: params.entidadeTipo ?? "usuario",
    entidadeId: params.entidadeId ?? "usr-1",
    origem: params.origem ?? "API",
    requisicaoId: params.requisicaoId ?? null,
    enderecoIp: params.enderecoIp ?? null,
    agenteUsuario: params.agenteUsuario ?? null,
    agenteTipo: params.agenteTipo ?? null,
    metadados: params.metadados ?? {},
    criadoEm: params.criadoEm ?? new Date("2026-03-12T10:00:00.000Z"),
  };
}

export function criarEventoAuditoriaPlataformaTeste(
  params: Partial<EventoAuditoriaPlataforma> = {},
): EventoAuditoriaPlataforma {
  return {
    auditoriaId: params.auditoriaId ?? "aud-plat-1",
    superadminUsuarioId: params.superadminUsuarioId ?? "super-1",
    locatarioAlvoId: params.locatarioAlvoId ?? null,
    usuarioId: params.usuarioId ?? params.superadminUsuarioId ?? "super-1",
    evento: params.evento ?? "plataforma.locatario.listado",
    categoria: params.categoria ?? "OPERACAO",
    sucesso: params.sucesso ?? true,
    erroCodigo: params.erroCodigo ?? null,
    erroMensagem: params.erroMensagem ?? null,
    entidadeNome: params.entidadeNome ?? null,
    entidadeTipo: params.entidadeTipo ?? "locatario",
    entidadeId: params.entidadeId ?? "loc-1",
    origem: params.origem ?? "API",
    requisicaoId: params.requisicaoId ?? null,
    enderecoIp: params.enderecoIp ?? null,
    agenteUsuario: params.agenteUsuario ?? null,
    agenteTipo: params.agenteTipo ?? "SUPERADMIN",
    metadados: params.metadados ?? {},
    criadoEm: params.criadoEm ?? new Date("2026-03-12T10:00:00.000Z"),
  };
}