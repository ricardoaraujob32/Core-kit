/**
 * Arquivo: packages/core/src/usuarios/usecases/listarUsuarios.ts
 * Finalidade: Caso de uso para listar usuários do locatário atual.
 */
import type { Result } from "../../result";
import { type AppError } from "../../errors";
import type { ContextoExecucao } from "../../locatario";
import type { RepositorioUsuarios } from "../repositorioUsuarios";
import type { Usuario } from "../types";
export type DependenciasListarUsuarios = {
    repositorioUsuarios: RepositorioUsuarios;
};
export declare function listarUsuarios(contextoExecucao: ContextoExecucao, dependencias: DependenciasListarUsuarios): Promise<Result<Usuario[], AppError>>;
//# sourceMappingURL=listarUsuarios.d.ts.map