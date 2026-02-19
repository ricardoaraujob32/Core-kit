/**
 * Arquivo: packages/core/src/usuarios/repositorioMemoria.ts
 * Finalidade: Implementação em memória de RepositorioUsuarios (para testes e desenvolvimento local).
 */

import type { RepositorioUsuarios } from "./portasRepositorio";
import type { Usuario, NovoUsuario, UsuarioId } from "./tipos";

type RegistroUsuario = Usuario;

export function criarRepositorioUsuariosEmMemoria(): RepositorioUsuarios {
  const registros: RegistroUsuario[] = [];
  let sequencia = 1;

  function agora(): Date {
    return new Date();
  }

  function novoId(): UsuarioId {
    // simples e determinístico p/ testes
    return `usr_${sequencia++}`;
  }

  return {
    async obterPorId(locatarioId, id) {
      const u = registros.find((r) => r.locatarioId === locatarioId && r.id === id);
      return u ?? null;
    },

    async obterPorNome(locatarioId, nome) {
      const u = registros.find((r) => r.locatarioId === locatarioId && r.nome === nome);
      return u ?? null;
    },

    async listar(locatarioId) {
      return registros.filter((r) => r.locatarioId === locatarioId);
    },

    async criar(dados: NovoUsuario) {
      const now = agora();
      const usuario: Usuario = {
        id: novoId(),
        locatarioId: dados.locatarioId,
        nome: dados.nome,
        status: "ATIVO",
        criadoEm: now,
        atualizadoEm: now,
      };

      registros.push(usuario);
      return usuario;
    },
  };
}
