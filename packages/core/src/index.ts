/**
 * API pública do core Kit
 * Tudo que é exportado aqui é considerado estável
 */

export * from "./result";
export * from "./errors";
export * from "./locatario";
export * from "./rbac";

// --- Usuários (exports explícitos para evitar conflito de nomes) ---
export type {
  IdUsuario,
  Usuario,
  NovoUsuario,
  StatusUsuario,
} from "./usuarios/types";

export type { UsuariosRepo } from "./usuarios/repo";

export { createUsuariosMemoryRepo } from "./usuarios/memoryRepo";

export { criarUsuario } from "./usuarios/usecases/criarUsuario";
export { listarUsuarios } from "./usuarios/usecases/listarUsuarios";

