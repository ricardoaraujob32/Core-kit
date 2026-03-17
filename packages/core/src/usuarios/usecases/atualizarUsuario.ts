import { validarEmailUsuario, validarNomeUsuario, validarUsuarioId } from "../validadores";
import { usuarioNaoEncontrado, emailUsuarioJaExiste } from "../erros";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { AtualizarUsuarioInput, ResultadoAtualizarUsuario } from "../tipos";
import type { RelogioPorta } from "../../utils";

export function createAtualizarUsuario(deps: {
  usuariosRepo: UsuariosRepositorio;
  relogio: RelogioPorta;
}) {
  return async function atualizarUsuario(
    input: AtualizarUsuarioInput,
  ): ResultadoAtualizarUsuario {
    const usuarioId = validarUsuarioId(input.usuarioId);
    if (!usuarioId.ok) return usuarioId;

    const atual = await deps.usuariosRepo.buscarPorId({
      usuarioId: usuarioId.value,
    });
    if (!atual.ok) return atual;
    if (!atual.value || atual.value.excluidoEm) {
      return usuarioNaoEncontrado(usuarioId.value);
    }

    let nome = atual.value.nome;
    let email = atual.value.email;

    if (input.nome !== undefined) {
      const nomeValidado = validarNomeUsuario(input.nome);
      if (!nomeValidado.ok) return nomeValidado;
      nome = nomeValidado.value;
    }

    if (input.email !== undefined) {
      const emailValidado = validarEmailUsuario(input.email);
      if (!emailValidado.ok) return emailValidado;

      const existente = await deps.usuariosRepo.buscarPorEmailNoLocatario({
        locatarioId: atual.value.locatarioId,
        emailNormalizado: emailValidado.value,
      });
      if (!existente.ok) return existente;

      if (existente.value && existente.value.usuarioId !== atual.value.usuarioId) {
        return emailUsuarioJaExiste(
          emailValidado.value,
          atual.value.locatarioId,
        );
      }

      email = emailValidado.value;
    }

    return deps.usuariosRepo.atualizar({
      ...atual.value,
      nome,
      email,
      atualizadoEm: deps.relogio.agora(),
    });
  };
}