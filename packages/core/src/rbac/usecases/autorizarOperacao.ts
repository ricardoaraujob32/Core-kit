import type { ResultadoAutorizarOperacao, AutorizarOperacaoInput } from "../tipos";
import { wrapOk } from "../../result";
import { naoAutorizado } from "../erros";
import { validarPermissao } from "../validadores";
import { exigirUsuario, normalizarPermissoes } from "../../rbac";

export function autorizarOperacao(
  input: AutorizarOperacaoInput
): ResultadoAutorizarOperacao {
  const permissaoValida = validarPermissao(input.permissao);
  if (!permissaoValida.ok) return permissaoValida;

  const ctxAutenticado = exigirUsuario(input.ctx);
  if (!ctxAutenticado.ok) return ctxAutenticado;

  const permissoes = normalizarPermissoes(input.ctx);
  const possui = permissoes.includes(permissaoValida.value);

  if (!possui) {
    return naoAutorizado(permissaoValida.value);
  }

  return wrapOk(undefined);
}