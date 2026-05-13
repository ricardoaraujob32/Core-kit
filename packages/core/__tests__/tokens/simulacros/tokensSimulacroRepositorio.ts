// packages/core/__tests__/tokens/simulacros/tokensSimulacroRepositorio.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type { TokensRepositorio } from "../../../src/tokens/portasRepositorio";
import type { TokenId, TokenPersistido, TokenTipo } from "../../../src/tokens/tipos";
import type { LocatarioId } from "../../../src/locatarios";
import type { UsuarioId } from "../../../src/usuarios";
import { criarControleFalhasRepositorio, type FalhaSimuladaRepositorio } from "../../simulacroRepositorioFactory";

type OperacaoTokens =
  | "criar"
  | "atualizar"
  | "buscarPorId"
  | "buscarPorHash"
  | "listarPorUsuario"
  | "inserir"
  | "revogar";

export type TokensSimulacroRepositorio = TokensRepositorio & {
  carregar(token: TokenPersistido): void;
  carregarMuitos(tokens: TokenPersistido[]): void;
  dump(): TokenPersistido[];
  limpar(): void;
  simularFalha(operacao: OperacaoTokens, falha?: FalhaSimuladaRepositorio): void;
  limparFalhas(): void;
};

function clonarToken(token: TokenPersistido): TokenPersistido {
  return {
    ...token,
    emitidoEm: new Date(token.emitidoEm),
    expiraEm: new Date(token.expiraEm),
    revogadoEm: token.revogadoEm ? new Date(token.revogadoEm) : null,
  };
}

export function criarTokensSimulacroRepositorio(
  inicial: TokenPersistido[] = [],
): TokensSimulacroRepositorio {
  const porId = new Map<string, TokenPersistido>();
  const falhas = criarControleFalhasRepositorio<OperacaoTokens>({
    namespace: "teste.tokens",
    mensagemPadrao: "Falha simulada no repositório de tokens.",
  });

  const api: TokensSimulacroRepositorio = {
    carregar(token) {
      porId.set(token.tokenId, clonarToken(token));
    },

    carregarMuitos(tokens) {
      for (const token of tokens) api.carregar(token);
    },

    dump() {
      return [...porId.values()].map(clonarToken);
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

    async criar(params: Parameters<TokensRepositorio["criar"]>[0]) {
      if (falhas.possuiFalha("criar")) return wrapErr(falhas.erroFalha("criar"));

      const token: TokenPersistido = {
        tokenId: params.tokenId,
        usuarioId: params.usuarioId,
        locatarioId: params.locatarioId,
        hashToken: params.hashToken,
        tipo: params.tipo,
        emitidoEm: params.emitidoEm,
        expiraEm: params.expiraEm,
        revogadoEm: params.revogadoEm,
        proximoTokenId: params.proximoTokenId,
        agenteUsuario: params.agenteUsuario,
        enderecoIp: params.enderecoIp,
      };

      api.carregar(token);
      return wrapOk({ tokenId: params.tokenId });
    },

    async atualizar(token: Parameters<TokensRepositorio["atualizar"]>[0]) {
      if (falhas.possuiFalha("atualizar")) return wrapErr(falhas.erroFalha("atualizar"));
      api.carregar(token);
      return wrapOk(clonarToken(token));
    },

    async buscarPorId(params: Parameters<TokensRepositorio["buscarPorId"]>[0]) {
      if (falhas.possuiFalha("buscarPorId")) return wrapErr(falhas.erroFalha("buscarPorId"));

      const token =
        [...porId.values()].find(
          (item) =>
            item.tokenId === params.tokenId &&
            item.usuarioId === params.usuarioId &&
            item.locatarioId === params.locatarioId,
        ) ?? null;

      return wrapOk(token ? clonarToken(token) : null);
    },

    async buscarPorHash(params: Parameters<TokensRepositorio["buscarPorHash"]>[0]) {
      if (falhas.possuiFalha("buscarPorHash")) return wrapErr(falhas.erroFalha("buscarPorHash"));

      const token =
        [...porId.values()].find(
          (item) =>
            item.hashToken === params.hashToken &&
            item.usuarioId === params.usuarioId &&
            item.locatarioId === params.locatarioId,
        ) ?? null;

      return wrapOk(token ? clonarToken(token) : null);
    },

    async listarPorUsuario(params: Parameters<TokensRepositorio["listarPorUsuario"]>[0]) {
      if (falhas.possuiFalha("listarPorUsuario")) return wrapErr(falhas.erroFalha("listarPorUsuario"));

      return wrapOk(
        [...porId.values()]
          .filter(
            (item) =>
              item.usuarioId === params.usuarioId &&
              item.locatarioId === params.locatarioId,
          )
          .map(clonarToken)
          .sort((a, b) => b.emitidoEm.getTime() - a.emitidoEm.getTime()),
      );
    },

    async inserir(params: Parameters<TokensRepositorio["inserir"]>[0]) {
      if (falhas.possuiFalha("inserir")) {
        return wrapErr(falhas.erroFalha("inserir"));
      }

      api.carregar(params);

      return wrapOk(undefined);
    },

    async revogar(params: Parameters<TokensRepositorio["revogar"]>[0]) {
      if (falhas.possuiFalha("revogar")) {
        return wrapErr(falhas.erroFalha("revogar"));
      }

      const token =
        [...porId.values()].find(
          (item) =>
            item.tokenId === params.tokenId &&
            item.locatarioId === params.locatarioId,
        ) ?? null;

      if (token) {
        api.carregar({
          ...token,
          revogadoEm: params.revogadoEm,
        });
      }

      return wrapOk(undefined);
    },
  };

  api.carregarMuitos(inicial);
  return api;
}

export function criarTokenTeste(
  params: Partial<TokenPersistido> & {
    tokenId?: TokenId;
    usuarioId?: UsuarioId;
    locatarioId?: LocatarioId;
    tipo?: TokenTipo;
  } = {},
): TokenPersistido {
  return {
    tokenId: params.tokenId ?? "tok-teste-1",
    usuarioId: params.usuarioId ?? "usr-teste-1",
    locatarioId: params.locatarioId ?? "loc-teste-1",
    hashToken: params.hashToken ?? "hash-token-teste-1",
    tipo: params.tipo ?? "ACESSO",
    emitidoEm: params.emitidoEm ?? new Date("2026-01-01T00:00:00.000Z"),
    expiraEm: params.expiraEm ?? new Date("2026-12-31T00:00:00.000Z"),
    revogadoEm: params.revogadoEm ?? null,
    proximoTokenId: params.proximoTokenId ?? null,
    agenteUsuario: params.agenteUsuario ?? null,
    enderecoIp: params.enderecoIp ?? null,
  };
}