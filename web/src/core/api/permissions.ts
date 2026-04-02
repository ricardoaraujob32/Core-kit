/**
 * Ajuste estes nomes para o catálogo canônico de permissoes.ts assim que ele for exposto ao frontend.
 * Por enquanto, estes códigos refletem as duas áreas administrativas iniciais da alfa.
 */
export const PERMISSIONS = {
  PLATFORM_ADMIN: "PLATAFORMA_ADMIN",
  TENANT_ADMIN: "LOCATARIO_ADMIN",
  LOCATARIOS_LISTAR: "LOCATARIOS_LISTAR",
  LOCATARIOS_OBTER: "LOCATARIOS_OBTER",
  USUARIOS_LISTAR: "USUARIOS_LISTAR",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
