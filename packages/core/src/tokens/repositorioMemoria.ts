// import { wrapOk } from "../result";
import { LocatarioId } from "../locatarios/tipos";
import { wrapOk } from "../result";
import { UsuarioId } from "../usuarios";
import type { TokensRepositorio } from "./portasRepositorio";
import type { TokenId, TokenPersistido } from "./tipos";

function keyById(locatarioId: LocatarioId, tokenId: TokenId) {
  return `${locatarioId}:${tokenId}`;
}

function keyByHash(locatarioId: LocatarioId, hashToken: string) {
  return `${locatarioId}:${hashToken}`;
}

export function criarTokensRepositorioMemoria(seed?: TokenPersistido[]): 
TokensRepositorio & {
  seed(token: TokenPersistido): void;
  dump(): TokenPersistido[];
} {
  const byId = new Map<string, TokenPersistido>();
  const byHash = new Map<string, TokenPersistido>();

  const api = {
    seed(token: TokenPersistido) {
      const clone = { ...token };
      byId.set(keyById(token.locatarioId, token.tokenId), clone);
      byHash.set(keyByHash(token.locatarioId, token.hashToken), clone);
    },

    dump() {
      return [...byId.values()].map((t) => ({ ...t }));
    },

    async inserir(token: TokenPersistido) {
      api.seed(token);
      return wrapOk<void>(undefined);
    },

    async buscarPorHash(params: { locatarioId: LocatarioId; hashToken: string }) {
      const found =
        byHash.get(keyByHash(params.locatarioId, params.hashToken)) ?? null;
      return wrapOk(found ? { ...found } : null);
    },

    async buscarPorId(params: { locatarioId: LocatarioId; tokenId: TokenId }) {
      const found =
        byId.get(keyById(params.locatarioId, params.tokenId)) ?? null;
      return wrapOk(found ? { ...found } : null);
    },

    async revogar(params: {
      locatarioId: LocatarioId;
      tokenId: TokenId;
      revogadoPor: UsuarioId;
      revogadoEm: Date;
      motivo?: string;
    }) {
      const idKey = keyById(params.locatarioId, params.tokenId);
      const token = byId.get(idKey);

      if (!token) {
        return wrapOk<void>(undefined);
      }

      const atualizado: TokenPersistido = {
        ...token,
        revogadoEm: params.revogadoEm,
      };

      byId.set(idKey, atualizado);
      byHash.set(
        keyByHash(params.locatarioId, atualizado.hashToken),
        atualizado
      );

      return wrapOk<void>(undefined);
    },

    async encadearRotacao(params: {
      locatarioId: LocatarioId;
      tokenAntigoId: TokenId;
      tokenAntigoUsuarioId: UsuarioId;
      tokenNovoId: TokenId;
      tokenNovoUsuarioId: UsuarioId;
    }) {
      const idKey = keyById(params.locatarioId, params.tokenAntigoId);
      const token = byId.get(idKey);

      if (!token) {
        return wrapOk<void>(undefined);
      }

      const atualizado: TokenPersistido = {
        ...token,
        proximoTokenId: params.tokenNovoId,
        proximoUsuarioId: params.tokenNovoUsuarioId,
      };

      byId.set(idKey, atualizado);
      byHash.set(
        keyByHash(params.locatarioId, atualizado.hashToken),
        atualizado
      );

      return wrapOk<void>(undefined);
    },
  };

  for (const item of seed ?? []) {
    api.seed(item);
  }

  return api;
}