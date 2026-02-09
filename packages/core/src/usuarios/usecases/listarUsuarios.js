/**
 * Arquivo: packages/core/src/usuarios/usecases/listarUsuarios.ts
 * Finalidade: Caso de uso para listar usuários do locatário atual.
 */
import { err, ok } from "../../result";
import { appError } from "../../errors";
export async function listarUsuarios(contextoExecucao, dependencias) {
    const locatarioId = contextoExecucao.locatarioId;
    if (!locatarioId) {
        return err(appError("UNAUTHORIZED", "Locatário ausente no contexto."));
    }
    const usuarios = await dependencias.repositorioUsuarios.listarUsuarios(locatarioId);
    return ok(usuarios);
}
//# sourceMappingURL=listarUsuarios.js.map