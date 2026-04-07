// // packages/core/src/auditoria/usecases/listarAuditoriaPlataforma.ts



// type CreateFnListarAuditoriaPlataformaDeps = {
//   auditoriaPlataformaRepositorio: AuditoriaPlataformaRepositorio;
// };

// type Output = {
//   itens: EventoAuditoriaInterna[];
//   cursorProximo?: string | null;
// };

// /**
//  * Lista eventos da auditoria da plataforma com filtros avançados.
//  *
//  * Regras:
//  * - o Core apenas orquestra a leitura;
//  * - paginação segue `cursor + limite`;
//  * - o cálculo de `cursorProximo` é derivado da coleção retornada.
//  */
// export function createFnListarAuditoriaPlataforma(
//   deps: CreateFnListarAuditoriaPlataformaDeps,
// ) {
//   return async function listarAuditoriaPlataforma(
//     input: ListarAuditoriaPlataformaInput,
//   ): Promise<Result<Output, ErroApp>> {
//     const resultado = await deps.auditoriaPlataformaRepositorio.listarEventos(
//       input,
//     );

//     if (!resultado.ok) {
//       return resultado;
//     }

//     const itens = resultado.value;
//     const cursorProximo =
//       input.limite && itens.length === input.limite
//         ? itens[itens.length - 1]?.auditoriaId ?? null
//         : null;

//     return wrapOk({
//       itens,
//       cursorProximo,
//     });
//   };
// }