// import { wrapOk } from "../kernel";
// import type { VendasRepositorio } from "./portasRepositorio";
// import type { HistoricoTransacaoComercial, ItemTransacaoComercial, TransacaoComercial } from "./tipos";

// export function createVendasRepositorioMemoria(seed?: { transacoes?: TransacaoComercial[]; itens?: ItemTransacaoComercial[]; historico?: HistoricoTransacaoComercial[] }): VendasRepositorio {
//   const transacoes = new Map<string, TransacaoComercial>();
//   const itens = new Map<string, ItemTransacaoComercial>();
//   const historicos = new Map<string, HistoricoTransacaoComercial>();
//   for (const item of seed?.transacoes ?? []) transacoes.set(item.transacaoId, item);
//   for (const item of seed?.itens ?? []) itens.set(item.itemTransacaoId, item);
//   for (const item of seed?.historico ?? []) historicos.set(item.historicoId, item);
//   return {
//     async criarTransacao(t) { transacoes.set(t.transacaoId, t); return wrapOk({ transacaoId: t.transacaoId }); },
//     async buscarTransacaoPorId(p) { const t = transacoes.get(p.transacaoId); return wrapOk(t && t.locatarioId === p.locatarioId && !t.excluidoEm ? t : null); },
//     async listarTransacoes(p) {
//       const todos = [...transacoes.values()].filter((t) => t.locatarioId === p.locatarioId && !t.excluidoEm && (!p.tipo || t.tipo === p.tipo) && (!p.status || t.status === p.status)).sort((a,b) => a.transacaoId.localeCompare(b.transacaoId));
//       const start = p.cursor ? Math.max(0, todos.findIndex((i) => i.transacaoId === p.cursor) + 1) : 0;
//       return wrapOk(todos.slice(start, p.limite ? start + p.limite : undefined));
//     },
//     async atualizarTransacao(t) { transacoes.set(t.transacaoId, t); return wrapOk(t); },
//     async criarItem(i) { itens.set(i.itemTransacaoId, i); return wrapOk({ itemTransacaoId: i.itemTransacaoId }); },
//     async buscarItemPorId(p) { const i = itens.get(p.itemTransacaoId); return wrapOk(i && i.locatarioId === p.locatarioId && i.transacaoId === p.transacaoId && !i.excluidoEm ? i : null); },
//     async listarItens(p) { return wrapOk([...itens.values()].filter((i) => i.locatarioId === p.locatarioId && i.transacaoId === p.transacaoId && !i.excluidoEm)); },
//     async atualizarItem(i) { itens.set(i.itemTransacaoId, i); return wrapOk(i); },
//     async criarHistorico(h) { historicos.set(h.historicoId, h); return wrapOk({ historicoId: h.historicoId }); },
//     async listarHistorico(p) { return wrapOk([...historicos.values()].filter((h) => h.locatarioId === p.locatarioId && h.transacaoId === p.transacaoId).sort((a,b) => a.criadoEm.getTime() - b.criadoEm.getTime())); },
//   };
// }
