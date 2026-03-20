// packages/core/src/auditoria/repositorioMemoria.ts

import { randomUUID } from "node:crypto";
import { ErroApp, Result, wrapOk } from "../kernel";
import { EventoAuditoriaLocatario, EventoAuditoriaPlataforma, ListarAuditoriaLocatarioInput, ListarAuditoriaPlataformaInput, RegistrarEventoLocatarioInput, RegistrarEventoPlataformaInput } from "./tipos";

/**
 * 
 */
export class AuditoriaLocatarioRepositorioMemoria implements AuditoriaLocatarioRepositorio {
  private readonly itens: EventoAuditoriaLocatario[] = [];

  async registrarEvento(input: RegistrarEventoLocatarioInput): Promise<Result<EventoAuditoriaLocatario, ErroApp>> {
    const item: EventoAuditoriaLocatario = {
      auditoriaId: randomUUID(),
      locatarioId: input.locatarioId,
      usuarioId: input.usuarioId,
      evento: input.evento,
      sucesso: input.sucesso,
      erroCodigo: input.erroCodigo ?? null,
      erroMensagem: input.erroMensagem ?? null,
      entidadeNome: input.entidadeNome ?? null,
      entidadeTipo: input.entidadeTipo ?? null,
      entidadeId: input.entidadeId ?? null,
      origem: input.origem ?? null,
      requisicaoId: input.requisicaoId ?? null,
      enderecoIp: input.enderecoIp ?? null,
      agenteUsuario: input.agenteUsuario ?? null,
      agenteTipo: input.agenteTipo ?? null,
      metadados: input.metadados ?? {},
      criadoEm: new Date(),
    };

    this.itens.push(item);
    return wrapOk(item);
  }

  async listarEventos(filtro: ListarAuditoriaLocatarioInput): Promise<Result<EventoAuditoriaLocatario[], ErroApp>> {
    const limite = filtro.limite ?? 100;
    const itens = this.itens
      .filter((x) => x.locatarioId === filtro.locatarioId)
      .filter((x) => !filtro.evento || x.evento === filtro.evento)
      .filter((x) => !filtro.entidadeTipo || x.entidadeTipo === filtro.entidadeTipo)
      .filter((x) => !filtro.entidadeId || x.entidadeId === filtro.entidadeId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
      .slice(0, limite);

    return wrapOk(itens);
  }
}

/**
 * 
 */
export class AuditoriaPlataformaRepositorioMemoria implements AuditoriaPlataformaRepositorio {
  private readonly itens: EventoAuditoriaPlataforma[] = [];

  async registrarEvento(input: RegistrarEventoPlataformaInput): Promise<Result<EventoAuditoriaPlataforma, ErroApp>> {
    const item: EventoAuditoriaPlataforma = {
      auditoriaId: randomUUID(),
      usuarioId: input.usuarioId,
      locatarioAlvoId: input.locatarioAlvoId ?? null,
      evento: input.evento,
      sucesso: input.sucesso,
      erroCodigo: input.erroCodigo ?? null,
      erroMensagem: input.erroMensagem ?? null,
      entidadeNome: input.entidadeNome ?? null,
      entidadeTipo: input.entidadeTipo ?? null,
      entidadeId: input.entidadeId ?? null,
      origem: input.origem ?? null,
      requisicaoId: input.requisicaoId ?? null,
      enderecoIp: input.enderecoIp ?? null,
      agenteUsuario: input.agenteUsuario ?? null,
      agenteTipo: input.agenteTipo ?? null,
      metadados: input.metadados ?? {},
      criadoEm: new Date(),
    };

    this.itens.push(item);
    return wrapOk(item);
  }

  async listarEventos(filtro: ListarAuditoriaPlataformaInput): Promise<Result<EventoAuditoriaPlataforma[], ErroApp>> {
    const limite = filtro.limite ?? 100;
    const itens = this.itens
      .filter((x) => filtro.locatarioAlvoId === undefined || x.locatarioAlvoId === filtro.locatarioAlvoId)
      .filter((x) => !filtro.evento || x.evento === filtro.evento)
      .filter((x) => !filtro.entidadeTipo || x.entidadeTipo === filtro.entidadeTipo)
      .filter((x) => !filtro.entidadeId || x.entidadeId === filtro.entidadeId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
      .slice(0, limite);

    return wrapOk(itens);
  }
}
