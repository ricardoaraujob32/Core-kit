import type { Permissao, ContextoExecucao } from "./locatario";
import { appError } from "./errors";
import { type Result } from "./result";
export declare function exigirPermissao(ctx: ContextoExecucao, permissao: Permissao): Result<void, ReturnType<typeof appError>>;
export declare function exigirTodas(ctx: ContextoExecucao, permissoesExigidas: Permissao[]): Result<void, ReturnType<typeof appError>>;
export declare function exigirAlguma(ctx: ContextoExecucao, permissoesExigidas: Permissao[]): Result<void, ReturnType<typeof appError>>;
//# sourceMappingURL=rbac.d.ts.map