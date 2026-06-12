// packages/core/src/clientes/usecases/atualizarCliente.ts

import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import type { ClientesRepositorio } from "../portasRepositorio.js";
import type { AtualizarClienteInput, AtualizarClienteOutput, AtualizarClienteResult } from "../tipos.js";
import { clienteNaoEncontrado } from "../erros.js";
import { validarClienteId, validarEmailOpcional, validarLocatarioId, validarNomeCliente, validarTextoOpcional } from "../validadores.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtualizarCliente(deps: { clientesRepositorio: ClientesRepositorio; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  /**
   * 
   */
  return async function atualizarCliente(input: AtualizarClienteInput): AtualizarClienteResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const clienteId = validarClienteId(input.clienteId); if (!clienteId.ok) return clienteId;
    
    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.clientesRepositorio.buscarPorId({ locatarioId: locatarioId.value, clienteId: clienteId.value });
      if (!atual.ok) return atual;
      if (!atual.value) return clienteNaoEncontrado(clienteId.value);

      const nome = input.nome === undefined ? null : validarNomeCliente(input.nome); 
      if (nome && !nome.ok) return nome;

      const documento = input.documento === undefined ? null : validarTextoOpcional(input.documento); 
      if (documento && !documento.ok) return documento;

      const email = input.email === undefined ? null : validarEmailOpcional(input.email); 
      if (email && !email.ok) return email;

      const telefone = input.telefone === undefined ? null : validarTextoOpcional(input.telefone); 
      if (telefone && !telefone.ok) return telefone;

      const atualizado = await deps.clientesRepositorio.atualizar({ 
        ...atual.value, nome: nome ? nome.value : atual.value.nome, documento: documento ? documento.value : atual.value.documento, email: email ? email.value : atual.value.email, telefone: telefone ? telefone.value : atual.value.telefone, atualizadoEm: deps.relogio.agora() 
      });
      
      if (!atualizado.ok) return atualizado;
        return wrapOk<AtualizarClienteOutput>({ cliente: atualizado.value });
      });
  };
}
