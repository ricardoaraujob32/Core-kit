// packages/core/src/assinaturas/repositorioMemoria.ts

import { randomUUID } from "node:crypto";
import { ErroApp, Result, wrapOk } from "../kernel";
import { AssinaturasModulosRepositorio, AssinaturasRepositorio, ModulosConsultaRepositorio,
  PlanosConsultaRepositorio } from "./portasRepositorio";
import { Assinatura, AssinaturaId, ListarModulosGratisResult, ModuloHabilitadoAssinatura, PlanoId, RegistrarAssinaturaParams,
  RegistrarModuloAssinaturaParams, ValidarModuloExistenteResult, ValidarPlanoAtivoResult } from "./tipos";
import { ModuloId } from "../modulos";

/**
 * Implementação em memória da porta `AssinaturasRepositorio`.
 *
 * Esta classe mantém assinaturas em um `Map` interno e existe para testes
 * unitários do domínio comercial.
 */
export class AssinaturasRepositorioMemoria implements AssinaturasRepositorio {
  /** Armazena assinaturas indexadas por `assinaturaId`. */
  private readonly itens = new Map<AssinaturaId, Assinatura>();

  /**
   * Cria e persiste uma nova assinatura em memória.
   *
   * Quando `params.assinaturaId` não é informado, um UUID aleatório é gerado.
   *
   * @param params Dados estruturados da assinatura.
   * @returns `Ok(assinatura)` com a entidade persistida.
   */
  async criarAssinatura(params: RegistrarAssinaturaParams): Promise<Result<Assinatura, ErroApp>> {
    const assinatura: Assinatura = {
      assinaturaId: params.assinaturaId ?? randomUUID(),
      locatarioId: params.locatarioId,
      planoId: params.planoId,
      status: params.status,
      iniciadaEm: params.iniciadaEm,
      encerradaEm: params.encerradaEm ?? null,
      criadaEm: params.criadaEm,
      atualizadaEm: params.atualizadaEm,
    };

    this.itens.set(assinatura.assinaturaId, assinatura);
    return wrapOk(assinatura);
  }

  /**
   * Atualiza integralmente uma assinatura persistida em memória.
   *
   * @param assinatura Entidade a ser substituída no estado interno.
   * @returns `Ok(assinatura)` com a própria entidade atualizada.
   */
  async atualizarAssinatura(assinatura: Assinatura): Promise<Result<Assinatura, ErroApp>> {
    this.itens.set(assinatura.assinaturaId, assinatura);
    return wrapOk(assinatura);
  }

  /**
   * Busca uma assinatura por identificador.
   *
   * @param assinaturaId Identificador da assinatura.
   * @returns `Ok(assinatura | null)` quando a consulta é concluída.
   */
  async buscarPorId(assinaturaId: AssinaturaId): Promise<Result<Assinatura | null, ErroApp>> {
    return wrapOk(this.itens.get(assinaturaId) ?? null);
  }

  /**
   * Busca a assinatura ativa ou operacionalmente relevante de um locatário.
   *
   * No estado atual desta implementação, os status considerados válidos
   * para retorno são:
   * - `ATIVA`
   * - `SUSPENSA`
   * - `RASCUNHO`
   *
   * @param locatarioId Locatário alvo da consulta.
   * @returns `Ok(assinatura | null)` com a primeira assinatura compatível encontrada.
   */
  async buscarAssinaturaAtivaPorLocatario(locatarioId: string): Promise<Result<Assinatura | null, ErroApp>> {
    const encontrada =
      [...this.itens.values()].find(
        (item) =>
          item.locatarioId === locatarioId &&
          (item.status === "ATIVA" || item.status === "SUSPENSA" || item.status === "RASCUNHO"),
      ) ?? null;

    return wrapOk(encontrada);
  }
}

/**
 * Implementação em memória da porta `AssinaturasModulosRepositorio`.
 *
 * Esta classe mantém vínculos entre assinaturas e módulos em um `Map`
 * indexado por chave composta.
 */
export class AssinaturasModulosRepositorioMemoria implements AssinaturasModulosRepositorio {
  /** Armazena vínculos assinatura-módulo indexados por chave composta. */
  private readonly itens = new Map<string, ModuloHabilitadoAssinatura>();

  /**
   * Gera a chave composta interna usada para indexar o vínculo.
   *
   * @param assinaturaId Identificador da assinatura.
   * @param moduloId Identificador do módulo.
   * @returns Chave estável no formato `${assinaturaId}::${moduloId}`.
   */
  private chave(assinaturaId: AssinaturaId, moduloId: ModuloId): string {
    return `${assinaturaId}::${moduloId}`;
  }

  /**
   * Cria e persiste um vínculo entre assinatura e módulo.
   *
   * @param params Dados estruturados do vínculo.
   * @returns `Ok(vinculo)` com a entidade persistida.
   */
  async vincularModulo(
    params: RegistrarModuloAssinaturaParams,
  ): Promise<Result<ModuloHabilitadoAssinatura, ErroApp>> {
    const item: ModuloHabilitadoAssinatura = {
      assinaturaId: params.assinaturaId,
      moduloId: params.moduloId,
      gratuito: params.gratuito,
      origem: params.origem,
      habilitadoEm: params.habilitadoEm,
      desabilitadoEm: params.desabilitadoEm ?? null,
    };

    this.itens.set(this.chave(params.assinaturaId, params.moduloId), item);
    return wrapOk(item);
  }

