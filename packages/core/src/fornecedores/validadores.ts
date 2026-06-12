// packages/core/src/fornecedores/validadores.ts

import { createErroApp, wrapOk } from "../kernel";
import type { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import type { FornecedorId } from "./tipos";

export function validarLocatarioId(locatarioId: unknown): Result<LocatarioId, ErroApp> {
  if (typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "fornecedors.validarLocatarioId" } });
  }
  return wrapOk(locatarioId.trim() as LocatarioId);
}

export function validarFornecedorId(fornecedorId: unknown): Result<FornecedorId, ErroApp> {
  if (typeof fornecedorId !== "string" || fornecedorId.trim().length === 0) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "Fornecedor inválido.", detalhes: { operacao: "fornecedors.validarFornecedorId" } });
  }
  return wrapOk(fornecedorId.trim() as FornecedorId);
}

export function validarNomeFornecedor(nome: unknown): Result<string, ErroApp> {
  if (typeof nome !== "string" || nome.trim().length < 2) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "Nome do fornecedor deve conter ao menos 2 caracteres.", detalhes: { operacao: "fornecedors.validarNome" } });
  }
  return wrapOk(nome.trim());
}

export function validarEmailOpcional(email: unknown): Result<string | null, ErroApp> {
  if (email === undefined || email === null || email === "") return wrapOk(null);
  if (typeof email !== "string" || !email.includes("@")) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "E-mail inválido.", detalhes: { operacao: "fornecedors.validarEmail" } });
  }
  return wrapOk(email.trim().toLowerCase());
}

export function validarTextoOpcional(valor: unknown): Result<string | null, ErroApp> {
  if (valor === undefined || valor === null || valor === "") return wrapOk(null);
  if (typeof valor !== "string") {
    return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "fornecedors.validarTextoOpcional" } });
  }
  return wrapOk(valor.trim() || null);
}
