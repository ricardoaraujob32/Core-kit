/**
 * Arquivo: packages/core/src/usuarios/usecases/criarUsuario.ts
 * Finalidade: Caso de uso para criar um usuário no locatário atual.
 */
import type { Result } from "../../result";
import { type AppError } from "../../errors";
import type { ContextoExecucao } from "../../locatario";
import type { RepositorioUsuarios } from "../repositorioUsuarios";
import type { NovoUsuario, Usuario } from "../types";
export type DependenciasCriarUsuario = {
    repositorioUsuarios: RepositorioUsuarios;
    gerarIdentificadorUsuario: () => string;
};
export declare function criarUsuario(contextoExecucao: ContextoExecucao, dependencias: DependenciasCriarUsuario, entrada: NovoUsuario): Promise<Result<Usuario, AppError>>;
//# sourceMappingURL=criarUsuario.d.ts.map