  /**
   * Marca um vínculo como desabilitado, sem removê-lo do estado interno.
   *
   * @param assinaturaId Assinatura alvo.
   * @param moduloId Módulo a ser desabilitado.
   * @param desabilitadoEm Instante da desabilitação.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  async desvincularModulo(
    assinaturaId: AssinaturaId,
    moduloId: ModuloId,
    desabilitadoEm: Date,
  ): Promise<Result<void, ErroApp>> {
    const chave = this.chave(assinaturaId, moduloId);
    const atual = this.itens.get(chave);

    if (atual) {
      this.itens.set(chave, { ...atual, desabilitadoEm });
    }

    return wrapOk(undefined);
  }

  /**
   * Busca um vínculo específico entre assinatura e módulo.
   *
   * @param assinaturaId Assinatura alvo.
   * @param moduloId Módulo consultado.
   * @returns `Ok(vinculo | null)` quando a consulta é concluída.
   */
  async buscarModuloVinculado(
    assinaturaId: AssinaturaId,
    moduloId: ModuloId,
  ): Promise<Result<ModuloHabilitadoAssinatura | null, ErroApp>> {
    return wrapOk(this.itens.get(this.chave(assinaturaId, moduloId)) ?? null);
  }

  /**
   * Lista módulos ativos vinculados a uma assinatura.
   *
   * Regras atuais:
   * - o vínculo deve pertencer à assinatura informada;
   * - `desabilitadoEm` deve ser `null`.
   *
   * @param assinaturaId Assinatura alvo da consulta.
   * @returns `Ok` com a coleção de vínculos ativos.
   */
  async listarModulosAtivosDaAssinatura(
    assinaturaId: AssinaturaId,
  ): Promise<Result<ModuloHabilitadoAssinatura[], ErroApp>> {
    return wrapOk(
      [...this.itens.values()].filter(
        (item) => item.assinaturaId === assinaturaId && item.desabilitadoEm === null,
      ),
    );
  }
}

/**
 * Implementação em memória da porta `PlanosConsultaRepositorio`.
 *
 * Esta classe mantém um catálogo simples de planos ativos/inativos para
 * testes do domínio de assinaturas.
 */
export class PlanosConsultaRepositorioMemoria implements PlanosConsultaRepositorio {
  /** Armazena planos indexados por `planoId`. */
  private readonly planos = new Map<PlanoId, ValidarPlanoAtivoResult>();

  /**
   * Define ou sobrescreve o estado de um plano no repositório em memória.
   *
   * @param planoId Identificador do plano.
   * @param ativo Indica se o plano deve ser considerado ativo.
   */
  definirPlano(planoId: PlanoId, ativo = true): void {
    this.planos.set(planoId, { planoId, ativo });
  }

  /**
   * Consulta se um plano existe e qual é seu estado de ativação.
   *
   * @param planoId Identificador do plano.
   * @returns `Ok(plano | null)` quando a consulta é concluída.
   */
  async validarPlanoAtivo(planoId: PlanoId): Promise<Result<ValidarPlanoAtivoResult | null, ErroApp>> {
    return wrapOk(this.planos.get(planoId) ?? null);
  }
}

/**
 * Implementação em memória da porta `ModulosConsultaRepositorio`.
 *
 * Esta classe mantém:
 * - catálogo de módulos conhecidos;
 * - subconjunto de módulos gratuitos.
 *
 * É útil para testes das regras comerciais de assinatura e habilitação.
 */
export class ModulosConsultaRepositorioMemoria implements ModulosConsultaRepositorio {
  /** Catálogo de módulos conhecidos indexados por `moduloId`. */
  private readonly modulos = new Map<ModuloId, ValidarModuloExistenteResult>();
  /** Conjunto de módulos marcados como gratuitos. */
  private readonly modulosGratis = new Set<ModuloId>();

  /**
   * Define ou sobrescreve o estado de um módulo no catálogo em memória.
   *
   * @param moduloId Identificador do módulo.
   * @param ativo Indica se o módulo deve ser considerado ativo.
   */
  definirModulo(moduloId: ModuloId, ativo = true): void {
    this.modulos.set(moduloId, { moduloId, ativo });
  }

  /**
   * Marca um módulo como gratuito.
   *
   * Se o módulo ainda não existir no catálogo, ele é criado automaticamente
   * como ativo.
   *
   * @param moduloId Identificador do módulo gratuito.
   */
  definirModuloGratis(moduloId: ModuloId): void {
    this.modulosGratis.add(moduloId);
    if (!this.modulos.has(moduloId)) {
      this.modulos.set(moduloId, { moduloId, ativo: true });
    }
  }

  /**
   * Consulta se um módulo existe e qual é seu estado de ativação.
   *
   * @param moduloId Identificador do módulo.
   * @returns `Ok(modulo | null)` quando a consulta é concluída.
   */
  async validarModuloAtivo(moduloId: ModuloId): Promise<Result<ValidarModuloExistenteResult | null, ErroApp>> {
    return wrapOk(this.modulos.get(moduloId) ?? null);
  }

  /**
   * Lista módulos atualmente marcados como gratuitos.
   *
   * @returns `Ok` com a coleção de módulos gratuitos materializada.
   */
  async listarModulosGratis(): Promise<Result<ListarModulosGratisResult[], ErroApp>> {
    return wrapOk([...this.modulosGratis].map((moduloId) => ({ moduloId })));
  }
}
