import { wrapOk } from "../../kernel/result";
import type {
  AutorizarOperacaoInput,
  ResultadoAutorizarOperacao,
} from "../tipos";
import { naoAutorizado } from "../erros";
import { exigirUsuario, normalizarPermissoes } from "../helpers";
import { validarPermissao } from "../validadores";

export function autorizarOperacao(input: AutorizarOperacaoInput): ResultadoAutorizarOperacao {
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