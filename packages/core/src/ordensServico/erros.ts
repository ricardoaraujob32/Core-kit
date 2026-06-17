import { createErroApp, type ErroApp, type Result } from "../kernel/index.js";
import type { OrdemServicoId } from "./tipos.js";

export function ordemServicoInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
  return createErroApp({ codigo: "INVALIDO", mensagem: "Dados da ordem de serviço são inválidos.", detalhes });
}

export function ordemServicoNaoEncontrada(ordemServicoId: OrdemServicoId): Result<never, ErroApp> {
  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Ordem de serviço não encontrada.", detalhes: { ordemServicoId } });
}

export function ordemServicoTransicaoInvalida(ordemServicoId: OrdemServicoId, statusAtual: string, evento: string): Result<never, ErroApp> {
  return createErroApp({ codigo: "INVALIDO", mensagem: "Transição de status da ordem de serviço inválida.", detalhes: { ordemServicoId, statusAtual, evento } });
}

export function ordemServicoNaoConcluida(ordemServicoId: OrdemServicoId): Result<never, ErroApp> {
  return createErroApp({ codigo: "INVALIDO", mensagem: "Somente ordem de serviço concluída pode gerar venda.", detalhes: { ordemServicoId } });
}

export function ordemServicoVendaJaGerada(ordemServicoId: OrdemServicoId): Result<never, ErroApp> {
  return createErroApp({ codigo: "CONFLITO", mensagem: "Esta ordem de serviço já possui venda vinculada.", detalhes: { ordemServicoId } });
}
