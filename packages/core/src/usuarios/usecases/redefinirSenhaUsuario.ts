// packages/core/src/usuarios/usecases/redefinirSenhaUsuario.ts

import { executarEmTransacao, HashPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { UsuariosRepositorio } from "../portasRepositorio";
import type { RedefinirSenhaUsuarioInput, RedefinirSenhaUsuarioOutput, RedefinirSenhaUsuarioResult } from "../tipos";
import { validarSenhaUsuario } from "../validadores";
import { autorizarUsuario, PoliticaSegurancaUsuariosPorta } from "../politicas";
import { exigirEstadoOperacionalUsuario } from "../maquinaEstados";
import { obterUsuarioObrigatorio } from "./helpers";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnRedefinirSenhaUsuario(deps: {
  usuariosRepositorio: UsuariosRepositorio;
  hashPorta: HashPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaUsuariosPorta;
}) {
  /**
   * 
   */
  return async function redefinirSenhaUsuario(input: RedefinirSenhaUsuarioInput): RedefinirSenhaUsuarioResult {
    const novaSenha = validarSenhaUsuario(input.novaSenha);
    if (!novaSenha.ok) return novaSenha;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await obterUsuarioObrigatorio({
        usuariosRepositorio: deps.usuariosRepositorio,
        locatarioId: input.locatarioId,
        usuarioId: input.usuarioId,
      });
      if (!atual.ok) return atual;

      const autorizacao = await autorizarUsuario(deps, {
        operacao: "USUARIO_REDEFINIR_SENHA",
        locatarioId: atual.value.locatarioId,
        usuarioId: atual.value.usuarioId,
        usuario: atual.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      const operacional = exigirEstadoOperacionalUsuario(atual.value);
      if (!operacional.ok) return operacional;

      const novoHash = await deps.hashPorta.gerarHash(novaSenha.value);

      const persistencia = await deps.usuariosRepositorio.atualizarSenha({
        locatarioId: input.locatarioId,
        usuarioId: atual.value.usuarioId,
        senhaHash: novoHash,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!persistencia.ok) return persistencia;

      return wrapOk<RedefinirSenhaUsuarioOutput>({
        usuarioId: atual.value.usuarioId,
      });
    });
  };
}
