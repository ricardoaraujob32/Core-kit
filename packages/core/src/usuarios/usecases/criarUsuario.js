/**
 * Arquivo: packages/core/src/usuarios/usecases/criarUsuario.ts
 * Finalidade: Caso de uso para criar um usuário no locatário atual.
 */
import { err, ok } from "../../result";
import { appError } from "../../errors";
import { nomeValido, normalizeNome } from "../validators";
export async function criarUsuario(contextoExecucao, dependencias, entrada) {
    const locatarioId = contextoExecucao.locatarioId;
    if (!locatarioId) {
        return err(appError("UNAUTHORIZED", "Locatário ausente no contexto."));
    }
    const nome = normalizeNome(entrada.nome);
    if (!nomeValido(nome)) {
        return err(appError("VALIDATION", "Nome inválido."));
    }
    const usuarioExistente = await dependencias.repositorioUsuarios.buscarUsuarioPorNome(locatarioId, nome);
    if (usuarioExistente) {
        return err(appError("CONFLICT", "Usuário já existe."));
    }
    const usuario = {
        id: dependencias.gerarIdentificadorUsuario(),
        nome,
        status: "ATIVO",
    };
    await dependencias.repositorioUsuarios.criarUsuario(locatarioId, usuario);
    return ok(usuario);
}
//# sourceMappingURL=criarUsuario.js.map