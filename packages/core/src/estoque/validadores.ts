import { erroApp, type ErroApp } from "../erros";
import type { NovoItem, NovoMovimentoEstoque } from "./tipos";

export function validarNovoItem(novoItem: NovoItem): ErroApp | null {
  const nome = novoItem.nome?.trim() ?? "";
  const unidade = novoItem.unidade?.trim() ?? "";

  if (!nome) return erroApp("INVALIDO", "Nome do item é obrigatório.");
  if (!unidade) return erroApp("INVALIDO", "Unidade do item é obrigatória.");

  if (novoItem.tipoItem !== "PRODUTO" && novoItem.tipoItem !== "SERVICO") {
    return erroApp("INVALIDO", "Tipo de item inválido.");
  }

  return null;
}

export function validarNovoMovimentoEstoque(m: NovoMovimentoEstoque): ErroApp | null {
  if (!m.itemId) return erroApp("INVALIDO", "Item é obrigatório.");

  if (m.tipo !== "ENTRADA" && m.tipo !== "SAIDA" && m.tipo !== "AJUSTE") {
    return erroApp("INVALIDO", "Tipo de movimento inválido.");
  }

  if (!Number.isFinite(m.delta) || m.delta === 0) {
    return erroApp("INVALIDO", "Delta inválido.");
  }

  if (m.tipo === "ENTRADA" && m.delta <= 0) return erroApp("INVALIDO", "Entrada exige delta positivo.");
  if (m.tipo === "SAIDA" && m.delta >= 0) return erroApp("INVALIDO", "Saída exige delta negativo.");

  return null;
}
