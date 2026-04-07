// // packages/core/src/importacoes/repositorioMemoria.ts

// import { randomUUID } from "node:crypto";
// import { ErroApp, Result, wrapOk } from "../kernel";
// import { ImportacoesRepositorio, ItensImportacaoRepositorio } from "./portasRepositorio";
// import { Importacao, ImportacaoId, ItemImportacao, ItemImportacaoId, RegistrarImportacaoParams, RegistrarItemImportacaoParams 
// } from "./tipos";
// import { LocatarioId } from "../locatarios";

// /**
//  * Implementação em memória da porta `ImportacoesRepositorio`.
//  *
//  * Esta classe mantém importações em um `Map` interno e existe para testes
//  * unitários do domínio de importações, sem dependência de banco de dados.
//  */
// export class ImportacoesRepositorioMemoria implements ImportacoesRepositorio {
//   /** Armazena importações indexadas por `importacaoId`. */
//   private readonly itens = new Map<ImportacaoId, Importacao>();

//   /**
//    * Cria e persiste uma nova importação em memória.
//    *
//    * Quando `params.importacaoId` não é informado, um UUID aleatório é gerado.
//    *
//    * @param params Dados estruturados de registro da importação.
//    * @returns `Ok(importacao)` com a entidade persistida.
//    */
//   async criarImportacao(params: RegistrarImportacaoParams): Promise<Result<Importacao, ErroApp>> {
//     const item: Importacao = {
//       importacaoId: params.importacaoId ?? randomUUID(),
//       locatarioId: params.locatarioId,
//       criadoPorUsuarioId: params.criadoPorUsuarioId ?? null,
//       tipoOrigem: params.tipoOrigem,
//       referenciaOrigem: params.referenciaOrigem ?? null,
//       status: params.status,
//       mapeamentoColunas: params.mapeamentoColunas,
//       estatisticas: params.estatisticas,
//       mensagemErro: params.mensagemErro ?? null,
//       iniciadoEm: params.iniciadoEm ?? null,
//       finalizadoEm: params.finalizadoEm ?? null,
//       criadoEm: params.criadoEm,
//       atualizadoEm: params.atualizadoEm,
//     };

//     this.itens.set(item.importacaoId, item);
//     return wrapOk(item);
//   }

//   /**
//    * Atualiza integralmente uma importação persistida em memória.
//    *
//    * @param importacao Entidade de importação a ser substituída no estado interno.
//    * @returns `Ok(importacao)` com a própria entidade atualizada.
//    */
//   async atualizarImportacao(importacao: Importacao): Promise<Result<Importacao, ErroApp>> {
//     this.itens.set(importacao.importacaoId, importacao);
//     return wrapOk(importacao);
//   }

//   /**
//    * Busca uma importação por identificador.
//    *
//    * @param importacaoId Identificador da importação.
//    * @returns `Ok(importacao | null)` quando a consulta é concluída.
//    */
//   async buscarPorId(importacaoId: ImportacaoId): Promise<Result<Importacao | null, ErroApp>> {
//     return wrapOk(this.itens.get(importacaoId) ?? null);
//   }

//   /**
//    * Lista importações pertencentes a um locatário, ordenadas da mais recente
//    * para a mais antiga segundo `criadoEm`.
//    *
//    * @param locatarioId Locatário alvo da consulta.
//    * @returns `Ok` com a coleção ordenada de importações.
//    */
//   async listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Importacao[], ErroApp>> {
//     return wrapOk(
//       [...this.itens.values()]
//         .filter((item) => item.locatarioId === locatarioId)
//         .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()),
//     );
//   }
// }

// /**
//  * Implementação em memória da porta `ItensImportacaoRepositorio`.
//  *
//  * Esta classe armazena os itens de importação individualmente, permitindo
//  * testes unitários de processamento granular e falhas por item.
//  */
// export class ItensImportacaoRepositorioMemoria implements ItensImportacaoRepositorio
// {
//   /** Armazena itens de importação indexados por `itemImportacaoId`. */
//   private readonly itens = new Map<ItemImportacaoId, ItemImportacao>();

//   /**
//    * Cria e persiste um novo item de importação em memória.
//    *
//    * Quando `params.itemImportacaoId` não é informado, um UUID aleatório é gerado.
//    *
//    * @param params Dados estruturados do item.
//    * @returns `Ok(item)` com a entidade persistida.
//    */
//   async criarItem(params: RegistrarItemImportacaoParams): Promise<Result<ItemImportacao, ErroApp>> {
//     const item: ItemImportacao = {
//       itemImportacaoId: params.itemImportacaoId ?? randomUUID(),
//       importacaoId: params.importacaoId,
//       locatarioId: params.locatarioId,
//       numeroLinha: params.numeroLinha,
//       dadosBrutos: params.dadosBrutos,
//       status: params.status,
//       detalheErro: params.detalheErro ?? null,
//       criadoEm: params.criadoEm,
//     };

//     this.itens.set(item.itemImportacaoId, item);
//     return wrapOk(item);
//   }

//   /**
//    * Atualiza integralmente um item de importação persistido em memória.
//    *
//    * @param item Item a ser substituído no estado interno.
//    * @returns `Ok(item)` com a própria entidade atualizada.
//    */
//   async atualizarItem(item: ItemImportacao): Promise<Result<ItemImportacao, ErroApp>> {
//     this.itens.set(item.itemImportacaoId, item);
//     return wrapOk(item);
//   }

//   /**
//    * Busca um item de importação por identificador.
//    *
//    * @param itemImportacaoId Identificador do item.
//    * @returns `Ok(item | null)` quando a consulta é concluída.
//    */
//   async buscarPorId(itemImportacaoId: ItemImportacaoId): Promise<Result<ItemImportacao | null, ErroApp>> {
//     return wrapOk(this.itens.get(itemImportacaoId) ?? null);
//   }

//   /**
//    * Lista itens pertencentes a uma importação no escopo do locatário,
//    * ordenados por `numeroLinha` crescente.
//    *
//    * @param importacaoId Importação alvo da consulta.
//    * @param locatarioId Locatário proprietário da importação.
//    * @returns `Ok` com a coleção ordenada de itens.
//    */
//   async listarPorImportacao(importacaoId: ImportacaoId, locatarioId: LocatarioId): Promise<Result<ItemImportacao[], ErroApp>> {
//     return wrapOk(
//       [...this.itens.values()]
//         .filter(
//           (item) =>
//             item.importacaoId === importacaoId &&
//             item.locatarioId === locatarioId,
//         )
//         .sort((a, b) => a.numeroLinha - b.numeroLinha),
//     );
//   }
// }
