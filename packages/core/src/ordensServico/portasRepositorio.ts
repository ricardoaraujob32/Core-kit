import type { ErroApp, Result } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { ClienteId } from "../clientes/index.js";
import type { TransacaoId } from "../vendas/index.js";
import type { OrdemServico, OrdemServicoId, StatusOrdemServico } from "./tipos.js";

export type RegistrarOrdemServicoParams = {
  locatarioId: LocatarioId;
  clienteId?: ClienteId | null;
  titulo: string;
  descricao?: string | null;
};

export type AtualizarOrdemServicoParams = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
  clienteId?: ClienteId | null;
  titulo?: string;
  descricao?: string | null;
};

export type ListarOrdensServicoParams = {
  locatarioId: LocatarioId;
  status?: StatusOrdemServico;
  clienteId?: ClienteId | null;
  cursor?: OrdemServicoId;
  limite?: number;
};

export type CriarVendaDaOrdemServicoParams = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
  clienteId?: ClienteId | null;
  valorTotal: number;
  vencimentoEm: Date;
  observacao?: string | null;
};

export interface OrdensServicoRepositorio {
  criar(params: RegistrarOrdemServicoParams): Promise<Result<OrdemServico, ErroApp>>;
  listar(params: ListarOrdensServicoParams): Promise<Result<OrdemServico[], ErroApp>>;
  buscarPorId(params: { locatarioId: LocatarioId; ordemServicoId: OrdemServicoId }): Promise<Result<OrdemServico | null, ErroApp>>;
  atualizar(params: AtualizarOrdemServicoParams): Promise<Result<OrdemServico, ErroApp>>;
  atualizarStatus(params: { locatarioId: LocatarioId; ordemServicoId: OrdemServicoId; status: StatusOrdemServico; fechadaEm?: Date | null }): Promise<Result<OrdemServico, ErroApp>>;
  buscarVendaVinculada(params: { locatarioId: LocatarioId; ordemServicoId: OrdemServicoId }): Promise<Result<{ transacaoId: TransacaoId } | null, ErroApp>>;
  criarVendaDaOrdemServico(params: CriarVendaDaOrdemServicoParams): Promise<Result<{ transacaoId: TransacaoId }, ErroApp>>;
}
