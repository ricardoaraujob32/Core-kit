// apps/api/src/modules/locatarios/locatarios.dto.ts

import { z } from "zod";

export const locatarioIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
});

export const configuracaoIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
  configuracaoId: z.string().trim().min(1, "O parâmetro 'configuracaoId' é obrigatório."),
});

export const criarLocatarioBodySchema = z.object({
  nome: z.string().trim().min(2, "O campo 'nome' deve ter ao menos 2 caracteres."),
  slug: z.string().trim().min(2, "O campo 'slug' deve ter ao menos 2 caracteres."),
  email: z.string().trim().email("O campo 'email' deve conter um e-mail válido."),
  documento: z.string().trim().min(5).optional().nullable(),
  fusoHorario: z.string().trim().min(3).optional(),
  configuracaoInicial: z.object({
    modoTema: z.enum(["SISTEMA", "CLARO", "ESCURO"]).optional(),
    identidadeVisual: z.string().trim().min(2),
    corPrimaria: z.string().trim().optional().nullable(),
    corSecundaria: z.string().trim().optional().nullable(),
    corTerciaria: z.string().trim().optional().nullable(),
    urlLogo: z.string().trim().url().optional().nullable(),
    ativa: z.boolean(),
  }),
});

export const atualizarLocatarioBodySchema = z.object({
  nome: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  documento: z.string().trim().min(5).optional().nullable(),
  fusoHorario: z.string().trim().min(3).optional(),
}).refine(
  (data) =>
    data.nome !== undefined ||
    data.email !== undefined ||
    data.documento !== undefined ||
    data.fusoHorario !== undefined,
  { message: "Informe ao menos um campo para atualização." },
);

export const suspenderLocatarioBodySchema = z.object({
  motivoSuspensao: z.string().trim().optional().nullable(),
});

export const reativarLocatarioBodySchema = z.object({
  motivoReativacao: z.string().trim().optional().nullable(),
});

export const encerrarLocatarioBodySchema = z.object({
  motivoExclusao: z.string().trim().optional().nullable(),
});

export const criarConfiguracaoBodySchema = z.object({
  modoTema: z.enum(["SISTEMA", "CLARO", "ESCURO"]).optional(),
  identidadeVisual: z.string().trim().min(2),
  corPrimaria: z.string().trim().optional().nullable(),
  corSecundaria: z.string().trim().optional().nullable(),
  corTerciaria: z.string().trim().optional().nullable(),
  urlLogo: z.string().trim().url().optional().nullable(),
  ativa: z.boolean(),
});

export const atualizarConfiguracaoBodySchema = z.object({
  modoTema: z.enum(["SISTEMA", "CLARO", "ESCURO"]).optional(),
  identidadeVisual: z.string().trim().min(2).optional(),
  corPrimaria: z.string().trim().optional().nullable(),
  corSecundaria: z.string().trim().optional().nullable(),
  corTerciaria: z.string().trim().optional().nullable(),
  urlLogo: z.string().trim().url().optional().nullable(),
}).refine(
  (data) =>
    data.modoTema !== undefined ||
    data.identidadeVisual !== undefined ||
    data.corPrimaria !== undefined ||
    data.corSecundaria !== undefined ||
    data.corTerciaria !== undefined ||
    data.urlLogo !== undefined,
  { message: "Informe ao menos um campo para atualização da configuração." },
);

export type LocatarioIdParamsDto = z.infer<typeof locatarioIdParamsSchema>;
export type ConfiguracaoIdParamsDto = z.infer<typeof configuracaoIdParamsSchema>;
export type CriarLocatarioBodyDto = z.infer<typeof criarLocatarioBodySchema>;
export type AtualizarLocatarioBodyDto = z.infer<typeof atualizarLocatarioBodySchema>;
export type SuspenderLocatarioBodyDto = z.infer<typeof suspenderLocatarioBodySchema>;
export type ReativarLocatarioBodyDto = z.infer<typeof reativarLocatarioBodySchema>;
export type EncerrarLocatarioBodyDto = z.infer<typeof encerrarLocatarioBodySchema>;
export type CriarConfiguracaoBodyDto = z.infer<typeof criarConfiguracaoBodySchema>;
export type AtualizarConfiguracaoBodyDto = z.infer<typeof atualizarConfiguracaoBodySchema>;

export function parseLocatarioIdParams(input: unknown) {
  return locatarioIdParamsSchema.safeParse(input);
}

export function parseConfiguracaoIdParams(input: unknown) {
  return configuracaoIdParamsSchema.safeParse(input);
}

export function parseCriarLocatarioBody(input: unknown) {
  return criarLocatarioBodySchema.safeParse(input);
}

export function parseAtualizarLocatarioBody(input: unknown) {
  return atualizarLocatarioBodySchema.safeParse(input);
}

export function parseSuspenderLocatarioBody(input: unknown) {
  return suspenderLocatarioBodySchema.safeParse(input);
}

export function parseReativarLocatarioBody(input: unknown) {
  return reativarLocatarioBodySchema.safeParse(input);
}

export function parseEncerrarLocatarioBody(input: unknown) {
  return encerrarLocatarioBodySchema.safeParse(input);
}

export function parseCriarConfiguracaoBody(input: unknown) {
  return criarConfiguracaoBodySchema.safeParse(input);
}

export function parseAtualizarConfiguracaoBody(input: unknown) {
  return atualizarConfiguracaoBodySchema.safeParse(input);
}
