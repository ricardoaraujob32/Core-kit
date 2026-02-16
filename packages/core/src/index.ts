/**
 * API pública do core Kit
 * Tudo que é exportado aqui é considerado estável
 */

export * from "./result";
export * from "./erros";
export * from "./locatario";
export * from "./rbac";

// --- Usuários (exports explícitos para evitar conflito de nomes) ---
export type { Usuario, NovoUsuario, StatusUsuario } from "./usuarios/tipos";

export type { RepositorioUsuarios} from "./usuarios/portasRepositorio";

export { createUsuariosMemoryRepo } from "./usuarios/repositorioMemoria";

export { criarUsuario } from "./usuarios/usecases/criarUsuario";
export { listarUsuarios } from "./usuarios/usecases/listarUsuarios";

export type { Assinatura, StatusAssinatura, AssinaturaId, PlanoId } from "./assinaturas/tipos";
export type { RepositorioAssinaturas } from "./assinaturas/portasRepositorio";

export type { ContextoExecucao, CriarContextoExecucaoParams } from "./contextoExecucao";
export { criarContextoExecucao, isContextoExecucao, temUsuario, normalizarPermissoes, normalizarPapeis, normalizarRelogio, comPermissoes, comPapeis } from "./contextoExecucao";


