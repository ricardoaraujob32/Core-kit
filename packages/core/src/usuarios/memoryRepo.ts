/**
 * Arquivo: packages/core/src/usuarios/memoryRepo.ts
 * Finalidade: Implementação em memória de RepositorioUsuarios (para testes e desenvolvimento local).
 * Observação: Mantém os mesmos nomes e assinaturas do contrato (interface) para não quebrar DI.
 */

import type { RepositorioUsuarios } from "./repositorioUsuarios";
import type { LocatarioId } from "../locatario";
import type { Usuario } from "./types";

type RegistroUsuario = {
  locatarioId: LocatarioId;
  usuario: Usuario;
};

export function criarRepositorioUsuariosEmMemoria(): RepositorioUsuarios {
  const registros: RegistroUsuario[] = [];

  return {
    async criarUsuario(locatarioId: LocatarioId, usuario: Usuario): Promise<void> {
      registros.push({ locatarioId, usuario });
    },

    async buscarUsuarioPorNome(locatarioId: LocatarioId, nome: string): Promise<Usuario | null> {
      const encontrado = registros.find(
        (r) => r.locatarioId === locatarioId && r.usuario.nome === nome,
      );
      return encontrado ? encontrado.usuario : null;
    },

    async listarUsuarios(locatarioId: LocatarioId): Promise<Usuario[]> {
      return registros.filter((r) => r.locatarioId === locatarioId).map((r) => r.usuario);
    },
  };
}
