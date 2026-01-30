/**
 * Arquivo: packages/core/src/usuarios/repositorioUsuarios.ts
 * Finalidade: Definir o contrato (porta) de persistência de usuários no domínio.
 *
 * Observações:
 * - Este contrato é multi-locatário: todo acesso a usuário exige locatarioId.
 * - Implementações concretas (Prisma, memória, etc.) ficam fora do domínio.
 */

import type { LocatarioId } from "../locatario";
import type { Usuario } from "./types";

export interface RepositorioUsuarios {
  criarUsuario(locatarioId: LocatarioId, usuario: Usuario): Promise<void>;
  buscarUsuarioPorNome(locatarioId: LocatarioId, nome: string): Promise<Usuario | null>;
  listarUsuarios(locatarioId: LocatarioId): Promise<Usuario[]>;
}
