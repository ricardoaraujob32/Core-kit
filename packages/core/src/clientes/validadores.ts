import { createErroApp, wrapOk } from "../kernel/index.js";
import type { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import type { ClienteId } from "./tipos.js";

export function validarLocatarioId(locatarioId: unknown): Result<LocatarioId, ErroApp> {
  if (typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "clientes.validarLocatarioId" } });
  }
  return wrapOk(locatarioId.trim() as LocatarioId);
}

export function validarClienteId(clienteId: unknown): Result<ClienteId, ErroApp> {
  if (typeof clienteId !== "string" || clienteId.trim().length === 0) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "Cliente inválido.", detalhes: { operacao: "clientes.validarClienteId" } });
  }
  return wrapOk(clienteId.trim() as ClienteId);
}

export function validarNomeCliente(nome: unknown): Result<string, ErroApp> {
  if (typeof nome !== "string" || nome.trim().length < 2) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "Nome do cliente deve conter ao menos 2 caracteres.", detalhes: { operacao: "clientes.validarNome" } });
  }
  return wrapOk(nome.trim());
}

export function validarEmailOpcional(email: unknown): Result<string | null, ErroApp> {
  if (email === undefined || email === null || email === "") return wrapOk(null);
  if (typeof email !== "string" || !email.includes("@")) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "E-mail inválido.", detalhes: { operacao: "clientes.validarEmail" } });
  }
  return wrapOk(email.trim().toLowerCase());
}

export function validarTextoOpcional(valor: unknown): Result<string | null, ErroApp> {
  if (valor === undefined || valor === null || valor === "") return wrapOk(null);
  if (typeof valor !== "string") {
    return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "clientes.validarTextoOpcional" } });
  }
  return wrapOk(valor.trim() || null);
}
