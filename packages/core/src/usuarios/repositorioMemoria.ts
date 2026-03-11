// import { wrapOk } from "../result";
import { wrapOk } from "../result";
import type { UsuariosRepositorio } from "./portasRepositorio";
import type { Usuario, UsuarioStatus } from "./tipos";

function keyById(locatarioId: string, usuarioId: string) {
  return `${locatarioId}:${usuarioId}`;
}

function keyByEmail(locatarioId: string, email: string) {
  return `${locatarioId}:${email.toLowerCase()}`;
}

export function criarUsuariosRepositorioMemoria(
  seed?: Usuario[]
): UsuariosRepositorio & {
  seed(usuario: Usuario): void;
  dump(): Usuario[];
} {
  const byId = new Map<string, Usuario>();
  const byEmail = new Map<string, Usuario>();

  const api = {
    seed(usuario: Usuario) {
      const clone = { ...usuario };
      byId.set(keyById(usuario.locatarioId ?? "", usuario.usuarioId), clone);
      byEmail.set(
        keyByEmail(usuario.locatarioId ?? "", usuario.email),
        clone
      );
    },

    dump() {
      return [...byId.values()]
        .map((u) => ({ ...u }))
        .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime());
    },

    async criar(params: {
      locatarioId: string;
      email: string;
      senhaHash: string;
      status: UsuarioStatus;
    }) {
      const usuarioId = `usr-${byId.size + 1}`;
      const novo: Usuario = {
        usuarioId,
        locatarioId: params.locatarioId,
        email: params.email,
        senhaHash: params.senhaHash,
        status: params.status,
        criadoEm: new Date("2026-01-01T00:00:00.000Z"),
        ultimoLoginEm: null,
      };

      api.seed(novo);

      return wrapOk({ usuarioId });
    },

    async buscarPorId(params: { locatarioId: string; usuarioId: string }) {
      const found =
        byId.get(keyById(params.locatarioId, params.usuarioId)) ?? null;
      return wrapOk(found ? { ...found } : null);
    },

    async buscarPorEmail(params: { locatarioId: string; email: string }) {
      const found =
        byEmail.get(keyByEmail(params.locatarioId, params.email)) ?? null;
      return wrapOk(found ? { ...found } : null);
    },

    async listar(params: {
      locatarioId: string;
      limite: number;
      cursor?: string;
    }) {
      const itens = [...byId.values()]
        .filter((u) => u.locatarioId === params.locatarioId)
        .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime())
        .slice(0, params.limite)
        .map((u) => ({ ...u }));

      return wrapOk(itens);
    },

    async atualizarUltimoLogin(params: {
      locatarioId: string;
      usuarioId: string;
      quando: Date;
    }) {
      const key = keyById(params.locatarioId, params.usuarioId);
      const found = byId.get(key);

      if (!found) {
        return wrapOk<void>(undefined);
      }

      const atualizado: Usuario = {
        ...found,
        ultimoLoginEm: params.quando,
      };

      byId.set(key, atualizado);
      byEmail.set(keyByEmail(params.locatarioId, atualizado.email), atualizado);

      return wrapOk<void>(undefined);
    },
  };

  for (const item of seed ?? []) {
    api.seed(item);
  }

  return api;
}

export function criarUsuarioSeed(params: {
  usuarioId: string;
  locatarioId: string;
  email: string;
  senhaHash: string;
  status?: UsuarioStatus;
  criadoEm?: Date;
  ultimoLoginEm?: Date | null;
}): Usuario {
  return {
    usuarioId: params.usuarioId,
    locatarioId: params.locatarioId,
    email: params.email.toLowerCase(),
    senhaHash: params.senhaHash,
    status: params.status ?? "ATIVO",
    criadoEm: params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z"),
    ultimoLoginEm: params.ultimoLoginEm ?? null,
  };
}