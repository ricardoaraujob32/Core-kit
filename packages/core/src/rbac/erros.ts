import type { ErroApp } from "../erros";
import { wrapErr } from "../result";

export function permissaoInvalida(permissao: string) {
  return wrapErr<ErroApp>({
    codigo: "INVALIDO",
    mensagem: "Permissão inválida.",
    detalhes: { permissao },
  });
}

export function naoAutorizado(permissao: string) {
  return wrapErr<ErroApp>({
    codigo: "NAO_AUTORIZADO",
    mensagem: "Usuário não possui a permissão necessária.",
    detalhes: { permissao },
  });
}