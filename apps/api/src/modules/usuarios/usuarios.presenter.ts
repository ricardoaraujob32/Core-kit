// apps/api/src/modules/usuarios/usuarios.presenter.ts

import type { Usuario } from "@core-kit/core";
import type { ListarUsuariosResponseDto, UsuarioResponseDto } from "./usuarios.dto.js";

/**
 * 
 * @param usuario 
 * @returns 
 */
export function toUsuarioResponseDto(usuario: Usuario): UsuarioResponseDto["item"] {
  return {
    usuarioId: usuario.usuarioId,
    locatarioId: usuario.locatarioId,
    email: usuario.email,
    nome: usuario.nome,
    status: usuario.status,
    ultimoLoginEm: usuario.ultimoLoginEm,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
    excluidoEm: usuario.excluidoEm,
  };
}

/**
 * 
 * @param itens 
 * @returns 
 */
export function toListarUsuariosResponseDto(itens: Usuario[]): ListarUsuariosResponseDto["itens"] {
  return itens.map(toUsuarioResponseDto);
}