// apps/api/src/modules/usuarios/usuarios.dto.ts

import { z } from "zod";

/**
 * Schema base para parâmetros que carregam o identificador de usuário.
 *
 * Regras:
 * - `id` deve ser string;
 * - não pode ser vazio após `trim`.
 */
export const usuarioIdParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "O parâmetro 'id' é obrigatório."),
});

/**
 * Tipo inferido para params contendo `id` de usuário.
 */
export type UsuarioIdParamsDto = z.infer<typeof usuarioIdParamsSchema>;

/**
 * Schema do body para criação de usuário.
 *
 * Regras:
 * - `email` obrigatório;
 * - `nome` obrigatório;
 * - `senha` obrigatória;
 * - a força real da senha pode ser refinada depois;
 * - aqui garantimos apenas o contrato mínimo da borda.
 */
export const criarUsuarioBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "O campo 'email' é obrigatório.")
    .email("O campo 'email' deve conter um e-mail válido."),

  nome: z
    .string()
    .trim()
    .min(2, "O campo 'nome' deve ter ao menos 2 caracteres."),

  senha: z
    .string()
    .min(4, "O campo 'senha' deve ter ao menos 4 caracteres."),
});

/**
 * Tipo inferido para o body de criação de usuário.
 */
export type CriarUsuarioBodyDto = z.infer<typeof criarUsuarioBodySchema>;

/**
 * Schema do body para atualização cadastral de usuário.
 *
 * Regras:
 * - atualização é parcial;
 * - pelo menos um dos campos deve ser informado;
 * - senha não entra neste DTO por decisão arquitetural.
 */
export const atualizarUsuarioBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("O campo 'email' deve conter um e-mail válido.")
      .optional(),

    nome: z
      .string()
      .trim()
      .min(2, "O campo 'nome' deve ter ao menos 2 caracteres.")
      .optional(),
  })
  .refine(
    (data) => data.email !== undefined || data.nome !== undefined,
    {
      message: "Informe ao menos um campo para atualização.",
    },
  );

/**
 * Tipo inferido para o body de atualização de usuário.
 */
export type AtualizarUsuarioBodyDto = z.infer<typeof atualizarUsuarioBodySchema>;

/**
 * Schema de resposta para criação de usuário.
 *
 * Observação:
 * - a borda devolve apenas o identificador criado.
 */
export const criarUsuarioResponseSchema = z.object({
  item: z.object({
    usuarioId: z.string(),
  }),
});

/**
 * Schema de resposta para leitura de um único usuário.
 *
 * Observação:
 * - o shape acompanha o contrato atual dos controllers.
 * - campos podem ser ajustados se você quiser esconder `senhaHash` da borda.
 */
export const usuarioResponseSchema = z.object({
  item: z.object({
    usuarioId: z.string(),
    locatarioId: z.string().nullable(),
    email: z.string(),
    nome: z.string(),
    status: z.enum(["ATIVO", "INATIVO", "SUSPENSO", "ENCERRADO"]),
    ultimoLoginEm: z.date().nullable(),
    criadoEm: z.date(),
    atualizadoEm: z.date(),
    excluidoEm: z.date().nullable(),
  }),
});

/**
 * Schema de resposta para listagem de usuários.
 */
export const listarUsuariosResponseSchema = z.object({
  itens: z.array(
    z.object({
      usuarioId: z.string(),
      locatarioId: z.string().nullable(),
      email: z.string(),
      nome: z.string(),
      status: z.enum(["ATIVO", "INATIVO", "SUSPENSO", "ENCERRADO"]),
      ultimoLoginEm: z.date().nullable(),
      criadoEm: z.date(),
      atualizadoEm: z.date(),
      excluidoEm: z.date().nullable(),
    }),
  ),
});

/**
 * Tipos inferidos das respostas.
 */
export type CriarUsuarioResponseDto = z.infer<typeof criarUsuarioResponseSchema>;
export type UsuarioResponseDto = z.infer<typeof usuarioResponseSchema>;
export type ListarUsuariosResponseDto = z.infer<typeof listarUsuariosResponseSchema>;

/**
 * Faz parse seguro dos params `:id` de usuário.
 *
 * @param input Valor bruto recebido pela borda.
 * @returns Resultado do parse com Zod.
 */
export function parseUsuarioIdParams(input: unknown) {
  return usuarioIdParamsSchema.safeParse(input);
}

/**
 * Faz parse seguro do body de criação de usuário.
 *
 * @param input Valor bruto recebido pela borda.
 * @returns Resultado do parse com Zod.
 */
export function parseCriarUsuarioBody(input: unknown) {
  return criarUsuarioBodySchema.safeParse(input);
}

/**
 * Faz parse seguro do body de atualização de usuário.
 *
 * @param input Valor bruto recebido pela borda.
 * @returns Resultado do parse com Zod.
 */
export function parseAtualizarUsuarioBody(input: unknown) {
  return atualizarUsuarioBodySchema.safeParse(input);
}
