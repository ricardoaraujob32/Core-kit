/**
 * Arquivo: packages/core/src/usuarios/memoryRepo.ts
 * Finalidade: Implementação em memória de RepositorioUsuarios (para testes e desenvolvimento local).
 * Observação: Mantém os mesmos nomes e assinaturas do contrato (interface) para não quebrar DI.
 */
export function criarRepositorioUsuariosEmMemoria() {
    const registros = [];
    return {
        async criarUsuario(locatarioId, usuario) {
            registros.push({ locatarioId, usuario });
        },
        async buscarUsuarioPorNome(locatarioId, nome) {
            const encontrado = registros.find((r) => r.locatarioId === locatarioId && r.usuario.nome === nome);
            return encontrado ? encontrado.usuario : null;
        },
        async listarUsuarios(locatarioId) {
            return registros.filter((r) => r.locatarioId === locatarioId).map((r) => r.usuario);
        },
    };
}
//# sourceMappingURL=memoryRepo.js.map