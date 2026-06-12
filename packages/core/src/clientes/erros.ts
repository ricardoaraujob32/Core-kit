import { createErroApp } from "../kernel/index.js";
import type { ClienteId } from "./tipos.js";

export function clienteNaoEncontrado(clienteId: ClienteId) {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Cliente não encontrado.", detalhes: { operacao: "clientes.naoEncontrado", clienteId } });
}

export function clienteInativo(clienteId: ClienteId) {
  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Cliente inativo não pode ser utilizado.", detalhes: { operacao: "clientes.inativo", clienteId } });
}
