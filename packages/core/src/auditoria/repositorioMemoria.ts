// // packages/core/src/auditoria/repositorioMemoria.ts

// import { randomUUID } from "node:crypto";
// import { ErroApp, Result, wrapOk } from "../kernel";
// import { EventoAuditoriaInterna, EventoAuditoriaAtivaLocatario, ListarAuditoriaInternaInput, ListarAuditoriaAtivaLocatarioInput, RegistrarEventoAuditoriaInternaInput } from "./tipos";
// import { AuditoriaInternaRepositorio, AuditoriaAtivaLocatarioRepositorio } from "./portasRepositorio";

// /**
//  * Implementação em memória do repositório de auditoria interna.
//  *
//  * Esta classe mantém os eventos em um vetor simples, preservando ordem de
//  * inserção e permitindo testes de trilha de auditoria sem infraestrutura externa.
//  */
// export class AuditoriaInternaRepositorioMemoria implements AuditoriaInternaRepositorio {
//   /** Coleção interna de eventos de auditoria interna. */
//   private readonly itens: EventoAuditoriaInterna[] = [];

//   /**
//    * Registra um novo evento de auditoria interna.
//    *
//    * O identificador é gerado internamente, e `criadoEm` é materializado
//    * no momento do registro.
//    *
//    * @param input Dados do evento a ser registrado.
//    * @returns `Ok(evento)` com o evento persistido em memória.
//    */
//   async registrarEvento(input: RegistrarEventoAuditoriaInternaInput): Promise<Result<EventoAuditoriaInterna, ErroApp>> {
//     const item: EventoAuditoriaInterna = {
//       auditoriaId: randomUUID(),
//       escopo: input.escopo,
//       locatarioId: input.locatarioId ?? null,
//       usuarioId: input.usuarioId ?? null,
//       evento: input.evento,
//       categoria: input.categoria,
//       sucesso: input.sucesso,
//       visibilidade: input.visibilidade ?? "INTERNA",
//       erroCodigo: input.erroCodigo ?? null,
//       erroMensagem: input.erroMensagem ?? null,
//       entidadeNome: input.entidadeNome ?? null,
//       entidadeTipo: input.entidadeTipo ?? null,
//       entidadeId: input.entidadeId ?? null,
//       origem: input.origem ?? null,
//       requisicaoId: input.requisicaoId ?? null,
//       enderecoIp: input.enderecoIp ?? null,
//       agenteUsuario: input.agenteUsuario ?? null,
//       agenteTipo: input.agenteTipo ?? null,
//       metadados: input.metadados ?? {},
//       criadoEm: new Date(),
//     };

//     this.itens.push(item);
//     return wrapOk(item);
//   }

//   /**
//    * Lista eventos da auditoria interna com filtros.
//    *
//    * @param input Filtros de consulta.
//    * @returns `Ok(eventos)` com os eventos filtrados.
//    */
//   async listarEventos(input: ListarAuditoriaInternaInput): Promise<Result<EventoAuditoriaInterna[], ErroApp>> {
//     let filtered = [...this.itens];

//     // Aplicar filtros básicos
//     if (input.escopo) {
//       filtered = filtered.filter(item => item.escopo === input.escopo);
//     }
//     if (input.locatarioId) {
//       filtered = filtered.filter(item => item.locatarioId === input.locatarioId);
//     }
//     if (input.visibilidade) {
//       filtered = filtered.filter(item => item.visibilidade === input.visibilidade);
//     }
//     if (input.evento) {
//       filtered = filtered.filter(item => item.evento === input.evento);
//     }
//     if (input.sucesso !== undefined) {
//       filtered = filtered.filter(item => item.sucesso === input.sucesso);
//     }
//     if (input.usuarioId) {
//       filtered = filtered.filter(item => item.usuarioId === input.usuarioId);
//     }
//     if (input.criadoDe) {
//       filtered = filtered.filter(item => item.criadoEm >= input.criadoDe!);
//     }
//     if (input.criadoAte) {
//       filtered = filtered.filter(item => item.criadoEm <= input.criadoAte!);
//     }

//     // Ordenar por data decrescente (mais recentes primeiro)
//     filtered.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());

//     // Aplicar limite
//     if (input.limite) {
//       filtered = filtered.slice(0, input.limite);
//     }

//     return wrapOk(filtered);
//   }
// }

// /**
//  * Implementação em memória do repositório de auditoria ativa do locatário.
//  *
//  * Esta classe mantém os eventos em um vetor simples e filtra apenas eventos
//  * visíveis ao cliente (visibilidade "CLIENTE" ou "AMBOS").
//  */
// export class AuditoriaAtivaLocatarioRepositorioMemoria implements AuditoriaAtivaLocatarioRepositorio {
//   /** Referência ao repositório interno para obter dados. */
//   private readonly auditoriaInterna: AuditoriaInternaRepositorioMemoria;

//   constructor(auditoriaInterna: AuditoriaInternaRepositorioMemoria) {
//     this.auditoriaInterna = auditoriaInterna;
//   }

//   /**
//    * Lista eventos visíveis ao locatário.
//    *
//    * @param input Filtros de consulta.
//    * @returns `Ok(eventos)` com os eventos filtrados e visíveis ao cliente.
//    */
//   async listarEventos(input: ListarAuditoriaAtivaLocatarioInput): Promise<Result<EventoAuditoriaAtivaLocatario[], ErroApp>> {
//     // Primeiro, buscar eventos internos do locatário
//     const eventosInternosResult = await this.auditoriaInterna.listarEventos({
//       ...input,
//       escopo: "LOCATARIO",
//       locatarioId: input.locatarioId,
//       visibilidade: ["CLIENTE", "AMBOS"] as any, // Note: este filtro pode precisar de ajuste
//     });

//     if (!eventosInternosResult.ok) {
//       return eventosInternosResult;
//     }

//     // Converter para formato de auditoria ativa do locatário
//     const eventosAtivos: EventoAuditoriaAtivaLocatario[] = eventosInternosResult.value
//       .filter(evento => evento.visibilidade === "CLIENTE" || evento.visibilidade === "AMBOS")
//       .map(evento => ({
//         auditoriaId: evento.auditoriaId,
//         locatarioId: evento.locatarioId!,
//         usuarioId: evento.usuarioId,
//         evento: evento.evento,
//         categoria: evento.categoria,
//         sucesso: evento.sucesso,
//         erroCodigo: evento.erroCodigo,
//         erroMensagem: evento.erroMensagem,
//         entidadeNome: evento.entidadeNome,
//         entidadeTipo: evento.entidadeTipo,
//         entidadeId: evento.entidadeId,
//         origem: evento.origem,
//         requisicaoId: evento.requisicaoId,
//         enderecoIp: evento.enderecoIp,
//         agenteUsuario: evento.agenteUsuario,
//         agenteTipo: evento.agenteTipo,
//         metadados: evento.metadados,
//         criadoEm: evento.criadoEm,
//       }));

//     return wrapOk(eventosAtivos);
//   }
// }
