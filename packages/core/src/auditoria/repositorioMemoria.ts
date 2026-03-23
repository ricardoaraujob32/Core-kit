// packages/core/src/auditoria/repositorioMemoria.ts

import { randomUUID } from "node:crypto";
import { ErroApp, Result, wrapOk } from "../kernel";
import { EventoAuditoriaLocatario, EventoAuditoriaPlataforma, ListarAuditoriaLocatarioInput, ListarAuditoriaPlataformaInput, RegistrarEventoLocatarioInput, RegistrarEventoPlataformaInput } from "./tipos";

/**
 * Implementação em memória do repositório de auditoria no escopo de locatário.
 *
 * Esta classe mantém os eventos em um vetor simples, preservando ordem de
 * inserção e permitindo testes de trilha de auditoria sem infraestrutura externa.
 */
export class AuditoriaLocatarioRepositorioMemoria implements AuditoriaLocatarioRepositorio {
  /** Coleção interna de eventos de auditoria de locatário. */
  private readonly itens: EventoAuditoriaLocatario[] = [];

  /**
   * Registra um novo evento de auditoria de locatário.
   *
   * O identificador é gerado internamente, e `criadoEm` é materializado
   * no momento do registro.
   *
   * @param input Dados do evento a ser registrado.
   * @returns `Ok(evento)` com o evento persistido em memória.
   */
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

  /**
   * Lista eventos de auditoria de locatário aplicando filtros opcionais.
   *
   * Regras atuais:
   * - filtro obrigatório por `locatarioId`;
   * - filtros opcionais por `evento`, `entidadeTipo` e `entidadeId`;
   * - limite default de `100`;
   * - ordenação decrescente por `criadoEm`.
   *
   * @param filtro Parâmetros de consulta da auditoria.
   * @returns `Ok` com a coleção filtrada de eventos.
   */
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
 * Implementação em memória do repositório de auditoria de plataforma.
 *
 * Esta classe mantém eventos em um vetor simples e é útil para testes do
 * escopo administrativo/global da aplicação.
 */
export class AuditoriaPlataformaRepositorioMemoria implements AuditoriaPlataformaRepositorio {
  /** Coleção interna de eventos de auditoria de plataforma. */
  private readonly itens: EventoAuditoriaPlataforma[] = [];

  /**
   * Registra um novo evento de auditoria de plataforma.
   *
   * O identificador é gerado internamente, e `criadoEm` é materializado
   * no momento do registro.
   *
   * @param input Dados do evento a ser registrado.
   * @returns `Ok(evento)` com o evento persistido em memória.
   */
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

  /**
   * Lista eventos de auditoria de plataforma aplicando filtros opcionais.
   *
   * Regras atuais:
   * - filtro opcional por `locatarioAlvoId`;
   * - filtros opcionais por `evento`, `entidadeTipo` e `entidadeId`;
   * - limite default de `100`;
   * - ordenação decrescente por `criadoEm`.
   *
   * @param filtro Parâmetros de consulta da auditoria.
   * @returns `Ok` com a coleção filtrada de eventos.
   */
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
