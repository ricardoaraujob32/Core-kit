// packages/core/src/usuarios/validators.ts
export function nomeValido(nome) {
    const n = nome.trim();
    return n.length >= 3 && n.length <= 120;
}
export function normalizeNome(nome) {
    return nome.trim().replace(/\s+/g, " ");
}
//# sourceMappingURL=validators.js.map