import type { ErroApp, Result } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { ClienteId } from "../clientes/index.js";
import type { ProdutoId } from "../produtos/index.js";
import type { TransacaoId } from "../vendas/index.js";
import type { OrdemServico, OrdemServicoId, StatusOrdemServico } from "./tipos.js";

export type RegistrarOrdemServicoParams = {
  locatarioId: LocatarioId;
  clienteId?: ClienteId | null;
  servicoId?: ProdutoId | null;
  titulo: string;
  descricao?: string | null;
};

export type AtualizarOrdemServicoParams = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
  clienteId?: ClienteId | null;
  servicoId?: ProdutoId | null;
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

export type BuscarOrdemServicoParams = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
};

export type AtualizarStatusOrdemServicoParams = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
  status: StatusOrdemServico;
  fechadaEm?: Date | null;
};

export type CriarVendaDaOrdemServicoParams = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
  clienteId?: ClienteId | null;
  produtoId: ProdutoId;
  valorTotal: number;
  vencimentoEm: Date;
  observacao?: string | null;
  descricaoItem?: string | null;
  quantidade: number;
  valorUnitario: number;
  valorSubtotal: number;
  valorDesconto: number;
  valorTotalItem: number;
  movimentaEstoque: boolean;
};

export interface OrdensServicoRepositorio {
  criar(params: RegistrarOrdemServicoParams): Promise<Result<OrdemServico, ErroApp>>;
  listar(params: ListarOrdensServicoParams): Promise<Result<OrdemServico[], ErroApp>>;
  buscarPorId(params: BuscarOrdemServicoParams): Promise<Result<OrdemServico | null, ErroApp>>;
  atualizar(params: AtualizarOrdemServicoParams): Promise<Result<OrdemServico, ErroApp>>;
  atualizarStatus(params: AtualizarStatusOrdemServicoParams): Promise<Result<OrdemServico, ErroApp>>;
  buscarVendaVinculada(params: BuscarOrdemServicoParams): Promise<Result<{ transacaoId: TransacaoId } | null, ErroApp>>;
  criarVendaDaOrdemServico(params: CriarVendaDaOrdemServicoParams): Promise<Result<{ transacaoId: TransacaoId }, ErroApp>>;
}
