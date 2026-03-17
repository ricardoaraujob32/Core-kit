import { randomUUID } from "node:crypto";
import { wrapOk } from "../kernel/ROPHelpers";
import type { Result } from "../kernel/result";
import type { ErroApp } from "../kernel/erros";
import type {
  Assinatura,
  AssinaturaId,
  AssinaturasRepositorio as IAssinaturasRepositorio,
  AssinaturasModulosRepositorio as IAssinaturasModulosRepositorio,
  ListarModulosGratisResult,
  ModuloHabilitadoAssinatura,
  ModuloId,
  PlanoId,
  RegistrarAssinaturaParams,
  RegistrarModuloAssinaturaParams,
  ValidarModuloExistenteResult,
  ValidarPlanoAtivoResult,
} from "./tipos";
import type {
  AssinaturasRepositorio,
  AssinaturasModulosRepositorio,
  ModulosConsultaRepositorio,
  PlanosConsultaRepositorio,
} from "./portasRepositorio";

export class AssinaturasRepositorioMemoria implements AssinaturasRepositorio {
  private readonly itens = new Map<AssinaturaId, Assinatura>();

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

  async atualizarAssinatura(assinatura: Assinatura): Promise<Result<Assinatura, ErroApp>> {
    this.itens.set(assinatura.assinaturaId, assinatura);
    return wrapOk(assinatura);
  }

  async buscarPorId(assinaturaId: AssinaturaId): Promise<Result<Assinatura | null, ErroApp>> {
    return wrapOk(this.itens.get(assinaturaId) ?? null);
  }

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

export class AssinaturasModulosRepositorioMemoria implements AssinaturasModulosRepositorio {
  private readonly itens = new Map<string, ModuloHabilitadoAssinatura>();

  private chave(assinaturaId: AssinaturaId, moduloId: ModuloId): string {
    return `${assinaturaId}::${moduloId}`;
  }

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

  async buscarModuloVinculado(
    assinaturaId: AssinaturaId,
    moduloId: ModuloId,
  ): Promise<Result<ModuloHabilitadoAssinatura | null, ErroApp>> {
    return wrapOk(this.itens.get(this.chave(assinaturaId, moduloId)) ?? null);
  }

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

export class PlanosConsultaRepositorioMemoria implements PlanosConsultaRepositorio {
  private readonly planos = new Map<PlanoId, ValidarPlanoAtivoResult>();

  definirPlano(planoId: PlanoId, ativo = true): void {
    this.planos.set(planoId, { planoId, ativo });
  }

  async validarPlanoAtivo(planoId: PlanoId): Promise<Result<ValidarPlanoAtivoResult | null, ErroApp>> {
    return wrapOk(this.planos.get(planoId) ?? null);
  }
}

export class ModulosConsultaRepositorioMemoria implements ModulosConsultaRepositorio {
  private readonly modulos = new Map<ModuloId, ValidarModuloExistenteResult>();
  private readonly modulosGratis = new Set<ModuloId>();

  definirModulo(moduloId: ModuloId, ativo = true): void {
    this.modulos.set(moduloId, { moduloId, ativo });
  }

  definirModuloGratis(moduloId: ModuloId): void {
    this.modulosGratis.add(moduloId);
    if (!this.modulos.has(moduloId)) {
      this.modulos.set(moduloId, { moduloId, ativo: true });
    }
  }

  async validarModuloAtivo(moduloId: ModuloId): Promise<Result<ValidarModuloExistenteResult | null, ErroApp>> {
    return wrapOk(this.modulos.get(moduloId) ?? null);
  }

  async listarModulosGratis(): Promise<Result<ListarModulosGratisResult[], ErroApp>> {
    return wrapOk([...this.modulosGratis].map((moduloId) => ({ moduloId })));
  }
}