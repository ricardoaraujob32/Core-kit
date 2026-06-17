import { createErroApp, type ErroApp, type Result, wrapOk } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { OrdemServicoId, StatusOrdemServico } from "./tipos.js";

export function validarLocatarioId(v: unknown): Result<LocatarioId, ErroApp> {
  if (typeof v === "string" && v.trim()) return wrapOk(v.trim());
  return createErroApp({ codigo: "INVALIDO", mensagem: "Locatário inválido.", detalhes: { campo: "locatarioId" } });
}

export function validarOrdemServicoId(v: unknown): Result<OrdemServicoId, ErroApp> {
  if (typeof v === "string" && v.trim()) return wrapOk(v.trim());
  return createErroApp({ codigo: "INVALIDO", mensagem: "Ordem de serviço inválida.", detalhes: { campo: "ordemServicoId" } });
}

export function validarTitulo(v: unknown): Result<string, ErroApp> {
  if (typeof v === "string" && v.trim().length >= 3) return wrapOk(v.trim());
  return createErroApp({ codigo: "INVALIDO", mensagem: "Título da ordem de serviço é obrigatório e deve ter ao menos 3 caracteres.", detalhes: { campo: "titulo" } });
}

export function validarDescricao(v: unknown): Result<string | null, ErroApp> {
  if (v === undefined || v === null) return wrapOk(null);
  if (typeof v === "string") return wrapOk(v.trim() || null);
  return createErroApp({ codigo: "INVALIDO", mensagem: "Descrição inválida.", detalhes: { campo: "descricao" } });
}

export function validarStatusOrdemServico(v: unknown): Result<StatusOrdemServico | undefined, ErroApp> {
  if (v === undefined || v === null || v === "") return wrapOk(undefined);
  const allowed = ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO", "CONCLUIDA", "CANCELADA"] as const;
  if (typeof v === "string" && (allowed as readonly string[]).includes(v)) return wrapOk(v as StatusOrdemServico);
  return createErroApp({ codigo: "INVALIDO", mensagem: "Status da ordem de serviço inválido.", detalhes: { campo: "status" } });
}

export function validarValorTotal(v: unknown): Result<number, ErroApp> {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isFinite(n) && n >= 0) return wrapOk(n);
  return createErroApp({ codigo: "INVALIDO", mensagem: "Valor total inválido.", detalhes: { campo: "valorTotal" } });
}
