// apps/web/src/shared/pwa/pwaScope.ts

export type PwaScopePerfil = "tenant" | "plataforma" | "anonimo";

export type PwaScope = {
  perfil: PwaScopePerfil;
  locatarioId?: string | null;
  usuarioId?: string | null;
};

export const PWA_ANON_SCOPE: PwaScope = {
  perfil: "anonimo",
  locatarioId: null,
  usuarioId: null,
};

export function serializePwaScope(scope: PwaScope): string {
  return [
    scope.perfil,
    scope.locatarioId ?? "sem-locatario",
    scope.usuarioId ?? "sem-usuario",
  ].join(":");
}

export function buildPwaCacheKey(scope: PwaScope, key: string): string {
  return `${serializePwaScope(scope)}:${key}`;
}
