// apps/api/src/modules/rbac/rbac.dto.ts

import { z } from "zod";

/**
 * Schema base para parâmetros que carregam o identificador de papel.
 */
export const papelIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
});

/**
 * Schema base para parâmetros que carregam o identificador de usuário.
 */
export const usuarioIdParamsSchema = z.object({
  id: z.string().trim().min(1, "O parâmetro 'id' é obrigatório."),
});

export type PapelIdParamsDto = z.infer<typeof papelIdParamsSchema>;
export type UsuarioIdParamsDto = z.infer<typeof usuarioIdParamsSchema>;

/**
 * Body para criação de papel.
 */
export const criarPapelBodySchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O campo 'nome' deve ter ao menos 2 caracteres."),
  descricao: z
    .string()
    .trim()
    .min(1, "O campo 'descricao' deve ter ao menos 1 caractere.")
    .optional(),
});

export type CriarPapelBodyDto = z.infer<typeof criarPapelBodySchema>;

/**
 * Body para atualização de papel.
 */
export const atualizarPapelBodySchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "O campo 'nome' deve ter ao menos 2 caracteres.")
      .optional(),
    descricao: z
      .string()
      .trim()
      .min(1, "O campo 'descricao' deve ter ao menos 1 caractere.")
      .optional(),
  })
  .refine((data) => data.nome !== undefined || data.descricao !== undefined, {
    message: "Informe ao menos um campo para atualização.",
  });

export type AtualizarPapelBodyDto = z.infer<typeof atualizarPapelBodySchema>;

/**
 * Body para atribuir permissão a um papel.
 */
export const atribuirPermissaoBodySchema = z.object({
  permissao: z
    .string()
    .trim()
    .min(1, "O campo 'permissao' é obrigatório."),
});

export type AtribuirPermissaoBodyDto = z.infer<
  typeof atribuirPermissaoBodySchema
>;

/**
 * Body para remover permissão de um papel.
 *
 * Mantido igual ao de atribuição para simplicidade do contrato HTTP.
 */
export const removerPermissaoBodySchema = z.object({
  permissao: z
    .string()
    .trim()
    .min(1, "O campo 'permissao' é obrigatório."),
});

export type RemoverPermissaoBodyDto = z.infer<
  typeof removerPermissaoBodySchema
>;

/**
 * Body para atualização dos papéis de um usuário.
 */
export const atualizarPapeisUsuarioBodySchema = z.object({
  papeis: z
    .array(z.string().trim().min(1))
    .min(1, "Informe ao menos um papel."),
});

export type AtualizarPapeisUsuarioBodyDto = z.infer<
  typeof atualizarPapeisUsuarioBodySchema
>;

/**
 * Helpers de parse seguro.
 */
export function parsePapelIdParams(input: unknown) {
  return papelIdParamsSchema.safeParse(input);
}

export function parseUsuarioIdParams(input: unknown) {
  return usuarioIdParamsSchema.safeParse(input);
}

export function parseCriarPapelBody(input: unknown) {
  return criarPapelBodySchema.safeParse(input);
}

export function parseAtualizarPapelBody(input: unknown) {
  return atualizarPapelBodySchema.safeParse(input);
}

export function parseAtribuirPermissaoBody(input: unknown) {
  return atribuirPermissaoBodySchema.safeParse(input);
}

export function parseRemoverPermissaoBody(input: unknown) {
  return removerPermissaoBodySchema.safeParse(input);
}

export function parseAtualizarPapeisUsuarioBody(input: unknown) {
  return atualizarPapeisUsuarioBodySchema.safeParse(input);
}