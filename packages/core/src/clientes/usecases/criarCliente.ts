// packages/core/src/clientes/usecases/criarCliente.ts

import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
import type { ClientesRepositorio } from "../portasRepositorio";
import type { CriarClienteInput, CriarClienteOutput, CriarClienteResult } from "../tipos";
import { validarEmailOpcional, validarLocatarioId, validarNomeCliente, validarTextoOpcional } from "../validadores";

export function createFnCriarCliente(deps: { clientesRepositorio: ClientesRepositorio; idPorta: IdPorta; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function criarCliente(input: CriarClienteInput): CriarClienteResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const nome = validarNomeCliente(input.nome); if (!nome.ok) return nome;
    const documento = validarTextoOpcional(input.documento); if (!documento.ok) return documento;
    const email = validarEmailOpcional(input.email); if (!email.ok) return email;
    const telefone = validarTextoOpcional(input.telefone); if (!telefone.ok) return telefone;
    return executarEmTransacao(deps.transacao, async () => {
      const agora = deps.relogio.agora();
      const clienteId = deps.idPorta.gerarId();
      const res = await deps.clientesRepositorio.criar({ clienteId, locatarioId: locatarioId.value, nome: nome.value, documento: documento.value, email: email.value, telefone: telefone.value, status: "ATIVO", criadoEm: agora, atualizadoEm: agora, excluidoEm: null, excluidoPor: null, excluidoMotivo: null });
      if (!res.ok) return res;
      return wrapOk<CriarClienteOutput>({ clienteId: res.value.clienteId });
    });
  };
}
