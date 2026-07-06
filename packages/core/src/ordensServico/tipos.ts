import type { ErroApp, Result } from "../kernel/index.js";
import type { ClienteId } from "../clientes/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { UsuarioId } from "../usuarios/index.js";
import type { ProdutoId, TransacaoId } from "../vendas/index.js";

export type OrdemServicoId = string;

export type StatusOrdemServico =
  | "ABERTA"
  | "EM_ANDAMENTO"
  | "AGUARDANDO"
  | "CONCLUIDA"
  | "CANCELADA";

export type EventoOrdemServico =
  | "INICIAR"
  | "AGUARDAR"
  | "CONCLUIR"
  | "CANCELAR";

export type OrdemServico = {
  ordemServicoId: OrdemServicoId;
  locatarioId: LocatarioId;
  clienteId: ClienteId | null;

  /**
   * Serviço de catálogo vinculado à OS.
   *
   * O serviço é um produto do catálogo com `tipo = SERVICO`.
   * Mantemos o nome como `servicoId` no domínio para deixar clara
   * a intenção de negócio, mesmo que fisicamente a FK aponte para produtos.
   */
  servicoId: ProdutoId | null;

  transacaoId: TransacaoId | null;
  status: StatusOrdemServico;
  titulo: string;
  descricao: string | null;
  abertaEm: Date;
  fechadaEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
  excluidoEm?: Date | null;
  excluidoPor?: UsuarioId | null;
  excluidoMotivo?: string | null;
};

export type CriarOrdemServicoInput = {
  locatarioId: LocatarioId;
  clienteId?: ClienteId | null;
  servicoId?: ProdutoId | null;
  titulo: string;
  descricao?: string | null;
};

export type CriarOrdemServicoOutput = {
  ordemServico: OrdemServico;
};

export type CriarOrdemServicoResult = Promise<Result<CriarOrdemServicoOutput, ErroApp>>;

export type AtualizarOrdemServicoInput = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
  clienteId?: ClienteId | null;
  servicoId?: ProdutoId | null;
  titulo?: string;
  descricao?: string | null;
};

export type AtualizarOrdemServicoOutput = {
  ordemServico: OrdemServico;
};

export type AtualizarOrdemServicoResult = Promise<Result<AtualizarOrdemServicoOutput, ErroApp>>;

export type ListarOrdensServicoInput = {
  locatarioId: LocatarioId;
  status?: StatusOrdemServico;
  clienteId?: ClienteId | null;
  cursor?: OrdemServicoId;
  limite?: number;
};

export type ListarOrdensServicoOutput = {
  itens: OrdemServico[];
};

export type ListarOrdensServicoResult = Promise<Result<ListarOrdensServicoOutput, ErroApp>>;

export type ObterOrdemServicoInput = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
};

export type ObterOrdemServicoOutput = {
  ordemServico: OrdemServico;
};

export type ObterOrdemServicoResult = Promise<Result<ObterOrdemServicoOutput, ErroApp>>;

export type MudarStatusOrdemServicoInput = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;
  usuarioId?: UsuarioId | null;
};

export type MudarStatusOrdemServicoOutput = { ordemServico: OrdemServico };
export type MudarStatusOrdemServicoResult = Promise<Result<MudarStatusOrdemServicoOutput, ErroApp>>;

export type CancelarOrdemServicoInput = MudarStatusOrdemServicoInput & {
  motivo?: string | null;
};
export type CancelarOrdemServicoResult = Promise<Result<MudarStatusOrdemServicoOutput, ErroApp>>;

export type GerarVendaDaOrdemServicoInput = {
  locatarioId: LocatarioId;
  ordemServicoId: OrdemServicoId;

  /**
   * Opcional: quando ausente, o caso de uso usa `ordemServico.servicoId`.
   */
  produtoId?: ProdutoId | null;

  valorTotal: number;
  vencimentoEm: Date;
  observacao?: string | null;
  usuarioId?: UsuarioId | null;
};

export type GerarVendaDaOrdemServicoOutput = {
  ordemServico: OrdemServico;
  transacaoId: TransacaoId;
};

export type GerarVendaDaOrdemServicoResult = Promise<Result<GerarVendaDaOrdemServicoOutput, ErroApp>>;
