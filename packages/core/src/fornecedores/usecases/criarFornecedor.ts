import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel/index.js";
import type { FornecedoresRepositorio } from "../portasRepositorio.js";
import type { CriarFornecedorInput, CriarFornecedorOutput, CriarFornecedorResult } from "../tipos.js";
import { validarEmailOpcional, validarLocatarioId, validarNomeFornecedor, validarTextoOpcional } from "../validadores.js";

export function createFnCriarFornecedor(deps: { fornecedoresRepositorio: FornecedoresRepositorio; idPorta: IdPorta; relogio: RelogioPorta; transacao?: TransacaoPorta }) {
  return async function criarFornecedor(input: CriarFornecedorInput): CriarFornecedorResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const nome = validarNomeFornecedor(input.nome); if (!nome.ok) return nome;
    const documento = validarTextoOpcional(input.documento); if (!documento.ok) return documento;
    const email = validarEmailOpcional(input.email); if (!email.ok) return email;
    const telefone = validarTextoOpcional(input.telefone); if (!telefone.ok) return telefone;
    return executarEmTransacao(deps.transacao, async () => {
      const agora = deps.relogio.agora();
      const fornecedorId = deps.idPorta.gerarId();
      const res = await deps.fornecedoresRepositorio.criar({ fornecedorId, locatarioId: locatarioId.value, nome: nome.value, documento: documento.value, email: email.value, telefone: telefone.value, status: "ATIVO", criadoEm: agora, atualizadoEm: agora, excluidoEm: null, excluidoPor: null, excluidoMotivo: null });
      if (!res.ok) return res;
      return wrapOk<CriarFornecedorOutput>({ fornecedorId: res.value.fornecedorId });
    });
  };
}
