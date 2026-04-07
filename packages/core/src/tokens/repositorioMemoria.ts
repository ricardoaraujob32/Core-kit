// // packages/core/src/tokens/repositorioMemoria.ts

// import { LocatarioId } from "../locatarios";
// import { wrapOk } from "../kernel";
// import { UsuarioId } from "../usuarios";
// import type { TokensRepositorio } from "./portasRepositorio";
// import type { TokenPersistido, TokenId, TokenTipo } from "./tipos";

// /**
//  * Cria uma implementação em memória da porta `TokensRepositorio`.
//  *
//  * Esta implementação existe para testes unitários do domínio de tokens,
//  * preservando comportamento determinístico e simplicidade operacional.
//  *
//  * Recursos auxiliares expostos além da porta:
//  * - `seed(...)`: injeta tokens diretamente no estado interno;
//  * - `dump()`: devolve uma cópia defensiva do estado persistido.
//  *
//  * @param seed Coleção inicial opcional de tokens persistidos.
//  * @returns Repositório em memória compatível com a porta de tokens.
//  */
// export function criarTokensRepositorioMemoria(
//   seed?: TokenPersistido[],
// ): TokensRepositorio & {
//   /**
//    * Injeta um token diretamente no estado interno.
//    *
//    * @param token Entidade de token persistido a ser semeada.
//    */
//   seed(token: TokenPersistido): void;

//   /**
//    * Retorna uma cópia defensiva do estado atual do repositório.
//    *
//    * @returns Coleção de tokens atualmente armazenados.
//    */
//   dump(): TokenPersistido[];
// } {
//   const byId = new Map<string, TokenPersistido>();

//   const api = {
//     seed(token: TokenPersistido) {
//       byId.set(token.tokenId, { ...token });
//     },

//     dump() {
//       return [...byId.values()].map((item) => ({ ...item }));
//     },

//     async criar(params: {
//       tokenId: TokenId;
//       usuarioId: UsuarioId;
//       locatarioId: LocatarioId;
//       hashToken: string;
//       tipo: TokenTipo;
//       emitidoEm: Date;
//       expiraEm: Date;
//       revogadoEm: Date | null;
//       proximoTokenId: TokenId | null;
//       agenteUsuario: string | null;
//       enderecoIp: string | null;
//     }) {
//       const novo: TokenPersistido = {
//         tokenId: params.tokenId,
//         usuarioId: params.usuarioId,
//         locatarioId: params.locatarioId,
//         hashToken: params.hashToken,
//         tipo: params.tipo,
//         emitidoEm: params.emitidoEm,
//         expiraEm: params.expiraEm,
//         revogadoEm: params.revogadoEm,
//         proximoTokenId: params.proximoTokenId,
//         agenteUsuario: params.agenteUsuario,
//         enderecoIp: params.enderecoIp,
//       };

//       byId.set(params.tokenId, novo);
//       return wrapOk({ tokenId: params.tokenId });
//     },

//     async atualizar(token: TokenPersistido) {
//       byId.set(token.tokenId, { ...token });
//       return wrapOk({ ...token });
//     },

//     async buscarPorId(params: { tokenId: TokenId }) {
//       const found = byId.get(params.tokenId) ?? null;
//       return wrapOk(found ? { ...found } : null);
//     },

//     async buscarPorHash(params: { hashToken: string }) {
//       const found =
//         [...byId.values()].find((item) => item.hashToken === params.hashToken) ??
//         null;

//       return wrapOk(found ? { ...found } : null);
//     },

//     async listarPorUsuario(params: {
//       usuarioId: UsuarioId;
//       locatarioId: LocatarioId;
//     }) {
//       const itens = [...byId.values()]
//         .filter(
//           (item) =>
//             item.usuarioId === params.usuarioId &&
//             item.locatarioId === params.locatarioId,
//         )
//         .map((item) => ({ ...item }))
//         .sort((a, b) => b.emitidoEm.getTime() - a.emitidoEm.getTime());

//       return wrapOk(itens);
//     },
//   };

//   for (const item of seed ?? []) {
//     api.seed(item);
//   }

//   return api;
// }

// /**
//  * Cria uma entidade `TokenPersistido` pronta para uso em testes.
//  *
//  * Este helper padroniza seeds de token em cenários unitários, permitindo
//  * configurar apenas os campos relevantes ao teste.
//  *
//  * Defaults atuais:
//  * - `tipo`: `"ACESSO"`
//  * - `emitidoEm`: `2026-01-01T00:00:00.000Z`
//  * - `expiraEm`: `2026-12-31T00:00:00.000Z`
//  * - `revogadoEm`: `null`
//  * - `proximoTokenId`: `null`
//  * - `agenteUsuario`: `null`
//  * - `enderecoIp`: `null`
//  *
//  * @param params Dados base do token de teste.
//  * @returns Entidade `TokenPersistido` materializada.
//  */
// export function criarTokenSeed(params: {
//   tokenId: TokenId;
//   usuarioId: UsuarioId;
//   locatarioId: LocatarioId;
//   hashToken: string;
//   tipo?: TokenTipo;
//   emitidoEm?: Date;
//   expiraEm?: Date;
//   revogadoEm?: Date | null;
//   proximoTokenId?: TokenId | null;
//   agenteUsuario?: string | null;
//   enderecoIp?: string | null;
// }): TokenPersistido {
//   return {
//     tokenId: params.tokenId,
//     usuarioId: params.usuarioId,
//     locatarioId: params.locatarioId,
//     hashToken: params.hashToken,
//     tipo: params.tipo ?? "ACESSO",
//     emitidoEm: params.emitidoEm ?? new Date("2026-01-01T00:00:00.000Z"),
//     expiraEm: params.expiraEm ?? new Date("2026-12-31T00:00:00.000Z"),
//     revogadoEm: params.revogadoEm ?? null,
//     proximoTokenId: params.proximoTokenId ?? null,
//     agenteUsuario: params.agenteUsuario ?? null,
//     enderecoIp: params.enderecoIp ?? null,
//   };
// }
