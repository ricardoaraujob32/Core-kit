import type { ErroApp } from "./erros";
import type { Result } from "./result";
import { wrapOk, wrapErr } from "./result";
import { createErroApp } from "./ROPHelpers";

export interface IdPorta {
  gerarId(): string;
}

export interface RelogioPorta {
  agora(): Date;
}

export interface HashPorta {
  gerarHash(textoPlano: string): Promise<string>;
  comparar(textoPlano: string, hash: string): Promise<boolean>;
}

export interface TokenPorta {
  assinar(payload: Record<string, unknown>): Promise<string>;
  verificar(token: string): Promise<Record<string, unknown>>;
}

export interface TransacaoPorta {
  executar<T>(fn: () => Promise<T>): Promise<T>;
}

function erroValidacao(campo: string, valor?: unknown): Result<never, ErroApp> {
  return createErroApp({
    codigo: "VALIDACAO_UTIL_INVALIDA",
    mensagem: "Validação transversal inválida.",
    detalhes: { campo, valor },
  });
}

export function validarTextoObrigatorio(valor: string, campo: string, tamanhoMinimo = 1): Result<string, ErroApp> {
  if (typeof valor !== "string") {
    return erroValidacao(campo, valor);
  }

  const trim = valor.trim();

  if (trim.length < tamanhoMinimo) {
    return erroValidacao(campo, valor);
  }

  return wrapOk(trim);
}

export function validarIdGenerico(valor: string, campo: string): Result<string, ErroApp> {
  return validarTextoObrigatorio(valor, campo, 1);
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validarEmail(email: string, campo = "email"): Result<string, ErroApp> {
  if (typeof email !== "string") {
    return erroValidacao(campo, email);
  }

  const normalizado = normalizarEmail(email);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(normalizado)) {
    return erroValidacao(campo, email);
  }

  return wrapOk(normalizado);
}

export function validarData( valor: Date,
  campo: string,
): Result<Date, ErroApp> {
  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    return erroValidacao(campo, valor);
  }

  return wrapOk(valor);
}

export function validarNumeroPositivo(
  valor: number,
  campo: string,
): Result<number, ErroApp> {
  if (!Number.isFinite(valor) || valor <= 0) {
    return erroValidacao(campo, valor);
  }

  return wrapOk(valor);
}