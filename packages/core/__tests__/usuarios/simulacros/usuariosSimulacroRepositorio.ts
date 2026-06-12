// packages/core/__tests__/usuarios/simulacros/usuariosSimulacroRepositorio.ts

import { wrapOk, wrapErr } from "../../../src/kernel";
import type { UsuariosRepositorio } from "../../../src/usuarios/portasRepositorio";
import type { StatusUsuario, Usuario, UsuarioId } from "../../../src/usuarios/tipos";
import type { LocatarioId } from "../../../src/locatarios";
import { criarControleFalhasRepositorio, type FalhaSimuladaRepositorio } from "../../simulacroRepositorioFactory";

type Operacao =
  | "criar"
  | "atualizar"
  | "buscarPorId"
  | "buscarPorEmailNoLocatario"
  | "listarPorLocatario"
  | "atualizarSenha"
  | "atualizarUltimoLogin";

export type UsuariosSimulacroRepositorio = UsuariosRepositorio & {
  carregar(usuario: Usuario): void;
  carregarMuitos(usuarios: Usuario[]): void;
  dump(): Usuario[];
  limpar(): void;
  simularFalha(operacao: Operacao, falha?: FalhaSimuladaRepositorio): void;
  limparFalhas(): void;
};

function clonar(usuario: Usuario): Usuario {
  return {
    ...usuario,
    ultimoLoginEm: usuario.ultimoLoginEm ? new Date(usuario.ultimoLoginEm) : null,
    criadoEm: new Date(usuario.criadoEm),
    atualizadoEm: new Date(usuario.atualizadoEm),
    excluidoEm: usuario.excluidoEm ? new Date(usuario.excluidoEm) : null,
  };
}

export function criarUsuariosSimulacroRepositorio(
  inicial: Usuario[] = [],
): UsuariosSimulacroRepositorio {
  const porId = new Map<string, Usuario>();

  const falhas = criarControleFalhasRepositorio<Operacao>({
    namespace: "teste.usuarios",
    mensagemPadrao: "Falha simulada no repositório de usuários.",
  });

  const api: UsuariosSimulacroRepositorio = {
    carregar(usuario) {
      porId.set(usuario.usuarioId, clonar(usuario));
    },

    carregarMuitos(usuarios) {
      for (const usuario of usuarios) {
        api.carregar(usuario);
      }
    },

    dump() {
      return [...porId.values()].map(clonar);
    },

    limpar() {
      porId.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async criar(params: Parameters<UsuariosRepositorio["criar"]>[0]) {
      if (falhas.possuiFalha("criar")) {
        return wrapErr(falhas.erroFalha("criar"));
      }

      const usuario: Usuario = {
        usuarioId: params.usuarioId,
        locatarioId: params.locatarioId,
        email: params.email.toLowerCase(),
        nome: params.nome,
        senhaHash: params.senhaHash,
        status: params.status,
        ultimoLoginEm: params.ultimoLoginEm,
        criadoEm: params.criadoEm,
        atualizadoEm: params.atualizadoEm,
        excluidoEm: params.excluidoEm,
      };

      api.carregar(usuario);

      return wrapOk({
        usuarioId: params.usuarioId,
      });
    },

    async atualizar(usuario: Parameters<UsuariosRepositorio["atualizar"]>[0]) {
      if (falhas.possuiFalha("atualizar")) {
        return wrapErr(falhas.erroFalha("atualizar"));
      }

      api.carregar(usuario);

      return wrapOk(clonar(usuario));
    },

    async buscarPorId(params: Parameters<UsuariosRepositorio["buscarPorId"]>[0]) {
      if (falhas.possuiFalha("buscarPorId")) {
        return wrapErr(falhas.erroFalha("buscarPorId"));
      }

      const usuario =
        [...porId.values()].find(
          (item) =>
            item.usuarioId === params.usuarioId &&
            item.locatarioId === params.locatarioId,
        ) ?? null;

      return wrapOk(usuario ? clonar(usuario) : null);
    },

    async buscarPorEmailNoLocatario(
      params: Parameters<UsuariosRepositorio["buscarPorEmailNoLocatario"]>[0],
    ) {
      if (falhas.possuiFalha("buscarPorEmailNoLocatario")) {
        return wrapErr(falhas.erroFalha("buscarPorEmailNoLocatario"));
      }

      const email = params.emailNormalizado.toLowerCase();

      const usuario =
        [...porId.values()].find(
          (item) =>
            item.locatarioId === params.locatarioId &&
            item.excluidoEm === null &&
            item.email.toLowerCase() === email,
        ) ?? null;

      return wrapOk(usuario ? clonar(usuario) : null);
    },

    async listarPorLocatario(
      params: Parameters<UsuariosRepositorio["listarPorLocatario"]>[0],
    ) {
      if (falhas.possuiFalha("listarPorLocatario")) {
        return wrapErr(falhas.erroFalha("listarPorLocatario"));
      }

      return wrapOk(
        [...porId.values()]
          .filter(
            (item) =>
              item.locatarioId === params.locatarioId &&
              item.excluidoEm === null,
          )
          .map(clonar)
          .sort((a, b) => a.nome.localeCompare(b.nome)),
      );
    },

    async atualizarSenha(params: Parameters<UsuariosRepositorio["atualizarSenha"]>[0]) {
      if (falhas.possuiFalha("atualizarSenha")) {
        return wrapErr(falhas.erroFalha("atualizarSenha"));
      }

      const atual =
        [...porId.values()].find(
          (item) =>
            item.usuarioId === params.usuarioId &&
            item.locatarioId === params.locatarioId,
        ) ?? null;

      if (atual) {
        api.carregar({
          ...atual,
          senhaHash: params.senhaHash,
          atualizadoEm: params.atualizadoEm,
        });
      }

      return wrapOk(undefined);
    },

    async atualizarUltimoLogin(
      params: Parameters<UsuariosRepositorio["atualizarUltimoLogin"]>[0],
    ) {
      if (falhas.possuiFalha("atualizarUltimoLogin")) {
        return wrapErr(falhas.erroFalha("atualizarUltimoLogin"));
      }

      const atual =
        [...porId.values()].find(
          (item) =>
            item.usuarioId === params.usuarioId &&
            item.locatarioId === params.locatarioId,
        ) ?? null;

      if (atual) {
        api.carregar({
          ...atual,
          ultimoLoginEm: params.quando,
          atualizadoEm: params.quando,
        });
      }

      return wrapOk(undefined);
    },
  };

  api.carregarMuitos(inicial);

  return api;
}

export function criarUsuarioTeste(
  params: Partial<Usuario> & {
    usuarioId?: UsuarioId;
    locatarioId?: LocatarioId;
    status?: StatusUsuario;
  } = {},
): Usuario {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");

  return {
    usuarioId: params.usuarioId ?? "usr-teste-1",
    locatarioId: params.locatarioId ?? "loc-teste-1",
    email: (params.email ?? "usuario.teste@example.com").toLowerCase(),
    nome: params.nome ?? "Usuário Teste",
    senhaHash: params.senhaHash ?? "hash_senha_atual",
    status: params.status ?? "ATIVO",
    ultimoLoginEm: params.ultimoLoginEm ?? null,
    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
    excluidoEm: params.excluidoEm ?? null,
  };
}