import { z } from "zod";

export const listarOrdensServicoQuerySchema = z.object({
  status: z.enum(["ABERTA", "EM_ANDAMENTO", "AGUARDANDO", "CONCLUIDA", "CANCELADA"]).optional(),
  clienteId: z.string().uuid().optional(),
  cursor: z.string().uuid().optional(),
  limite: z.coerce.number().int().min(1).max(100).optional(),
});

export const ordemServicoIdParamsSchema = z.object({
  ordemServicoId: z.string().uuid(),
});

export const criarOrdemServicoBodySchema = z.object({
  clienteId: z.string().uuid().nullable().optional(),
  titulo: z.string().min(3),
  descricao: z.string().nullable().optional(),
});

export const atualizarOrdemServicoBodySchema = z.object({
  clienteId: z.string().uuid().nullable().optional(),
  titulo: z.string().min(3).optional(),
  descricao: z.string().nullable().optional(),
});

export const gerarVendaOrdemServicoBodySchema = z.object({
  produtoId: z.string().uuid(),
  valorTotal: z.coerce.number().nonnegative(),
  vencimentoEm: z.coerce.date(),
  observacao: z.string().nullable().optional(),
});

export type ListarOrdensServicoQueryDto = z.infer<typeof listarOrdensServicoQuerySchema>;
export type OrdemServicoIdParamsDto = z.infer<typeof ordemServicoIdParamsSchema>;
export type CriarOrdemServicoBodyDto = z.infer<typeof criarOrdemServicoBodySchema>;
export type AtualizarOrdemServicoBodyDto = z.infer<typeof atualizarOrdemServicoBodySchema>;
export type GerarVendaOrdemServicoBodyDto = z.infer<typeof gerarVendaOrdemServicoBodySchema>;

export const parseListarOrdensServicoQuery = (input: unknown) => listarOrdensServicoQuerySchema.safeParse(input);
export const parseOrdemServicoIdParams = (input: unknown) => ordemServicoIdParamsSchema.safeParse(input);
export const parseCriarOrdemServicoBody = (input: unknown) => criarOrdemServicoBodySchema.safeParse(input);
export const parseAtualizarOrdemServicoBody = (input: unknown) => atualizarOrdemServicoBodySchema.safeParse(input);
export const parseGerarVendaOrdemServicoBody = (input: unknown) => gerarVendaOrdemServicoBodySchema.safeParse(input);
