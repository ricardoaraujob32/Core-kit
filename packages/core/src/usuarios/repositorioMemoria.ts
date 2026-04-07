// // packages/core/src/usuarios/repositorioMemoria.ts

// import { wrapOk } from "../kernel";
// import { LocatarioId } from "../locatarios";
// import type { UsuariosRepositorio } from "./portasRepositorio";
// import type { Usuario, UsuarioId, StatusUsuario } from "./tipos";

// /**
//  * Cria uma implementação em memória da porta `UsuariosRepositorio`.
//  *
//  * Esta implementação é voltada a testes unitários e mantém usuários em um
//  * `Map` indexado por `usuarioId`, sem dependência de infraestrutura externa.
//  *
//  * Recursos auxiliares expostos além da porta:
//  * - `seed(...)`: injeta usuários diretamente no estado interno;
//  * - `dump()`: devolve uma cópia defensiva do estado persistido.
//  *
//  * @param seed Coleção inicial opcional de usuários para pré-carga do repositório.
//  * @returns Repositório em memória compatível com a porta de usuários.
//  */
// export function criarUsuariosRepositorioMemoria(
//   seed?: Usuario[],
// ): UsuariosRepositorio & {
//   /**
//    * Injeta um usuário diretamente no estado interno.
//    *
//    * Útil para montar cenários de teste sem passar pelos casos de uso.
//    *
//    * @param usuario Entidade de usuário a ser semeada.
//    */
//   seed(usuario: Usuario): void;

//   /**
//    * Retorna uma cópia defensiva do estado atual do repositório.
//    *
//    * @returns Coleção de usuários armazenados em memória.
//    */
//   dump(): Usuario[];
// } {
//   const byId = new Map<string, Usuario>();

//   const api = {
//     seed(usuario: Usuario) {
//       byId.set(usuario.usuarioId, { ...usuario });
//     },

//     dump() {
//       return [...byId.values()].map((item) => ({ ...item }));
//     },

//     async criar(params: {
//       usuarioId: UsuarioId;
//       locatarioId: LocatarioId;
//       email: string;
//       nome: string;
//       senhaHash: string;
//       status: "ATIVO";
//       ultimoLoginEm: Date | null;
//       criadoEm: Date;
//       atualizadoEm: Date;
//       excluidoEm: Date | null;
//     }) {
//       const novo: Usuario = {
//         usuarioId: params.usuarioId,
//         locatarioId: params.locatarioId,
//         email: params.email,
//         nome: params.nome,
//         senhaHash: params.senhaHash,
//         status: params.status,
//         ultimoLoginEm: params.ultimoLoginEm,
//         criadoEm: params.criadoEm,
//         atualizadoEm: params.atualizadoEm,
//         excluidoEm: params.excluidoEm,
//       };

//       byId.set(params.usuarioId, novo);
//       return wrapOk({ usuarioId: params.usuarioId });
//     },

//     async atualizar(usuario: Usuario) {
//       byId.set(usuario.usuarioId, { ...usuario });
//       return wrapOk({ ...usuario });
//     },

//     async buscarPorId(params: { usuarioId: UsuarioId }) {
//       const found = byId.get(params.usuarioId) ?? null;
//       return wrapOk(found ? { ...found } : null);
//     },

//     async buscarPorEmailNoLocatario(params: {
//       locatarioId: LocatarioId | null;
//       emailNormalizado: string;
//     }) {
//       const found =
//         [...byId.values()].find(
//           (item) =>
//             item.locatarioId === params.locatarioId &&
//             item.excluidoEm === null &&
//             item.email.toLowerCase() === params.emailNormalizado,
//         ) ?? null;

//       return wrapOk(found ? { ...found } : null);
//     },

//     async listarPorLocatario(params: { locatarioId: LocatarioId }) {
//       const itens = [...byId.values()]
//         .filter(
//           (item) =>
//             item.locatarioId === params.locatarioId &&
//             item.excluidoEm === null,
//         )
//         .map((item) => ({ ...item }))
//         .sort((a, b) => a.nome.localeCompare(b.nome));

//       return wrapOk(itens);
//     },
//   };

//   for (const item of seed ?? []) {
//     api.seed(item);
//   }

//   return api;
// }

// /**
//  * Cria uma entidade `Usuario` pronta para uso em testes.
//  *
//  * Este helper reduz repetição em seeds de testes, aplicando defaults coerentes
//  * com o domínio para campos como status, hash de senha e timestamps.
//  *
//  * Defaults atuais:
//  * - `email`: normalizado para minúsculas;
//  * - `senhaHash`: `"hash_super_seguro_mock_1234567890"`
//  * - `status`: `"ATIVO"`
//  * - `ultimoLoginEm`: `null`
//  * - timestamps: `2026-01-01T00:00:00.000Z`
//  * - `excluidoEm`: `null`
//  *
//  * @param params Dados base do usuário de teste.
//  * @returns Entidade `Usuario` materializada.
//  */
// export function criarUsuarioSeed(params: {
//   usuarioId: UsuarioId;
//   locatarioId: LocatarioId | null;
//   email: string;
//   nome: string;
//   senhaHash?: string;
//   status?: StatusUsuario;
//   ultimoLoginEm?: Date | null;
//   criadoEm?: Date;
//   atualizadoEm?: Date;
//   excluidoEm?: Date | null;
// }): Usuario {
//   return {
//     usuarioId: params.usuarioId,
//     locatarioId: params.locatarioId,
//     email: params.email.toLowerCase(),
//     nome: params.nome,
//     senhaHash: params.senhaHash ?? "hash_super_seguro_mock_1234567890",
//     status: params.status ?? "ATIVO",
//     ultimoLoginEm: params.ultimoLoginEm ?? null,
//     criadoEm: params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z"),
//     atualizadoEm: params.atualizadoEm ?? new Date("2026-01-01T00:00:00.000Z"),
//     excluidoEm: params.excluidoEm ?? null,
//   };
// }
