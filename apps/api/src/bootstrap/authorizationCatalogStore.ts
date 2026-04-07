//

import type { ModuloBootstrap, PapelBootstrap, PermissaoBootstrap, CatalogoAutorizacaoBootstrap} from "@core-kit/core";

type AuthorizationCatalogSnapshot = {
  permissoes: Map<string, PermissaoBootstrap>;
  papeis: Map<string, PapelBootstrap>;
  modulos: Map<string, ModuloBootstrap>;
  carregadoEm: Date | null;
};

function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

/**
 * Store em memória do catálogo global de autorização.
 *
 * Observação:
 * - mantém somente catálogo estável;
 * - não armazena vínculos por usuário/locatário;
 * - pode ser recarregada integralmente via `replace`.
 */
export class AuthorizationCatalogStore {
  private snapshot: AuthorizationCatalogSnapshot = {
    permissoes: new Map(),
    papeis: new Map(),
    modulos: new Map(),
    carregadoEm: null,
  };

  replace(catalogo: CatalogoAutorizacaoBootstrap): void {
    const permissoes = new Map<string, PermissaoBootstrap>();
    const papeis = new Map<string, PapelBootstrap>();
    const modulos = new Map<string, ModuloBootstrap>();

    for (const permissao of catalogo.permissoes) {
      permissoes.set(normalizarCodigo(permissao.codigo), permissao);
    }

    for (const papel of catalogo.papeis) {
      papeis.set(normalizarCodigo(papel.codigo), papel);
    }

    for (const modulo of catalogo.modulos) {
      modulos.set(normalizarCodigo(modulo.codigo), modulo);
    }

    this.snapshot = {
      permissoes,
      papeis,
      modulos,
      carregadoEm: new Date(),
    };
  }

  clear(): void {
    this.snapshot = {
      permissoes: new Map(),
      papeis: new Map(),
      modulos: new Map(),
      carregadoEm: null,
    };
  }

  isReady(): boolean {
    return this.snapshot.carregadoEm !== null;
  }

  getLoadedAt(): Date | null {
    return this.snapshot.carregadoEm;
  }

  getPermissao(codigo: string): PermissaoBootstrap | null {
    return this.snapshot.permissoes.get(normalizarCodigo(codigo)) ?? null;
  }

  getPapel(codigo: string): PapelBootstrap | null {
    return this.snapshot.papeis.get(normalizarCodigo(codigo)) ?? null;
  }

  getModulo(codigo: string): ModuloBootstrap | null {
    return this.snapshot.modulos.get(normalizarCodigo(codigo)) ?? null;
  }

  listPermissoes(): PermissaoBootstrap[] {
    return Array.from(this.snapshot.permissoes.values());
  }

  listPapeis(): PapelBootstrap[] {
    return Array.from(this.snapshot.papeis.values());
  }

  listModulos(): ModuloBootstrap[] {
    return Array.from(this.snapshot.modulos.values());
  }

  toJSON() {
    return {
      permissoes: this.listPermissoes(),
      papeis: this.listPapeis(),
      modulos: this.listModulos(),
      carregadoEm: this.snapshot.carregadoEm,
    };
  }
}

export const authorizationCatalogStore = new AuthorizationCatalogStore();